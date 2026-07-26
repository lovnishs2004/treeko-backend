const mongoose = require("mongoose");

const skillRequestSchema = new mongoose.Schema({
  name: String, // user name
  email: String,
  skill: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SkillRequest", skillRequestSchema);