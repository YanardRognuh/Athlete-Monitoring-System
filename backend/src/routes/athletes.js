const express = require("express");
const { db } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all athletes for user's team
router.get("/", (req, res) => {
  try {
    const athletes = db
      .prepare(
        `
      SELECT * FROM athletes 
      WHERE team_id = ? 
      ORDER BY name
    `
      )
      .all(req.user.teamId);

    res.json(athletes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch athletes" });
  }
});

// Get single athlete with details
router.get("/:id", (req, res) => {
  try {
    const athlete = db
      .prepare(
        `
      SELECT a.*, t.name as team_name
      FROM athletes a
      JOIN teams t ON a.team_id = t.id
      WHERE a.id = ? AND a.team_id = ?
    `
      )
      .get(req.params.id, req.user.teamId);

    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    // Get latest assessment
    const latestAssessment = db
      .prepare(
        `
      SELECT * FROM assessments 
      WHERE athlete_id = ? 
      ORDER BY date DESC 
      LIMIT 1
    `
      )
      .get(req.params.id);

    res.json({ ...athlete, latestAssessment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch athlete" });
  }
});

// Create athlete (Coach only)
router.post("/", (req, res) => {
  try {
    if (req.user.role !== "pelatih") {
      return res
        .status(403)
        .json({ error: "Only coaches can create athletes" });
    }

    const { name, position } = req.body;

    if (!name || !position) {
      return res.status(400).json({ error: "Name and position required" });
    }

    const validPositions = ["Striker", "Midfielder", "Defender", "Goalkeeper"];
    if (!validPositions.includes(position)) {
      return res.status(400).json({ error: "Invalid position" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO athletes (team_id, name, position, status) 
      VALUES (?, ?, ?, 'Fit')
    `
      )
      .run(req.user.teamId, name, position);

    res.status(201).json({
      message: "Athlete created",
      athleteId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create athlete" });
  }
});

// Update athlete
router.put("/:id", (req, res) => {
  try {
    const { name, position, status } = req.body;
    const athleteId = req.params.id;

    // Verify athlete belongs to user's team
    const athlete = db
      .prepare("SELECT id FROM athletes WHERE id = ? AND team_id = ?")
      .get(athleteId, req.user.teamId);

    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (position) {
      updates.push("position = ?");
      values.push(position);
    }
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(athleteId);

    db.prepare(`UPDATE athletes SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );

    res.json({ message: "Athlete updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update athlete" });
  }
});

// Delete athlete
router.delete("/:id", (req, res) => {
  try {
    if (req.user.role !== "pelatih") {
      return res
        .status(403)
        .json({ error: "Only coaches can delete athletes" });
    }

    const transaction = db.transaction(() => {
      const athleteId = req.params.id;

      // 1. Delete all assessment_metrics for this athlete's assessments
      db.prepare(
        `
        DELETE FROM assessment_metrics 
        WHERE assessment_id IN (SELECT id FROM assessments WHERE athlete_id = ?)
      `
      ).run(athleteId);

      // 2. Delete all assessments for this athlete
      db.prepare("DELETE FROM assessments WHERE athlete_id = ?").run(athleteId);

      // 3. Delete all training programs for this athlete
      db.prepare("DELETE FROM training_programs WHERE athlete_id = ?").run(
        athleteId
      );

      // 4. Finally, delete the athlete
      const result = db
        .prepare("DELETE FROM athletes WHERE id = ? AND team_id = ?")
        .run(athleteId, req.user.teamId);

      return result;
    });

    const result = transaction();

    if (result.changes === 0) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    res.json({ message: "Athlete deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete athlete" });
  }
});

module.exports = router;
