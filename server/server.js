"use strict";
const express = require("express");
const app = express();
const http = require("http");
const srvConfig = require("./config");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
let server = http.createServer(app);
const cassandraClient = require("./database/connection");

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

server.listen(srvConfig.SERVER_PORT, async () => {
  try {
    console.log(`Server started on port ${srvConfig.SERVER_PORT}`);
  } catch (error) {
    console.error("Connection to Cassandra failed", error);
  }
});

io.on("connection", socket => {
  socket.on("join_room", room => {
    socket.join(room);
    // Fetch the message history for this specific room from the Cassandra database
    const query = `SELECT * FROM ${srvConfig.CASSANDRA_KEYSPACE}.messages WHERE room = ?`;
    cassandraClient
      .execute(query, [room], { prepare: true })
      .then(result => {
        // Send the message history to the user for this specific room
        socket.emit("message_history", result.rows);
      })
      .catch(error => {
        console.error(
          "Failed to fetch message history from Cassandra DB",
          error
        );
      });
  });

  socket.on("send_message", data => {
    console.log("Message received", data);

    // Define messageData outside of the promise chain
    const messageData = {
      message_text: data.message,
      user_id: socket.handshake.auth.token, // Assuming you have the user's ID stored in the socket
      room: data.room,
      created_at: new Date() // Add a timestamp for the message
    };

    // First, retrieve the user's name using the user_id
    const userQuery = `SELECT username FROM ${srvConfig.CASSANDRA_KEYSPACE}.users WHERE user_id = ?`;
    cassandraClient
      .execute(userQuery, [messageData.user_id], { prepare: true })
      .then(userResult => {
        // Check if user name is found
        if (userResult.rows.length > 0) {
          const userName = userResult.rows[0].username; // Assuming 'name' is the column with the user's name
          messageData.user_name = userName; // Add the user's name to the message data

          // Insert the message into the Cassandra database without the user's name
          const messageQuery = `INSERT INTO ${srvConfig.CASSANDRA_KEYSPACE}.messages (message_id, user_id, room, message_text, created_at) VALUES (uuid(), ?, ?, ?, ?)`;
          return cassandraClient.execute(
            messageQuery,
            [
              messageData.user_id,
              messageData.room,
              messageData.message_text,
              messageData.created_at
            ],
            { prepare: true }
          );
        } else {
          throw new Error("User not found");
        }
      })
      .then(() => {
        console.log("Message saved to Cassandra DB");
        // Emit the message to all users in the room, including the sender, with the user's name
        io.in(data.room).emit("receive_message", {
          message_text: messageData.message_text,
          user_name: messageData.user_name, // Send the user's name for display
          user_id: messageData.user_id,
          room: messageData.room,
          created_at: messageData.created_at
        });
      })
      .catch(error => {
        console.error(
          "Failed to save message to Cassandra DB or fetch user name",
          error
        );
      });
  });

  
});
