const express = require("express");
const Group = require("./group");
const GroupMessage = require("./groupMessage");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, createdBy, members } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: "Group name and creator are required" });
    }

    const uniqueMembers = [...new Set([createdBy, ...(members || [])])];

    const group = new Group({
      name,
      createdBy,
      members: uniqueMembers
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not create group" });
  }
});

router.get("/:email", async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.params.email
    }).sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch groups" });
  }
});

router.patch("/:groupId/members", async (req, res) => {
  try {
    const { requesterEmail, memberEmail } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy !== requesterEmail) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    if (!memberEmail) {
      return res.status(400).json({ message: "Member email is required" });
    }

    if (!group.members.includes(memberEmail)) {
      group.members.push(memberEmail);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not add member" });
  }
});

router.delete("/:groupId/members", async (req, res) => {
  try {
    const { requesterEmail, memberEmail } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy !== requesterEmail) {
      return res.status(403).json({ message: "Only group admin can remove members" });
    }

    if (memberEmail === group.createdBy) {
      return res.status(400).json({ message: "Admin cannot remove themselves from the group" });
    }

    group.members = group.members.filter((member) => member !== memberEmail);
    await group.save();

    res.json(group);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not remove member" });
  }
});

router.delete("/:groupId", async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.createdBy !== requesterEmail) {
      return res.status(403).json({ message: "Only group admin can delete the group" });
    }

    await GroupMessage.deleteMany({
      groupId: req.params.groupId
    });

    await Group.findByIdAndDelete(req.params.groupId);
    res.json({ message: "Group deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not delete group" });
  }
});

module.exports = router;
