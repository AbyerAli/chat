"use strict";
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const srvConfig = require("./config");
const mongoose = require("mongoose");
const { DB_URI } = srvConfig;
let server = http.createServer(app);
let messageHistory = [];

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
  mongoose.connect(
    DB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    e => {
      console.log(`Server started on port ${srvConfig.SERVER_PORT}`, e);
    }
  );
});

// io.on("connection", socket => {
//   // ... other event handlers ...

//   socket.on("send_message", data => {
//     // Include the sender's information with the message
//     const messageData = {
//       message: data.message,
//       senderId: socket.user.id, // Assuming you have the user's ID stored in the socket
//       senderName: socket.user.username // And the username
//     };
//     // Emit the message to all users in the room, including the sender
//     io.in(data.room).emit("receive_message", messageData);
//   });
// });

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
