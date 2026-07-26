const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  requesterEmail: String,
  interestedEmail: String,
  skill: String
});

module.exports = mongoose.model("Connection", connectionSchema);