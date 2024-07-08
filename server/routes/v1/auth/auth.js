const express = require("express");
const authRouter = express.Router();
require("querystring");
require("./../../../database/model/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const cassandraClient = require("../../../database/connection");

authRouter.use(passport.initialize());
authRouter.use(passport.session());
authRouter.use(flash());

// Passport middleware for Authentication
passport.use(
  new LocalStrategy(function(username, password, done) {
    const query = "SELECT * FROM users WHERE username = ?";
    cassandraClient
      .execute(query, [username], { prepare: true })
      .then(result => {
        const user = result.first();
        if (!user) {
          return done(null, false, { message: "username-incorrect" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: "password-incorrect" });
        }
        return done(null, user);
      })
      .catch(err => done(err));
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.user_id); // Serialize by user_id
});

passport.deserializeUser(function(id, done) {
  const query = "SELECT * FROM users WHERE user_id = ?";
  cassandraClient
    .execute(query, [id], { prepare: true })
    .then(result => done(null, result.first()))
    .catch(err => done(err));
});

authRouter.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Username and/or password is incorrect." });
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.status(200).json({
        name: user.name,
        username: user.username,
        id: user.user_id,
        status: "OK"
      });
    });
  })(req, res, next);
});

authRouter.post("/register", async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(409).json({
      success: false,
      message: "All fields are required!"
    });
  }

  const queryFindUser = "SELECT * FROM users WHERE username = ?";
  cassandraClient
    .execute(queryFindUser, [username], { prepare: true })
    .then(async result => {
      if (result.rowLength > 0) {
        return res
          .status(303)
          .json({ success: false, message: "Username already exists!" });
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const queryCreateUser =
          "INSERT INTO users (user_id, username, password, created_at) VALUES (uuid(), ?, ?, toTimestamp(now()))";
        await cassandraClient.execute(
          queryCreateUser,
          [username, hashedPassword],
          { prepare: true }
        );
        return res.status(201).json({
          success: true,
          message: "User is successfully registered!",
          status: "OK"
        });
      }
    })
    .catch(err => res.json({ success: false, error: true, err }));
});

module.exports = authRouter;
