const express = require("express");
const GroupMessage = require("./groupMessage");
const Group = require("./group");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const message = new GroupMessage(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not send group message" });
  }
});

router.get("/inbox/:email", async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.params.email
    }).sort({ createdAt: -1 });

    const inbox = await Promise.all(groups.map(async (group) => {
      const latestMessage = await GroupMessage.findOne({
        groupId: group._id.toString()
      }).sort({ createdAt: -1 });

      return {
        groupId: group._id,
        groupName: group.name,
        members: group.members,
        latestText: latestMessage?.text || "",
        latestSenderName: latestMessage?.senderName || "",
        latestSenderEmail: latestMessage?.senderEmail || "",
        createdAt: latestMessage?.createdAt || group.createdAt
      };
    }));

    inbox.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(inbox);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch group inbox" });
  }
});

router.get("/:groupId", async (req, res) => {
  try {
    const messages = await GroupMessage.find({
      groupId: req.params.groupId
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch group messages" });
  }
});

module.exports = router;
