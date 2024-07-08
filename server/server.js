"use strict";
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const srvConfig = require("./config");
let server = http.createServer(app);
const { Client } = require("cassandra-driver");
const fs = require("fs");
const path = require("path");

let messageHistory = [];

// Path to your secure connect bundle
const secureConnectBundlePath = path.resolve(
  __dirname,
  "./secure-connect-chat.zip"
);

const cassandraClient = new Client({
  cloud: { secureConnectBundle: secureConnectBundlePath },
  credentials: { username: "token", password: srvConfig.CASSANDRA_TOKEN }
});

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

// Connect to Cassandra
cassandraClient
  .connect()
  .then(() => {
    console.log("Connected to Cassandra")

  })
  .catch(e => console.error("Connection to Cassandra failed", e));


server.listen(srvConfig.SERVER_PORT, async () => {
  try {
    console.log(`Server started on port ${srvConfig.SERVER_PORT}`);
  } catch (error) {
    console.error("Connection to Cassandra failed", error);
  }

});

module.exports.cassandraClient = cassandraClient;

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
