const express =require("express");
const app = express();
const mongoose = require("mongoose");
const cors=require("cors");
app.use(cors());

mongoose.connect("mongodb://localhost:27017/aa")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const User =require("./set1")
app.get("/", (req, res) => {
  res.send("Server + MongoDB Connected");
});


app.use(express.json());
app.post("/signup", async (req, res) => {
  try {
  const ff = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    contactNumber: req.body.contactNumber || "",
    linkedin: req.body.linkedin || "",
    course: req.body.course || "",
    bio: req.body.bio || "",
    photo: req.body.photo || "",
    skill: req.body.skill || ""
  });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const data = await ff.save();
    res.status(201).json({
      message: "User added",
      data: data
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not create user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (user) {
      res.json({
        message: "Login successful",
        user: user   // ✅ send full user
      });
    } else {
      res.json({ message: "Invalid email or password" });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PROFILE
app.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/profile/:email", async (req, res) => {
  try {
    const updates = {
      name: req.body.name || "",
      contactNumber: req.body.contactNumber || "",
      linkedin: req.body.linkedin || "",
      course: req.body.course || "",
      bio: req.body.bio || ""
    };

    if (req.body.password && req.body.password.trim()) {
      updates.password = req.body.password;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated",
      user: updatedUser
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not update profile" });
  }
});

const postRoutes = require("./postRoute");
const skillRoutes = require("./skillRoutes");
const connectionRoutes = require("./connectionRoutes");
const chatRoutes = require("./chatRoutes");
const materialRoutes = require("./materialRoutes");
const groupRoutes = require("./groupRoutes");
const groupMessageRoutes = require("./groupMessageRoutes");

app.use("/api/posts", postRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/connect", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-messages", groupMessageRoutes);

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, {
      password: 0
    }).sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Could not fetch users" });
  }
});




app.listen(5000, () => console.log("server running on 5000"));
