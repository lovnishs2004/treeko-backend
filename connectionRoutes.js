const express = require("express");
const router = express.Router();
const Connection = require("./connection");

// INTERESTED
router.post("/", async (req, res) => {
  const existing = await Connection.findOne({
    $or: [
      {
        requesterEmail: req.body.requesterEmail,
        interestedEmail: req.body.interestedEmail
      },
      {
        requesterEmail: req.body.interestedEmail,
        interestedEmail: req.body.requesterEmail
      }
    ]
  });

  if (existing) {
    return res.json({ message: "Already connected" });
  }

  const conn = new Connection(req.body);
  await conn.save();
  res.json({ message: "Connected!" });
});

// GET USER CONNECTIONS
router.get("/:email", async (req, res) => {
  const data = await Connection.find({
    $or: [
      { requesterEmail: req.params.email },
      { interestedEmail: req.params.email }
    ]
  });
  res.json(data);
});

module.exports = router;
