const LocalStrategy = require("passport-local").Strategy;
const { connectDB, sql } = require("./dbConfig");
const bcrypt = require("bcrypt");

async function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const pool = await connectDB();

    try {
      const result = await pool.request()
        .input("email", sql.VarChar, email)
        .query(`SELECT * FROM [User] WHERE email = @email`);

      if (result.recordset.length > 0) {
        const user = result.recordset[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.log(err);
          }
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password is incorrect" });
          }
        });
      } else {
        return done(null, false, { message: "No user with that email address" });
      }
    } catch (err) {
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
    const pool = await connectDB();

    try {
      const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`SELECT * FROM [User] WHERE id = @id`);

      if (result.recordset.length > 0) {
        return done(null, result.recordset[0]);
      } else {
        return done(new Error("User not found"));
      }
    } catch (err) {
      return done(err);
    }
  });
}

module.exports = initialize;
