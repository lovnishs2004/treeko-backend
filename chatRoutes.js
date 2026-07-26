const express = require("express");
const router = express.Router();
const Message = require("./message");

// SEND MESSAGE
router.post("/", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

// GET INBOX FOR USER
router.get("/inbox/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const messages = await Message.find({
      $or: [
        { sender: email },
        { receiver: email }
      ]
    }).sort({ createdAt: -1 });

    const latestByUser = new Map();

    messages.forEach((message) => {
      const otherUser = message.sender === email ? message.receiver : message.sender;

      if (!latestByUser.has(otherUser)) {
        latestByUser.set(otherUser, {
          otherUser,
          text: message.text,
          createdAt: message.createdAt,
          sender: message.sender,
          receiver: message.receiver,
          isIncoming: message.receiver === email
        });
      }
    });

    res.json(Array.from(latestByUser.values()));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch inbox" });
  }
});

// GET CHAT
router.get("/:user1/:user2", async (req, res) => {
  const msgs = await Message.find({
    $or: [
      { sender: req.params.user1, receiver: req.params.user2 },
      { sender: req.params.user2, receiver: req.params.user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(msgs);
});

module.exports = router;
