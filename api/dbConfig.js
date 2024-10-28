require("dotenv").config();
const sql = require("mssql");

const isProduction = process.env.NODE_ENV === "production";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: isProduction, // Use encryption if in production
    trustServerCertificate: true, // Change to false if using trusted certificates
  }
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("Database connection failed", err);
    throw err;
  }
}

module.exports = { connectDB, sql };
