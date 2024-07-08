const express = require('express');
const init = express.Router();
const path = require('path');
const authRoute = require('./auth/auth')
const messageRoute = require('./message/message')

init.get("/", async function (req, res, next) {
    res.json({
        'version': 1.0,
        'name': 'Express.js & Socket.io API'
    });
});


/**
 * Configure here all routes
 */
init.use('/auth/', authRoute)
init.use('/messages', messageRoute)

module.exports = init
