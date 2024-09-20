const LocalStrategy = require("passport-local").Strategy;
const { connectToDatabase } = require("./dbConfig");
const bcrypt = require("bcrypt");
const sql = require("mssql"); // Adiciona a importação da biblioteca mssql

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = async (email, password, done) => {
    try {
      const pool = await connectToDatabase();

      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM [User] WHERE email = @email');

      if (result.recordset.length > 0) {
        const user = result.recordset[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error(err);
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password is incorrect" });
          }
        });
      } else {
        // No user
        return done(null, false, { message: "No user with that email address" });
      }
    } catch (err) {
      console.error(err);
      return done(err);
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const pool = await connectToDatabase();

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM [User] WHERE id = @id');

      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });
}

module.exports = initialize;
