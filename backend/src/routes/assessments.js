const express = require("express");
const { db } = require("../database/init");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticateToken);

// Predefined metric structure
const METRIC_STRUCTURE = {
  Rehabilitasi: ["Cedera", "Pemulihan"],
  "Pemeriksaan Fisik": [
    "Fleksibilitas",
    "Kekuatan",
    "Daya Tahan",
    "Kecepatan",
    "Keseimbangan",
    "Kelincahan",
  ],
  "Kesehatan Mental": [
    "Stress",
    "Motivasi",
    "Percaya Diri",
    "Kohesi Tim",
    "Fokus",
  ],
  "Kualitas Tidur": ["Rata-rata Jam Tidur", "Kualitas", "Konsistensi"],
  Recovery: ["Tingkat Recovery"],
  "Tingkat Aktivitas": ["Harian", "Latihan", "Pertandingan", "Recovery"],
};

// Get all assessments for an athlete
router.get("/athlete/:athleteId", (req, res) => {
  try {
    const assessments = db
      .prepare(
        `
      SELECT a.*, u.name as assessor_name
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      JOIN athletes ath ON a.athlete_id = ath.id
      WHERE a.athlete_id = ? AND ath.team_id = ?
      ORDER BY a.date DESC
    `
      )
      .all(req.params.athleteId, req.user.teamId);

    // Get metrics for each assessment
    const assessmentsWithMetrics = assessments.map((assessment) => {
      const metrics = db
        .prepare(
          `
        SELECT metric_category, metric_name, value
        FROM assessment_metrics
        WHERE assessment_id = ?
      `
        )
        .all(assessment.id);

      return { ...assessment, metrics };
    });

    res.json(assessmentsWithMetrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

// Get single assessment with metrics
router.get("/:id", (req, res) => {
  try {
    const assessment = db
      .prepare(
        `
      SELECT a.*, u.name as assessor_name, ath.name as athlete_name
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      JOIN athletes ath ON a.athlete_id = ath.id
      WHERE a.id = ? AND ath.team_id = ?
    `
      )
      .get(req.params.id, req.user.teamId);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const metrics = db
      .prepare(
        `
      SELECT metric_category, metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ?
    `
      )
      .all(req.params.id);

    res.json({ ...assessment, metrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch assessment" });
  }
});

// Create assessment (Medical team only)
router.post("/", authorizeRole("medis"), (req, res) => {
  try {
    const { athleteId, date, weight, notes, metrics } = req.body;

    if (!athleteId || !date || !metrics) {
      return res
        .status(400)
        .json({ error: "Athlete ID, date, and metrics required" });
    }

    // Verify athlete belongs to user's team
    const athlete = db
      .prepare("SELECT id FROM athletes WHERE id = ? AND team_id = ?")
      .get(athleteId, req.user.teamId);

    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    // Check if assessment already exists for this athlete on this date
    const existingAssessment = db
      .prepare("SELECT id FROM assessments WHERE athlete_id = ? AND date = ?")
      .get(athleteId, date);

    if (existingAssessment) {
      return res.status(400).json({
        error:
          "Assessment already exists for this athlete on the selected date",
      });
    }

    // Begin transaction
    const insertAssessment = db.prepare(`
      INSERT INTO assessments (athlete_id, user_id, date, weight_kg, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMetric = db.prepare(`
      INSERT INTO assessment_metrics (assessment_id, metric_category, metric_name, value)
      VALUES (?, ?, ?, ?)
    `);

    const updateAthlete = db.prepare(`
      UPDATE athletes 
      SET last_assessment_date = ?, status = ?
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      const result = insertAssessment.run(
        athleteId,
        req.user.id,
        date,
        weight || null,
        notes || null
      );
      const assessmentId = result.lastInsertRowid;

      // Insert all metrics
      Object.entries(metrics).forEach(([category, categoryMetrics]) => {
        Object.entries(categoryMetrics).forEach(([metricName, value]) => {
          insertMetric.run(assessmentId, category, metricName, value);
        });
      });

      // Calculate overall status based on metrics
      const status = calculateAthleteStatus(metrics);
      updateAthlete.run(date, status, athleteId);

      return assessmentId;
    });

    const assessmentId = transaction();

    res.status(201).json({
      message: "Assessment created successfully",
      assessmentId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create assessment" });
  }
});

// Helper function to calculate athlete status
function calculateAthleteStatus(metrics) {
  const physical = metrics["Pemeriksaan Fisik"] || {};
  const mental = metrics["Kesehatan Mental"] || {};
  const rehab = metrics["Rehabilitasi"] || {};

  // Check if in rehabilitation
  if (rehab.Cedera && rehab.Cedera >= 7) {
    return "Rehabilitasi";
  }
  if (rehab.Pemulihan && rehab.Pemulihan < 5) {
    return "Pemulihan";
  }

  // Calculate average physical score
  const physicalValues = Object.values(physical);
  const mentalValues = Object.values(mental);

  const avgPhysical =
    physicalValues.length > 0
      ? physicalValues.reduce((a, b) => a + b, 0) / physicalValues.length
      : 5;
  const avgMental =
    mentalValues.length > 0
      ? mentalValues.reduce((a, b) => a + b, 0) / mentalValues.length
      : 5;

  // Determine status
  if (avgPhysical >= 8 && avgMental >= 8) return "Prima";
  if (avgPhysical >= 6 && avgMental >= 6) return "Fit";
  return "Pemulihan";
}

// Get metric structure
router.get("/metrics/structure", (req, res) => {
  res.json(METRIC_STRUCTURE);
});

module.exports = router;
