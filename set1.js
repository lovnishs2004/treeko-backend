const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  contactNumber: String,
  linkedin: String,
  course: String,
  bio: String,
  photo: String,
  skill: String
});

module.exports = mongoose.model("User", userSchema);
