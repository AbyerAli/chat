const srvConfig = require("../config");
const { Client } = require("cassandra-driver");
const fs = require("fs");
const path = require("path");

// Path to your secure connect bundle
const secureConnectBundlePath = path.resolve(
  __dirname,
  "./secure-connect-chat.zip"
);

const cassandraClient = new Client({
  cloud: { secureConnectBundle: secureConnectBundlePath },
  credentials: { username: "token", password: srvConfig.CASSANDRA_TOKEN },
  keyspace: srvConfig.CASSANDRA_KEYSPACE
});

// Connect to the cluster
cassandraClient.connect(err => {
  if (err) {
    console.error("There was an error connecting to Cassandra", err);
  } else {
    console.log("Connected to Cassandra");
  }
});

module.exports = cassandraClient;