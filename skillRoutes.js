const express = require("express");
const router = express.Router();
const Skill = require("./skillRequest");

// CREATE REQUEST
router.post("/", async (req, res) => {
  const skill = new Skill(req.body);
  await skill.save();
  res.json(skill);
});

// GET ALL REQUESTS
router.get("/", async (req, res) => {
  const skills = await Skill.find().sort({ createdAt: -1 });
  res.json(skills);
});

module.exports = router;