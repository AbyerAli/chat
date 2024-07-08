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
    // message_id uuid PRIMARY KEY,
    // created_at timestamp,
    // message_text text,
    // user_id uuid
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

io.on("connection", socket => {
  // ... other event handlers ...

  socket.on("send_message", data => {
    console.log("Message received", data);
    // First, retrieve the user's name using the user_id
    const userQuery = `SELECT name FROM ${srvConfig.CASSANDRA_KEYSPACE}.users WHERE user_id = ?`;
    cassandraClient
      .execute(userQuery, [socket.handshake.auth.token], { prepare: true })
      .then(userResult => {
        const userName = userResult.rows[0].name; // Assuming 'name' is the column with the user's name

        const messageData = {
          message_text: data.message,
          user_id: socket.handshake.auth.token,
          user_name: userName, // Add the user's name to the message data
          room: data.room,
          created_at: new Date()
        };

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
      })
      .then(() => {
        console.log("Message saved to Cassandra DB");
        // Emit the message to all users in the room, including the sender, with the user's name
        io.in(data.room).emit("receive_message", {
          message_text: messageData.message_text,
          user_name: messageData.user_name, // Send the user's name for display
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

socket.on("send_message", data => {
  const messageData = {
    message_text: data.message,
    user_id: socket.handshake.auth.token, // Assuming you have the user's ID stored in the socket
    room: data.room,
    created_at: new Date() // Add a timestamp for the message
  };

  // Insert the message into the Cassandra database
  const query = `INSERT INTO ${srvConfig.CASSANDRA_KEYSPACE}.messages (message_id, user_id, room, message_text, created_at) VALUES (uuid(), ?, ?, ?, ?)`;
  cassandraClient
    .execute(
      query,
      [
        messageData.user_id,
        messageData.room,
        messageData.message_text,
        messageData.created_at
      ],
      { prepare: true }
    )
    .then(() => {
      console.log("Message saved to Cassandra DB");
    })
    .catch(error => {
      console.error("Failed to save message to Cassandra DB", error);
    });

  // Emit the message to all users in the room, including the sender
  io.in(data.room).emit("receive_message", messageData);
});




io.on("connection", socket => {
  // ... other event handlers ...

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
    const userQuery = `SELECT name FROM ${srvConfig.CASSANDRA_KEYSPACE}.users WHERE user_id = ?`;
    cassandraClient
      .execute(userQuery, [messageData.user_id], { prepare: true })
      .then(userResult => {
        // Check if user name is found
        if (userResult.rows.length > 0) {
          const userName = userResult.rows[0].name; // Assuming 'name' is the column with the user's name
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
