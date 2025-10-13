const express = require("express");
const { db } = require("../database/init");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
router.use(authenticateToken);

// Get athlete performance tracking data
router.get("/athlete/:athleteId/performance", (req, res) => {
  try {
    const { athleteId } = req.params;
    const { category, metric } = req.query;

    // Verify athlete belongs to user's team
    const athlete = db
      .prepare("SELECT id FROM athletes WHERE id = ? AND team_id = ?")
      .get(athleteId, req.user.teamId);

    if (!athlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }

    let query = `
      SELECT 
        a.date,
        am.metric_category,
        am.metric_name,
        am.value
      FROM assessments a
      JOIN assessment_metrics am ON a.id = am.assessment_id
      WHERE a.athlete_id = ?
    `;
    const params = [athleteId];

    if (category) {
      query += " AND am.metric_category = ?";
      params.push(category);
    }

    if (metric) {
      query += " AND am.metric_name = ?";
      params.push(metric);
    }

    query += " ORDER BY a.date ASC";

    const data = db.prepare(query).all(...params);

    // Calculate percentage changes
    const processedData = [];
    const groupedByMetric = {};

    data.forEach((row) => {
      const key = `${row.metric_category}-${row.metric_name}`;
      if (!groupedByMetric[key]) {
        groupedByMetric[key] = [];
      }
      groupedByMetric[key].push(row);
    });

    Object.entries(groupedByMetric).forEach(([key, values]) => {
      const points = values.map((v, idx) => {
        let percentageChange = 0;
        if (idx > 0) {
          const prev = values[idx - 1].value;
          percentageChange = prev > 0 ? ((v.value - prev) / prev) * 100 : 0;
        }

        return {
          date: v.date,
          category: v.metric_category,
          metric: v.metric_name,
          value: v.value,
          percentageChange: Math.round(percentageChange * 10) / 10,
        };
      });

      processedData.push({
        category: values[0].metric_category,
        metric: values[0].metric_name,
        data: points,
      });
    });

    res.json(processedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
});

// Get latest physical assessment for spider chart
router.get("/athlete/:athleteId/physical", (req, res) => {
  try {
    const { athleteId } = req.params;

    const latestAssessment = db
      .prepare(
        `
      SELECT a.id, a.date
      FROM assessments a
      JOIN athletes ath ON a.athlete_id = ath.id
      WHERE a.athlete_id = ? AND ath.team_id = ?
      ORDER BY a.date DESC
      LIMIT 1
    `
      )
      .get(athleteId, req.user.teamId);

    if (!latestAssessment) {
      return res.json({ metrics: [], overallScore: 0 });
    }

    const metrics = db
      .prepare(
        `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Pemeriksaan Fisik'
    `
      )
      .all(latestAssessment.id);

    // Calculate overall fitness score (average of all physical metrics)
    const totalValue = metrics.reduce((sum, m) => sum + m.value, 0);
    const overallScore =
      metrics.length > 0
        ? Math.round((totalValue / (metrics.length * 10)) * 100)
        : 0;

    res.json({
      date: latestAssessment.date,
      metrics: metrics.map((m) => ({
        metric: m.metric_name,
        value: m.value,
        maxValue: 10,
      })),
      overallScore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch physical data" });
  }
});

// Get mental health data
router.get("/athlete/:athleteId/mental", (req, res) => {
  try {
    const { athleteId } = req.params;

    const latestAssessment = db
      .prepare(
        `
      SELECT a.id, a.date
      FROM assessments a
      JOIN athletes ath ON a.athlete_id = ath.id
      WHERE a.athlete_id = ? AND ath.team_id = ?
      ORDER BY a.date DESC
      LIMIT 1
    `
      )
      .get(athleteId, req.user.teamId);

    if (!latestAssessment) {
      return res.json({ metrics: [] });
    }

    const metrics = db
      .prepare(
        `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Kesehatan Mental'
    `
      )
      .all(latestAssessment.id);

    res.json({
      date: latestAssessment.date,
      metrics: metrics.map((m) => ({
        metric: m.metric_name,
        value: m.value,
        maxValue: 10,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch mental health data" });
  }
});

// Get sleep quality data
router.get("/athlete/:athleteId/sleep", (req, res) => {
  try {
    const { athleteId } = req.params;

    const latestAssessment = db
      .prepare(
        `
      SELECT a.id, a.date
      FROM assessments a
      JOIN athletes ath ON a.athlete_id = ath.id
      WHERE a.athlete_id = ? AND ath.team_id = ?
      ORDER BY a.date DESC
      LIMIT 1
    `
      )
      .get(athleteId, req.user.teamId);

    if (!latestAssessment) {
      return res.json({ metrics: [], warning: null });
    }

    const metrics = db
      .prepare(
        `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Kualitas Tidur'
    `
      )
      .all(latestAssessment.id);

    // Check for sleep warning
    const avgSleep = metrics.find(
      (m) => m.metric_name === "Rata-rata Jam Tidur"
    );
    const warning =
      avgSleep && avgSleep.value < 7
        ? "Atlet kurang tidur! Disarankan minimal 7-9 jam per malam."
        : null;

    res.json({
      date: latestAssessment.date,
      metrics: metrics.map((m) => ({
        metric: m.metric_name,
        value: m.value,
        maxValue: m.metric_name === "Rata-rata Jam Tidur" ? 12 : 10,
      })),
      warning,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sleep data" });
  }
});

// Get team overview
router.get("/team/overview", (req, res) => {
  try {
    const athletes = db
      .prepare(
        `
      SELECT 
        id, name, position, status, last_assessment_date
      FROM athletes
      WHERE team_id = ?
      ORDER BY name
    `
      )
      .all(req.user.teamId);

    // Get status distribution
    const statusCounts = {
      Prima: 0,
      Fit: 0,
      Pemulihan: 0,
      Rehabilitasi: 0,
    };

    athletes.forEach((a) => {
      statusCounts[a.status]++;
    });

    // Get position distribution
    const positionCounts = {
      Striker: 0,
      Midfielder: 0,
      Defender: 0,
      Goalkeeper: 0,
    };

    athletes.forEach((a) => {
      positionCounts[a.position]++;
    });

    // Calculate team average physical score
    const recentAssessments = db
      .prepare(
        `
    SELECT am.value
    FROM assessments a1
    JOIN assessment_metrics am ON a1.id = am.assessment_id
    JOIN athletes ath ON a1.athlete_id = ath.id
    WHERE ath.team_id = ?
      AND am.metric_category = 'Pemeriksaan Fisik'
      AND a1.date = (
        SELECT MAX(a2.date)
        FROM assessments a2
        WHERE a2.athlete_id = a1.athlete_id
      )
  `
      )
      .all(req.user.teamId);

    const avgTeamFitness =
      recentAssessments.length > 0
        ? Math.round(
            (recentAssessments.reduce((sum, r) => sum + r.value, 0) /
              recentAssessments.length) *
              10
          )
        : 0;

    res.json({
      totalAthletes: athletes.length,
      statusDistribution: statusCounts,
      positionDistribution: positionCounts,
      avgTeamFitness,
      athletes: athletes.map((a) => ({
        id: a.id,
        name: a.name,
        position: a.position,
        status: a.status,
        lastAssessment: a.last_assessment_date,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch team overview" });
  }
});

module.exports = router;
