require("dotenv").config();
const express = require("express");
const { connectToDatabase } = require("./dbConfig"); // Adaptar para SQL Server
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const sendRecoveryEmail = require('./sendEmail');
const sql = require('mssql');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Configuração do CORS
app.use(cors({
  origin: 'https://sustenteco-app.onrender.com', // Origem do front-end sem a barra no final
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));

// Middleware para analisar JSON
app.use(express.json());

// Função para gerar código de recuperação
function generateRecoveryCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const recoveryCodes = {};

// Middleware para verificar JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token

  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido ou expirado" });
    req.user = user;
    next();
  });
}

// Conectar ao banco de dados antes de iniciar o servidor
connectToDatabase().then(pool => {
  console.log("Conexão com SQL Server realizada com sucesso");

  app.get("/", (req, res) => {
    res.send("hello");
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}).catch(err => {
  console.error("Erro ao conectar ao SQL Server:", err);
});

// Enviar código de recuperação
app.post('/api/users/send-recovery-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'O email é necessário.' });
  }

  const recoveryCode = generateRecoveryCode();
  recoveryCodes[email] = recoveryCode;

  const result = await sendRecoveryEmail(email, recoveryCode);

  if (result.success) {
    res.json({ message: 'Código de recuperação enviado com sucesso!' });
  } else {
    res.status(500).json({ message: 'Erro ao enviar o email de recuperação.', error: result.error });
  }
});

// Verificar código de recuperação
app.post('/api/users/verify-recovery-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'O email e o código são necessários.' });
  }

  if (recoveryCodes[email] && recoveryCodes[email] === code) {
    delete recoveryCodes[email];
    res.json({ valid: true, message: 'Código verificado com sucesso!' });
  } else {
    res.json({ valid: false, message: 'Código inválido. Por favor, tente novamente.' });
  }
});

// Resetar senha
app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email e nova senha são necessários.' });
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input('password', sql.NVarChar, hashedPassword)
      .input('email', sql.NVarChar, email)
      .query('UPDATE [User] SET password = @password WHERE email = @email');

    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar a senha:', error);
    res.status(500).json({ message: 'Erro ao atualizar a senha.' });
  }
});

// Registro de usuário
app.post("/api/users/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Por favor, preencha todos os campos" });
  }

  if (password.length < 6) {
    errors.push({ message: "A senha deve ter pelo menos 6 caracteres" });
  }

  if (password !== password2) {
    errors.push({ message: "As senhas não correspondem" });
  }

  if (errors.length > 0) {
    res.status(403).json({ register: { errors, name, email, password, password2 } });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM [User] WHERE email = @email');

      if (result.recordset.length > 0) {
        return res.status(403).json({ register: { message: "Email já registrado" } });
      }

      await pool.request()
        .input('name', sql.NVarChar, name)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .query('INSERT INTO [User] (name, email, password) VALUES (@name, @email, @password)');

      res.status(200).json({ res: "Success" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  }
});

// Login de usuário com JWT
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Por favor, forneça email e senha" });
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM [User] WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Falha na autenticação: Usuário não encontrado" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Falha na autenticação: Senha incorreta" });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 dias
    );

    res.status(200).json({ message: "Autenticação bem-sucedida", token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor durante o login" });
  }
});

// Exemplo de rota protegida para inserir um recorde
app.post("/api/record/crossworld", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { tempo_record } = req.body;

  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('id_usuario', sql.Int, id)
      .input('tempo_record', sql.Int, tempo_record)
      .query('INSERT INTO Crossworld (id_usuario, tempo_record, created_at) VALUES (@id_usuario, @tempo_record, GETDATE())');

    res.status(200).json({ res: "done", game: "Crossworld" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao registrar o record" });
  }
});

// Inserir record no jogo Ecopuzzle
app.post("/api/record/ecopuzzle", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { tempo_record } = req.body;

  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('id_usuario', sql.Int, id)
      .input('tempo_record', sql.Int, tempo_record)
      .query('INSERT INTO Ecopuzzle (id_usuario, tempo_record, created_at) VALUES (@id_usuario, @tempo_record, GETDATE())');

    res.status(200).json({ res: "done", game: "Ecopuzzle" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao registrar o record no Ecopuzzle" });
  }
});

// Inserir record no jogo Hangame
app.post("/api/record/hangame", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { tempo_record, quantidade_erros } = req.body;

  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('id_usuario', sql.Int, id)
      .input('tempo_record', sql.Int, tempo_record)
      .input('quantidade_erros', sql.Int, quantidade_erros)
      .query('INSERT INTO Hangame (id_usuario, tempo_record, quantidade_erros, created_at) VALUES (@id_usuario, @tempo_record, @quantidade_erros, GETDATE())');

    res.status(200).json({ res: "done", game: "Hangame" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao registrar o record no Hangame" });
  }
});

// Inserir record no jogo Quiz
app.post("/api/record/quiz", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { tempo_record, quantidade_erros } = req.body;

  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('id_usuario', sql.Int, id)
      .input('tempo_record', sql.Int, tempo_record)
      .input('quantidade_erros', sql.Int, quantidade_erros)
      .query('INSERT INTO Quiz (id_usuario, tempo_record, quantidade_erros, created_at) VALUES (@id_usuario, @tempo_record, @quantidade_erros, GETDATE())');

    res.status(200).json({ res: "done", game: "Quiz" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao registrar o record no Quiz" });
  }
});

// Pegar informações do perfil do usuário (jogos completos, desafios vencidos, tempo total)
app.get("/api/perfil/info", authenticateToken, async (req, res) => {
  const { id } = req.user;

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id_usuario', sql.Int, id)
      .query(`
        SELECT 
          u.id AS usuario_id,
          u.name AS usuario_nome,

          -- Jogos Completos: conta o número de vezes que o usuário jogou cada um dos quatro jogos
          CASE 
            WHEN e.jogos_ecopuzzle <= c.jogos_crossworld AND e.jogos_ecopuzzle <= q.jogos_quiz AND e.jogos_ecopuzzle <= h.jogos_hangame THEN e.jogos_ecopuzzle
            WHEN c.jogos_crossworld <= e.jogos_ecopuzzle AND c.jogos_crossworld <= q.jogos_quiz AND c.jogos_crossworld <= h.jogos_hangame THEN c.jogos_crossworld
            WHEN q.jogos_quiz <= e.jogos_ecopuzzle AND q.jogos_quiz <= c.jogos_crossworld AND q.jogos_quiz <= h.jogos_hangame THEN q.jogos_quiz
            ELSE h.jogos_hangame
          END AS jogos_completos,

          -- Desafios Vencidos: soma o número total de jogos jogados pelo usuário
          COALESCE(e.jogos_ecopuzzle, 0) + COALESCE(c.jogos_crossworld, 0) + COALESCE(q.jogos_quiz, 0) + COALESCE(h.jogos_hangame, 0) AS desafios_vencidos,

          -- Tempo Total: soma o tempo total gasto em todos os jogos pelo usuário
          COALESCE(e.tempo_total_ecopuzzle, 0) + COALESCE(c.tempo_total_crossworld, 0) + COALESCE(q.tempo_total_quiz, 0) + COALESCE(h.tempo_total_hangame, 0) AS tempo_total_jogos

        FROM [User] u
        LEFT JOIN (
          SELECT id_usuario, COUNT(*) AS jogos_ecopuzzle, SUM(tempo_record) AS tempo_total_ecopuzzle
          FROM Ecopuzzle
          GROUP BY id_usuario
        ) e ON u.id = e.id_usuario
        LEFT JOIN (
          SELECT id_usuario, COUNT(*) AS jogos_crossworld, SUM(tempo_record) AS tempo_total_crossworld
          FROM Crossworld
          GROUP BY id_usuario
        ) c ON u.id = c.id_usuario
        LEFT JOIN (
          SELECT id_usuario, COUNT(*) AS jogos_quiz, SUM(tempo_record) AS tempo_total_quiz
          FROM Quiz
          GROUP BY id_usuario
        ) q ON u.id = q.id_usuario
        LEFT JOIN (
          SELECT id_usuario, COUNT(*) AS jogos_hangame, SUM(tempo_record) AS tempo_total_hangame
          FROM Hangame
          GROUP BY id_usuario
        ) h ON u.id = h.id_usuario
        WHERE u.id = @id_usuario
      `);

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar informações do perfil" });
  }
});

// Rota fake de GET para manter a conexão (opcional)
app.get('/api/get', async (req, res) => {
  res.status(200).json({ message: "Conexão ativa" });
});
