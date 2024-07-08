"use strict";
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const srvConfig = require("./config");
const { Client } = require("cassandra-driver");
let server = http.createServer(app);
let messageHistory = [];

// Initialize Cassandra client
const cassandraClient = new Client({
  contactPoints: srvConfig.CASSANDRA_CONTACT_POINTS,
  localDataCenter: srvConfig.CASSANDRA_DATACENTER,
  keyspace: srvConfig.CASSANDRA_KEYSPACE,
  credentials: {
    username: srvConfig.CASSANDRA_USERNAME,
    password: srvConfig.CASSANDRA_PASSWORD
  }
});

// Connect to Cassandra
cassandraClient
  .connect()
  .then(() => console.log("Connected to Cassandra"))
  .catch(e => console.error("Connection to Cassandra failed", e));

// Export the Cassandra client
module.exports.cassandraClient = cassandraClient;

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(
  cors(),
  session({
    saveUninitialized: true,
    secret: srvConfig.SESSION_SECRET,
    resave: true
  }),
  cookieParser(),
  express.json()
);

app.use("/api", require("./routes/api"));

server.listen(srvConfig.SERVER_PORT, () => {
  console.log(`Server started on port ${srvConfig.SERVER_PORT}`);
});

io.on("connection", socket => {
  // Send the message history to the newly connected user
  socket.emit("message_history", messageHistory);

  socket.on("join_room", room => {
    socket.join(room);
    // Send the message history to the user for this specific room
    socket.emit(
      "message_history",
      messageHistory.filter(msg => msg.room === room)
    );
  });

  socket.on("send_message", data => {
    const messageData = {
      message: data.message,
      senderId: socket.handshake.auth.token, // Assuming you have the user's ID stored in the socket
      room: data.room
    };

    messageHistory.push(messageData);
    // Emit the message to all users in the room, including the sender
    io.in(data.room).emit("receive_message", messageData);
  });
});

// In your controllers, you can now require the cassandraClient and use it to perform database operations:

const { cassandraClient } = require("../path-to-cassandra-client");

// Example controller function
async function getMessages(req, res) {
  try {
    const result = await cassandraClient.execute("SELECT * FROM messages");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("An error occurred");
  }
}
