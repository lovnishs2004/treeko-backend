const express = require("express");
const router = express.Router();
const Message = require("./message");

// =======================
// SEND MESSAGE
// =======================
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({
        message: "Sender, receiver and message are required",
      });
    }

    const msg = new Message({
      sender: sender.toLowerCase(),
      receiver: receiver.toLowerCase(),
      text,
    });

    await msg.save();

    res.status(201).json(msg);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not send message",
    });
  }
});

// =======================
// GET INBOX
// =======================
router.get("/inbox/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const messages = await Message.find({
      $or: [
        { sender: email },
        { receiver: email }
      ]
    }).sort({ createdAt: -1 });

    const latestConversations = {};

    messages.forEach((msg) => {
      const otherUser =
        msg.sender === email
          ? msg.receiver
          : msg.sender;

      if (!latestConversations[otherUser]) {
        latestConversations[otherUser] = {
          otherUser,
          text: msg.text,
          sender: msg.sender,
          receiver: msg.receiver,
          createdAt: msg.createdAt,
          isIncoming: msg.receiver === email,
        };
      }
    });

    res.json(Object.values(latestConversations));

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not fetch inbox",
    });
  }
});

// =======================
// GET CHAT BETWEEN 2 USERS
// =======================
router.get("/:user1/:user2", async (req, res) => {
  try {
    const user1 = req.params.user1.toLowerCase();
    const user2 = req.params.user2.toLowerCase();

    const messages = await Message.find({
      $or: [
        {
          sender: user1,
          receiver: user2,
        },
        {
          sender: user2,
          receiver: user1,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    res.json(messages);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Could not fetch chat",
    });
  }
});

module.exports = router;