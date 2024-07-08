const express = require("express");
const authRouter = express.Router();
require('querystring');
const mongoose = require('mongoose');
require('./../../../database/model/users');
const db = mongoose.connection;
const Users = mongoose.model('Users');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const authenticationMiddleware = require('./../../../middleware/authenticationMiddleware');
const bcrypt = require('bcryptjs');

authRouter.use(passport.initialize());
authRouter.use(passport.session());
authRouter.use(flash());

//Passport middleware for Authentication
passport.use(new LocalStrategy(
    function (username, password, done) {
        Users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'username-incorrect'});
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'password-incorrect'});
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});



authRouter.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({ message: 'Username and/or password is incorrect.' });
        }
        req.logIn(user, function (err) {
            if (err) return next(err);

            return res.status(200).json({
                name: req.session.passport.user.name,
                username: req.session.passport.user.username,
                id: req.session.passport.user._id,
                status: 'OK'
            });
        });
    })(req, res, next);
});

authRouter.post('/register', async (req, res) => {
    let {name, username, password} = req.body;

    if (!name || !username || !password) return res.status(409).json({
        success: false,
        message: 'All fields are required!'
    });

    await Users.findOne({username: username}, async function (err, user) {
        if (err) return res.json({success: false, error: true});
        if (user) return res.status(303).json({success: false, message: 'Username already exist!'});

        const salt = bcrypt.genSaltSync(10);
        const newUser = new Users({
            name: name,
            username: username,
            password: bcrypt.hashSync(password, salt),
        });

        await newUser.save(function (err) {
            if (err) return console.error(err);
        });

        return res.status(201).json({
            success: true,
            message: 'User is successfully registered!'
        });
    });
});


authRouter.get('/username-availability', async (req, res) => {
    let username = req.query.username;
    if (!username || username === '') return res.json({
        error: true,
        message: 'Username can\'t be empty!'
    });

    return Users.findOne({username: username}, function (err, user) {
            if (err) return res.json({
                error: true
            });

            return res.json({
                usernameAvailable: (!user),
            });
        }
    );
});

/**
 * @typedef ResponseAuthenticatedRouteJSON
 * @property {string} username - user's username - eg: janet
 * @property {string} message - message - eg: This is a authenticated route!
 */
/**
 * Dashboard endpoint only allowed for authenticated users
 * @route GET /api/v1/auth/dashboard
 * @group Auth
 * @returns {ResponseAuthenticatedRouteJSON.model} 200
 * @produces application/json
 */
authRouter.get('/dashboard', authenticationMiddleware(), (req, res) => {
    return res.json({
        username: req.session.passport.user.username,
        message: 'This is a authenticated route!'
    });
});


/**
 * @typedef ResponseSuccessLogoutJSON
 * @property {boolean} success
 */
/**
 * @route GET /api/v1/auth/logout
 * @group Auth
 * @returns {ResponseSuccessLogoutJSON.model} 200 - Logout successfully
 * @produces application/json
 */
authRouter.get('/logout', function (req, res) {
    req.logout();
    res.json({
        success: true
    });
});

module.exports = authRouter;
