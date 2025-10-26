// backend/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Hardcoded admin/staff credentials
const USERS = [
  {
    id: "admin1",
    email: "admin@restaurant.com",
    passwordHash: bcrypt.hashSync("admin123", 10), // Change this password!
    role: "admin",
    name: "Admin User"
  },
  {
    id: "staff1",
    email: "staff@restaurant.com",
    passwordHash: bcrypt.hashSync("staff123", 10), // Change this password!
    role: "staff",
    name: "Staff User"
  }
];

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = USERS.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;