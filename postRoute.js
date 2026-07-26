const express = require("express");
const router = express.Router();
const Post = require("./post");

// ✅ CREATE POST
router.post("/", async (req, res) => {
  try {
    const post = new Post({
      name: req.body.name,
      content: req.body.content
    });

    const savedPost = await post.save();
    res.json(savedPost);

  } catch (err) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// ✅ GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);

  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});
 
module.exports = router;