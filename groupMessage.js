const mongoose = require("mongoose");

const groupMessageSchema = new mongoose.Schema({
  groupId: String,
  senderEmail: String,
  senderName: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
