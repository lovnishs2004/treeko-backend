require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===========================
// Middleware
// ===========================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://treeko-frontend-bnuk.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ===========================
// MongoDB Atlas Connection
// ===========================
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

// ===========================
// Models
// ===========================
const User = require("./set1");

// ===========================
// Home Route
// ===========================
app.get("/", (req, res) => {
  res.send("Server + MongoDB Atlas Connected");
});

// ===========================
// Signup
// ===========================
app.post("/signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      email: req.body.email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      contactNumber: req.body.contactNumber || "",
      linkedin: req.body.linkedin || "",
      course: req.body.course || "",
      bio: req.body.bio || "",
      photo: req.body.photo || "",
      skill: req.body.skill || "",
    });

    const data = await user.save();

    res.status(201).json({
      message: "User added successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not create user",
    });
  }
});

// ===========================
// Login
// ===========================
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ===========================
// Get Profile
// ===========================
app.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ===========================
// Update Profile
// ===========================
app.put("/profile/:email", async (req, res) => {
  try {
    const updates = {
      name: req.body.name || "",
      contactNumber: req.body.contactNumber || "",
      linkedin: req.body.linkedin || "",
      course: req.body.course || "",
      bio: req.body.bio || "",
      skill: req.body.skill || "",
      photo: req.body.photo || "",
    };

    if (req.body.password && req.body.password.trim() !== "") {
      updates.password = req.body.password;
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        email: req.params.email,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not update profile",
    });
  }
});

// ===========================
// All Users
// ===========================
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({
      name: 1,
    });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Could not fetch users",
    });
  }
});

// ===========================
// Other Routes
// ===========================
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

// ===========================
// Start Server
// ===========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
});