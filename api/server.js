require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const cors = require('cors');
const sendRecoveryEmail = require('./sendEmail');
const { connectDB, sql } = require("./dbConfig");
const jwt = require('jsonwebtoken')

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");
initializePassport(passport);

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.send("hello");
});

function generateRecoveryCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const recoveryCodes = {};

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

app.post('/api/users/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email e nova senha são necessários.' });
  }

  const pool = await connectDB();

  try {
    const userQuery = await pool.request()
      .input("email", sql.VarChar, email)
      .query(`SELECT * FROM [User] WHERE email = @email`);

    if (userQuery.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(`UPDATE [User] SET password = @password WHERE email = @email`);

    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar a senha:', error);
    res.status(500).json({ message: 'Erro ao atualizar a senha.' });
  }
});

app.post("/api/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.status(403).json({ "register": { errors, name, email, password, password2 } });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await connectDB();

    try {
      const userCheck = await pool.request()
        .input("email", sql.VarChar, email)
        .query(`SELECT * FROM [User] WHERE email = @email`);

      if (userCheck.recordset.length > 0) {
        return res.status(403).json({ "register": { message: "Email already registered" } });
      } else {
        await pool.request()
          .input("name", sql.VarChar, name)
          .input("email", sql.VarChar, email)
          .input("password", sql.VarChar, hashedPassword)
          .query(`INSERT INTO [User] (name, email, password) VALUES (@name, @email, @password)`);

        res.status(200).json({ "res": "Success" });
      }
    } catch (err) {
      res.status(500).json({ message: "Database error", error: err });
    }
  }
});

const extractBearerToken = headerValue => {
  if (typeof headerValue !== 'string') {
    return false
  }

  const matches = headerValue.match(/(bearer)\s+(\S+)/i)
  return matches && matches[2]
}

// The middleware
const checkTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ message: 'need a token' })
  }

  jwt.verify(token, process.env.SESSION_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'bad token' })
    }
  })

  next()
}

async function queryLogin(email, password) {
  const pool = await connectDB();

  return new Promise((resolve, reject) => {
    // Supondo que a pool esteja configurada usando o pacote 'mssql'
    pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM [User] WHERE email = @email', (err, results) => {
        if (err) {
          reject(err); // Erro ao fazer a query
        }

        if (results.recordset.length > 0) {
          const user = results.recordset[0];

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              reject(err); // Erro ao comparar as senhas
            }
            if (isMatch) {
              resolve(user); // Senha correta
            } else {
              resolve(null); // Senha incorreta
            }
          });
        } else {
          // Nenhum usuário encontrado com o email fornecido
          resolve(null);
        }
      });
  });
}

app.post('/api/users/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'enter the correct email and password' })
  }

  const user = await queryLogin(req.body.email, req.body.password)

  if (!user) {
    return res.status(400).json({ message: 'wrong login or password' })
  }

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
  }, process.env.SESSION_SECRET, { expiresIn: '3 hours' })

  res.json({ access_token: token })
})

app.get('/api/isLogged', checkTokenMiddleware, (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const decoded = jwt.decode(token, { complete: false })
  res.json(decoded)
})

app.post("/api/record/crossworld", checkTokenMiddleware, async (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const { id, ...user } = jwt.decode(token, { complete: false })
  const { tempo_record } = req.body;
  const pool = await connectDB();

  try {
    await pool.request()
      .input("id_usuario", sql.Int, id)
      .input("tempo_record", sql.Int, tempo_record)
      .query(`INSERT INTO [Crossworld] (id_usuario, tempo_record, created_at)
              VALUES (@id_usuario, @tempo_record, CURRENT_TIMESTAMP)`);

    res.status(200).json({ "res": "done", "game": "Crossworld" });
  } catch (err) {
    throw err;
  }
});

app.post("/api/record/ecopuzzle", checkTokenMiddleware, async (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const { id, ...user } = jwt.decode(token, { complete: false })
  const { tempo_record } = req.body;
  const pool = await connectDB();

  try {
    await pool.request()
      .input("id_usuario", sql.Int, id)
      .input("tempo_record", sql.Int, tempo_record)
      .query(`INSERT INTO [Ecopuzzle] (id_usuario, tempo_record, created_at)
              VALUES (@id_usuario, @tempo_record, CURRENT_TIMESTAMP)`);

    res.status(200).json({ "res": "done", "game": "Ecopuzzle" });
  } catch (err) {
    throw err;
  }
});

app.post("/api/record/hangame", checkTokenMiddleware, async (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const { id, ...user } = jwt.decode(token, { complete: false })
  const { tempo_record, quantidade_erros } = req.body;
  const pool = await connectDB();

  try {
    await pool.request()
      .input("id_usuario", sql.Int, id)
      .input("tempo_record", sql.Int, tempo_record)
      .input("quantidade_erros", sql.Int, quantidade_erros)
      .query(`INSERT INTO [Hangame] (id_usuario, tempo_record, quantidade_erros, created_at)
              VALUES (@id_usuario, @tempo_record, @quantidade_erros, CURRENT_TIMESTAMP)`);

    res.status(200).json({ "res": "done", "game": "Hangame" });
  } catch (err) {
    throw err;
  }
});

app.post("/api/record/quiz", checkTokenMiddleware, async (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const { id, ...user } = jwt.decode(token, { complete: false })
  const { tempo_record, quantidade_erros } = req.body;
  const pool = await connectDB();

  try {
    await pool.request()
      .input("id_usuario", sql.Int, id)
      .input("tempo_record", sql.Int, tempo_record)
      .input("quantidade_erros", sql.Int, quantidade_erros)
      .query(`INSERT INTO [Quiz] (id_usuario, tempo_record, quantidade_erros, created_at)
              VALUES (@id_usuario, @tempo_record, @quantidade_erros, CURRENT_TIMESTAMP)`);

    res.status(200).json({ "res": "done", "game": "Quiz" });
  } catch (err) {
    throw err;
  }
});

app.get("/api/perfil/info", checkTokenMiddleware, async (req, res) => {
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)
  const { id, ...user } = jwt.decode(token, { complete: false })
  const pool = await connectDB();

  try {
    const ecopuzzleRanking = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
      WITH ranked AS (
        SELECT 
            u.id,
            RANK() OVER (ORDER BY MIN(e.tempo_record) ASC) AS posicao,
            u.name AS nome,
            MIN(e.tempo_record) AS tempo
        FROM 
            Ecopuzzle e
        JOIN 
            [User] u ON e.id_usuario = u.id
        GROUP BY 
            u.id, u.name
      )
      SELECT *
      FROM ranked
      WHERE id = @id`);

    const crossworldRanking = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
        WITH ranked AS (
          SELECT 
              u.id,
              RANK() OVER (ORDER BY MIN(c.tempo_record) ASC) AS posicao,
              u.name AS nome,
              MIN(c.tempo_record) AS tempo
          FROM 
              Crossworld c
          JOIN 
              [User] u ON c.id_usuario = u.id
          GROUP BY 
              u.id, u.name
        )
        SELECT *
        FROM ranked
        WHERE id = @id`);

    const quizRanking = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
          WITH ranked AS (
          SELECT 
              u.id,
              u.name AS nome,
    		  q.quantidade_erros,
    		  q.tempo_record,
    		  RANK() OVER (PARTITION BY u.id ORDER BY q.quantidade_erros, q.tempo_record) AS posicao
          FROM 
              Quiz q
          JOIN 
              [User] u ON q.id_usuario = u.id
		  GROUP BY 
   			  u.id, u.name, q.quantidade_erros, q.tempo_record
        ),
        BestAttempts AS (
  SELECT
    id,
    nome,
    MIN(CASE WHEN posicao = 1 THEN tempo_record END) AS tempo,
    MIN(CASE WHEN posicao = 1 THEN quantidade_erros END) AS erros
  FROM
    ranked
  GROUP BY
    id, nome
),
FinalRanking AS (
  SELECT
    RANK() OVER (ORDER BY erros, tempo) AS posicao,
    *
  FROM
    BestAttempts
)
SELECT * FROM FinalRanking
WHERE id = @id;`);

    const hangameRanking = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
            WITH ranked AS (
          SELECT 
              u.id,
              u.name AS nome,
    		  h.quantidade_erros,
    		  h.tempo_record,
    		  RANK() OVER (PARTITION BY u.id ORDER BY h.quantidade_erros, h.tempo_record) AS posicao
          FROM 
              Hangame h
          JOIN 
              [User] u ON h.id_usuario = u.id
		  GROUP BY 
   			  u.id, u.name, h.quantidade_erros, h.tempo_record
        ),
        BestAttempts AS (
  SELECT
    id,
    nome,
    MIN(CASE WHEN posicao = 1 THEN tempo_record END) AS tempo,
    MIN(CASE WHEN posicao = 1 THEN quantidade_erros END) AS erros
  FROM
    ranked
  GROUP BY
    id, nome
),
FinalRanking AS (
  SELECT
    RANK() OVER (ORDER BY erros, tempo) AS posicao,
    *
  FROM
    BestAttempts
)
SELECT * FROM FinalRanking
WHERE id = @id`);

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
              SELECT 
              u.id AS usuario_id,
              u.name AS usuario_nome,
              LEAST(
                  COALESCE(e.jogos_ecopuzzle, 0),
                  COALESCE(c.jogos_crossworld, 0),
                  COALESCE(q.jogos_quiz, 0),
                  COALESCE(h.jogos_hangame, 0)
              ) AS jogos_completos,
              COALESCE(e.jogos_ecopuzzle, 0) + COALESCE(c.jogos_crossworld, 0) + 
              COALESCE(q.jogos_quiz, 0) + COALESCE(h.jogos_hangame, 0) AS desafios_vencidos,
              COALESCE(e.tempo_total_ecopuzzle, 0) + COALESCE(c.tempo_total_crossworld, 0) + 
              COALESCE(q.tempo_total_quiz, 0) + COALESCE(h.tempo_total_hangame, 0) AS tempo_total_jogos,
              CASE 
                  WHEN COALESCE(e.jogos_ecopuzzle, 0) >= COALESCE(c.jogos_crossworld, 0) AND 
                       COALESCE(e.jogos_ecopuzzle, 0) >= COALESCE(q.jogos_quiz, 0) AND 
                       COALESCE(e.jogos_ecopuzzle, 0) >= COALESCE(h.jogos_hangame, 0) THEN 'Ecopuzzle'
                  WHEN COALESCE(c.jogos_crossworld, 0) >= COALESCE(e.jogos_ecopuzzle, 0) AND 
                       COALESCE(c.jogos_crossworld, 0) >= COALESCE(q.jogos_quiz, 0) AND 
                       COALESCE(c.jogos_crossworld, 0) >= COALESCE(h.jogos_hangame, 0) THEN 'Crossworld'
                  WHEN COALESCE(q.jogos_quiz, 0) >= COALESCE(e.jogos_ecopuzzle, 0) AND 
                       COALESCE(q.jogos_quiz, 0) >= COALESCE(c.jogos_crossworld, 0) AND 
                       COALESCE(q.jogos_quiz, 0) >= COALESCE(h.jogos_hangame, 0) THEN 'GreenGenius'
                  ELSE 'Hangame'
              END AS jogo_mais_jogado
              FROM [User] u
              LEFT JOIN (
                SELECT id_usuario, COUNT(*) AS jogos_ecopuzzle, SUM(tempo_record) AS tempo_total_ecopuzzle
                FROM [Ecopuzzle]
                GROUP BY id_usuario
              ) e ON u.id = e.id_usuario
              LEFT JOIN (
                SELECT id_usuario, COUNT(*) AS jogos_crossworld, SUM(tempo_record) AS tempo_total_crossworld
                FROM [Crossworld]
                GROUP BY id_usuario
              ) c ON u.id = c.id_usuario
              LEFT JOIN (
                SELECT id_usuario, COUNT(*) AS jogos_quiz, SUM(tempo_record) AS tempo_total_quiz
                FROM [Quiz]
                GROUP BY id_usuario
              ) q ON u.id = q.id_usuario
              LEFT JOIN (
                SELECT id_usuario, COUNT(*) AS jogos_hangame, SUM(tempo_record) AS tempo_total_hangame
                FROM [Hangame]
                GROUP BY id_usuario
              ) h ON u.id = h.id_usuario
              WHERE u.id = @id;
            `);


    res.status(200).json({
      baseInfo: result.recordset[0],
      positions: {
        ecopuzzle: ecopuzzleRanking.recordset[0],
        crossworld: crossworldRanking.recordset[0],
        quiz: quizRanking.recordset[0],
        hangame: hangameRanking.recordset[0],
      }
    });
  } catch (err) {
    throw err;
  }
});

app.get("/api/ranking/ecopuzzle", checkTokenMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization);
    const { id, ...user } = jwt.decode(token, { complete: false });

    const pool = await sql.connect(/* sua configuração de conexão SQL Server */);

    const result = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
        WITH ranked AS (
          SELECT 
              u.id,
              RANK() OVER (ORDER BY MIN(e.tempo_record) ASC) AS posicao,
              u.name AS nome,
              MIN(e.tempo_record) AS tempo
          FROM 
              Ecopuzzle e
          JOIN 
              [User] u ON e.id_usuario = u.id
          GROUP BY 
              u.id, u.name
        )
        SELECT *
        FROM ranked
        WHERE id = @id
        UNION ALL
        SELECT TOP 10 *
        FROM ranked;
      `);

    req.flash("success_msg", "Query completed");
    res.status(200).json({
      userId: id,
      ranking: result.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
});

app.get("/api/ranking/crossworld", checkTokenMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization);
    const { id, ...user } = jwt.decode(token, { complete: false });

    const pool = await sql.connect(/* sua configuração de conexão SQL Server */);

    const result = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
        WITH ranked AS (
          SELECT 
              u.id,
              RANK() OVER (ORDER BY MIN(c.tempo_record) ASC) AS posicao,
              u.name AS nome,
              MIN(c.tempo_record) AS tempo
          FROM 
              Crossworld c
          JOIN 
              [User] u ON c.id_usuario = u.id
          GROUP BY 
              u.id, u.name
        )
        SELECT *
        FROM ranked
        WHERE id = @id
        UNION ALL
        SELECT TOP 10 *
        FROM ranked;
      `);

    req.flash("success_msg", "Query completed");
    res.status(200).json({
      userId: id,
      ranking: result.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
});

app.get("/api/ranking/quiz", checkTokenMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization);
    const { id, ...user } = jwt.decode(token, { complete: false });

    const pool = await sql.connect(/* sua configuração de conexão SQL Server */);

    const result = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`WITH ranked AS (
          SELECT 
              u.id,
              u.name AS nome,
    		  q.quantidade_erros,
    		  q.tempo_record,
    		  RANK() OVER (PARTITION BY u.id ORDER BY q.quantidade_erros, q.tempo_record) AS posicao
          FROM 
              Quiz q
          JOIN 
              [User] u ON q.id_usuario = u.id
		  GROUP BY 
   			  u.id, u.name, q.quantidade_erros, q.tempo_record
        ),
        BestAttempts AS (
  SELECT
    id,
    nome,
    MIN(CASE WHEN posicao = 1 THEN tempo_record END) AS tempo,
    MIN(CASE WHEN posicao = 1 THEN quantidade_erros END) AS erros
  FROM
    ranked
  GROUP BY
    id, nome
),
FinalRanking AS (
  SELECT
    RANK() OVER (ORDER BY erros, tempo) AS posicao,
    *
  FROM
    BestAttempts
)
SELECT * FROM FinalRanking
WHERE id = @id
UNION ALL
SELECT TOP 10 * FROM FinalRanking;`);

    req.flash("success_msg", "Query completed");
    res.status(200).json({
      userId: id,
      ranking: result.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
});


app.get("/api/ranking/hangame", checkTokenMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization && extractBearerToken(req.headers.authorization);
    const { id, ...user } = jwt.decode(token, { complete: false });

    const pool = await sql.connect(/* sua configuração de conexão SQL Server */);

    const result = await pool.request()
      .input('id', sql.Int, id)  // Ajuste o tipo conforme necessário
      .query(`
        WITH ranked AS (
          SELECT 
              u.id,
              u.name AS nome,
    		  h.quantidade_erros,
    		  h.tempo_record,
    		  RANK() OVER (PARTITION BY u.id ORDER BY h.quantidade_erros, h.tempo_record) AS posicao
          FROM 
              Hangame h
          JOIN 
              [User] u ON h.id_usuario = u.id
		  GROUP BY 
   			  u.id, u.name, h.quantidade_erros, h.tempo_record
        ),
        BestAttempts AS (
  SELECT
    id,
    nome,
    MIN(CASE WHEN posicao = 1 THEN tempo_record END) AS tempo,
    MIN(CASE WHEN posicao = 1 THEN quantidade_erros END) AS erros
  FROM
    ranked
  GROUP BY
    id, nome
),
FinalRanking AS (
  SELECT
    RANK() OVER (ORDER BY erros, tempo) AS posicao,
    *
  FROM
    BestAttempts
)
SELECT * FROM FinalRanking
WHERE id = @id
UNION ALL
SELECT TOP 10 * FROM FinalRanking;`);

    req.flash("success_msg", "Query completed");
    res.status(200).json({
      userId: id,
      ranking: result.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
