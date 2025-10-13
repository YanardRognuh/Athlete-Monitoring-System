const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../database/init");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get team info
    const team = db
      .prepare("SELECT name FROM teams WHERE id = ?")
      .get(user.team_id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        teamId: user.team_id,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.team_id,
        teamName: team?.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Register (optional - for creating new users)
router.post("/register", (req, res) => {
  try {
    const { name, email, password, role, teamId } = req.body;

    if (!name || !email || !password || !role || !teamId) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Validate role
    if (!["medis", "pelatih"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if email already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const result = db
      .prepare(
        `INSERT INTO users (name, email, password, role, team_id) 
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(name, email, hashedPassword, role, teamId);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;
