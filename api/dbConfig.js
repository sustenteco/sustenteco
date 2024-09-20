require("dotenv").config();
const sql = require("mssql");

const isProduction = process.env.NODE_ENV === "production";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST, // ou 'localhost' se for local
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10), // Converte a porta para número
  options: {
    encrypt: true, // Para conexões seguras, use 'false' se não usar SSL
    trustServerCertificate: !isProduction // Se estiver em ambiente de desenvolvimento
  }
};

async function connectToDatabase() {
  try {
    // Faz a conexão com o banco de dados
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("Erro ao conectar ao SQL Server:", err);
  }
}

module.exports = { connectToDatabase };
