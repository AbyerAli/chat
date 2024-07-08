const mongoose = require("mongoose");

// Message model (Message.js)
const messageSchema = new mongoose.Schema({
  room: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
}, {
    timestamps: true
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
