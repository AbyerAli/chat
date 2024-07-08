const express = require("express");
const authRouter = express.Router();
require("querystring");
require("./../../../database/model/users");
const cassandraClient = require("../../../database/connection");
const srvConfig = require("../../../config");


authRouter.post('/messages', (req, res) => {
    const query = `SELECT * FROM ${srvConfig.CASSANDRA_KEYSPACE}.messages LIMIT 50`;

    cassandraClient.execute(query, { prepare: true })
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.error('Failed to fetch messages:', error);
            res.status(500).send('An error occurred while fetching messages.');
        });
})

module.exports = authRouter;
