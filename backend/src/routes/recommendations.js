const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const queries = require("../database/queries");

const router = express.Router();
router.use(authenticateToken);

// Get holistic recommendations for an athlete
router.get("/athlete/:athleteId", (req, res) => {
  try {
    const { athleteId } = req.params;

    // Verify athlete belongs to user's team
    const athlete = queries.getAthleteById(athleteId, req.user.teamId);
    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    // Get rule-based recommendations
    const ruleRecommendations = queries.evaluateRecommendations(
      athleteId,
      req.user.teamId
    );

    // Get training recommendations
    const trainingRecommendations = queries.generateTrainingRecommendations(
      athleteId,
      req.user.teamId
    );

    res.json({
      athlete: {
        id: athlete.id,
        name: athlete.name,
        status: athlete.status,
        position: athlete.position,
      },
      ruleBased: ruleRecommendations,
      trainingSuggestions: trainingRecommendations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Create training program from suggestion (Medical only)
router.post("/training-program", (req, res) => {
  try {
    const { athleteId, exerciseId, ...programData } = req.body;

    const athlete = queries.getAthleteById(athleteId, req.user.teamId);
    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    const programId = queries.createTrainingProgram(
      athleteId,
      exerciseId,
      programData
    );

    res.status(201).json({
      message: "Training program created successfully",
      programId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create training program" });
  }
});

module.exports = router;
