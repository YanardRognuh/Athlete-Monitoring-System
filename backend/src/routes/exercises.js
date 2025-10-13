// ===== exercises.js =====
const express = require("express");
const { db } = require("../database/init");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

const exerciseRouter = express.Router();
exerciseRouter.use(authenticateToken);

// Get all exercises
exerciseRouter.get("/", (req, res) => {
  try {
    const exercises = db
      .prepare("SELECT * FROM exercise_library ORDER BY name")
      .all();
    res.json(exercises);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// Create exercise (Medical team only)
exerciseRouter.post("/", authorizeRole("medis"), (req, res) => {
  try {
    const { name, type, focusArea, description } = req.body;

    if (!name || !type || !focusArea) {
      return res
        .status(400)
        .json({ error: "Name, type, and focus area required" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO exercise_library (name, type, focus_area, description)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(name, type, focusArea, description || null);

    res.status(201).json({
      message: "Exercise created",
      exerciseId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create exercise" });
  }
});

// Get training programs for an athlete
exerciseRouter.get("/programs/athlete/:athleteId", (req, res) => {
  try {
    const programs = db
      .prepare(
        `
      SELECT 
        tp.*,
        el.name as exercise_name,
        el.type as exercise_type,
        el.focus_area
      FROM training_programs tp
      JOIN exercise_library el ON tp.exercise_id = el.id
      JOIN athletes a ON tp.athlete_id = a.id
      WHERE tp.athlete_id = ? AND a.team_id = ?
    `
      )
      .all(req.params.athleteId, req.user.teamId);

    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch training programs" });
  }
});

// Create training program (Medical team only)
exerciseRouter.post("/programs", authorizeRole("medis"), (req, res) => {
  try {
    const {
      athleteId,
      exerciseId,
      frequency,
      intensity,
      time,
      typeFitt,
      volume,
      progression,
      sets,
      reps,
    } = req.body;

    if (!athleteId || !exerciseId) {
      return res
        .status(400)
        .json({ error: "Athlete ID and Exercise ID required" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO training_programs 
      (athlete_id, exercise_id, frequency, intensity, time, type_fitt, volume, progression, sets, reps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        athleteId,
        exerciseId,
        frequency,
        intensity,
        time,
        typeFitt,
        volume,
        progression,
        sets,
        reps
      );

    res.status(201).json({
      message: "Training program created",
      programId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create training program" });
  }
});

// ===== teams.js =====
const teamRouter = express.Router();
teamRouter.use(authenticateToken);

// Get all teams
teamRouter.get("/", (req, res) => {
  try {
    const teams = db.prepare("SELECT * FROM teams").all();
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Get user's team
teamRouter.get("/my-team", (req, res) => {
  try {
    const team = db
      .prepare("SELECT * FROM teams WHERE id = ?")
      .get(req.user.teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const members = db
      .prepare(
        `
      SELECT id, name, email, role 
      FROM users 
      WHERE team_id = ?
    `
      )
      .all(req.user.teamId);

    const athleteCount = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM athletes 
      WHERE team_id = ?
    `
      )
      .get(req.user.teamId);

    res.json({
      ...team,
      members,
      athleteCount: athleteCount.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch team details" });
  }
});

module.exports = {
  exerciseRouter,
  teamRouter,
};
