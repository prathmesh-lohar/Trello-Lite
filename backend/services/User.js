const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //  Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //  Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Return token and user data
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // . Check if user exists and password matches

    if (user && (await user.matchPassword(password))) {
      // Return token and user data
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: "Login successful",
      });
    } else {
      // 4b. If authentication fails
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const authMe = async (req, res) => {
  try {

    res.status(200).json(req.user);
  } catch (error) {
    console.error("AuthMe Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, authMe };


