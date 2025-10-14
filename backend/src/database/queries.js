const { db } = require("./init");

// Athlete queries
const getAthleteById = (athleteId, teamId) => {
  return db
    .prepare(
      `
      SELECT a.*, t.name as team_name
      FROM athletes a
      JOIN teams t ON a.team_id = t.id
      WHERE a.id = ? AND a.team_id = ?
    `
    )
    .get(athleteId, teamId);
};

const getAthletesByTeam = (teamId) => {
  return db
    .prepare(
      `
      SELECT * FROM athletes 
      WHERE team_id = ? 
      ORDER BY name
    `
    )
    .all(teamId);
};

const createAthlete = (teamId, name, position) => {
  return db
    .prepare(
      `
      INSERT INTO athletes (team_id, name, position, status) 
      VALUES (?, ?, ?, 'Fit')
    `
    )
    .run(teamId, name, position);
};

const updateAthlete = (athleteId, updates) => {
  const updateFields = Object.keys(updates);
  if (updateFields.length === 0) return null;

  const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
  const values = [...updateFields.map((field) => updates[field]), athleteId];

  return db
    .prepare(`UPDATE athletes SET ${setClause} WHERE id = ?`)
    .run(...values);
};

const deleteAthlete = (athleteId, teamId) => {
  return db
    .prepare("DELETE FROM athletes WHERE id = ? AND team_id = ?")
    .run(athleteId, teamId);
};

// Assessment queries
const getAssessmentsByAthlete = (athleteId, teamId) => {
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
    .all(athleteId, teamId);

  return assessments.map((assessment) => ({
    ...assessment,
    metrics: db
      .prepare(
        `
        SELECT metric_category, metric_name, value
        FROM assessment_metrics
        WHERE assessment_id = ?
      `
      )
      .all(assessment.id),
  }));
};

const getAssessmentById = (assessmentId, teamId) => {
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
    .get(assessmentId, teamId);

  if (!assessment) return null;

  return {
    ...assessment,
    metrics: db
      .prepare(
        `
        SELECT metric_category, metric_name, value
        FROM assessment_metrics
        WHERE assessment_id = ?
      `
      )
      .all(assessmentId),
  };
};

const createAssessment = (athleteId, userId, date, weight, notes, metrics) => {
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
      userId,
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

  return transaction();
};

// Exercise queries
const getExercises = () => {
  return db.prepare("SELECT * FROM exercise_library ORDER BY name").all();
};

const createExercise = (name, type, focusArea, description) => {
  return db
    .prepare(
      `
      INSERT INTO exercise_library (name, type, focus_area, description)
      VALUES (?, ?, ?, ?)
    `
    )
    .run(name, type, focusArea, description || null);
};

const getTrainingProgramsByAthlete = (athleteId, teamId) => {
  return db
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
    .all(athleteId, teamId);
};

const createTrainingProgram = (athleteId, exerciseId, programData) => {
  const {
    frequency,
    intensity,
    time,
    typeFitt,
    volume,
    progression,
    sets,
    reps,
  } = programData;
  return db
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
};

// Team queries
const getTeamById = (teamId) => {
  return db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId);
};

const getTeamMembers = (teamId) => {
  return db
    .prepare(
      `
      SELECT id, name, email, role 
      FROM users 
      WHERE team_id = ?
    `
    )
    .all(teamId);
};

const getTeamAthleteCount = (teamId) => {
  return db
    .prepare(
      `
      SELECT COUNT(*) as count 
      FROM athletes 
      WHERE team_id = ?
    `
    )
    .get(teamId);
};

// Dashboard queries
const getAthletePerformanceData = (
  athleteId,
  teamId,
  category = null,
  metric = null
) => {
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

  return db.prepare(query).all(...params);
};

const getLatestPhysicalAssessment = (athleteId, teamId) => {
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
    .get(athleteId, teamId);

  if (!latestAssessment) return null;

  const metrics = db
    .prepare(
      `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Pemeriksaan Fisik'
    `
    )
    .all(latestAssessment.id);

  return { latestAssessment, metrics };
};

const getLatestMentalAssessment = (athleteId, teamId) => {
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
    .get(athleteId, teamId);

  if (!latestAssessment) return null;

  const metrics = db
    .prepare(
      `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Kesehatan Mental'
    `
    )
    .all(latestAssessment.id);

  return { latestAssessment, metrics };
};

const getLatestSleepAssessment = (athleteId, teamId) => {
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
    .get(athleteId, teamId);

  if (!latestAssessment) return null;

  const metrics = db
    .prepare(
      `
      SELECT metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ? AND metric_category = 'Kualitas Tidur'
    `
    )
    .all(latestAssessment.id);

  return { latestAssessment, metrics };
};

const getTeamOverview = (teamId) => {
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
    .all(teamId);

  return athletes;
};

// Helper functions
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

// Criteria and recommendation queries
const getCriteriaWeightsByPosition = (position) => {
  return db
    .prepare(
      `
      SELECT criteria_name, weight
      FROM criteria_weights
      WHERE position = ?
      ORDER BY criteria_name
    `
    )
    .all(position);
};

const getAllCriteriaWeights = () => {
  return db
    .prepare("SELECT * FROM criteria_weights ORDER BY position, criteria_name")
    .all();
};

const updateCriteriaWeight = (id, weight) => {
  return db
    .prepare("UPDATE criteria_weights SET weight = ? WHERE id = ?")
    .run(weight, id);
};

const getRecommendationRules = () => {
  return db
    .prepare("SELECT * FROM recommendation_rules ORDER BY priority")
    .all();
};

const createRecommendationRule = (
  priority,
  triggerCondition,
  recommendationText
) => {
  return db
    .prepare(
      `
      INSERT INTO recommendation_rules (priority, trigger_condition, recommendation_text)
      VALUES (?, ?, ?)
    `
    )
    .run(priority, triggerCondition, recommendationText);
};

const updateRecommendationRule = (
  id,
  priority,
  triggerCondition,
  recommendationText
) => {
  return db
    .prepare(
      `
      UPDATE recommendation_rules 
      SET priority = ?, trigger_condition = ?, recommendation_text = ?
      WHERE id = ?
    `
    )
    .run(priority, triggerCondition, recommendationText, id);
};

const deleteRecommendationRule = (id) => {
  return db.prepare("DELETE FROM recommendation_rules WHERE id = ?").run(id);
};

// Evaluate recommendation rules against athlete's latest metrics
function evaluateRecommendations(athleteId, teamId) {
  // Get latest assessment metrics
  const latestAssessment = db
    .prepare(
      `
      SELECT id FROM assessments 
      WHERE athlete_id = ? 
      ORDER BY date DESC 
      LIMIT 1
    `
    )
    .get(athleteId);

  if (!latestAssessment) return [];

  const metrics = db
    .prepare(
      `
      SELECT metric_category, metric_name, value
      FROM assessment_metrics
      WHERE assessment_id = ?
    `
    )
    .all(latestAssessment.id);

  // Convert to lookup object: { "Cedera": 8, "Fleksibilitas": 6, ... }
  const metricMap = {};
  metrics.forEach((m) => {
    metricMap[m.metric_name] = m.value;
  });

  // Get all rules
  const rules = getRecommendationRules();

  // Evaluate each rule
  const matchedRecommendations = [];
  rules.forEach((rule) => {
    try {
      const condition = JSON.parse(rule.trigger_condition);
      let matches = true;

      // Simple condition format: { "Cedera": ">=7", "Fleksibilitas": "<5" }
      Object.entries(condition).forEach(([metricName, expression]) => {
        const actualValue = metricMap[metricName];
        if (actualValue === undefined) {
          matches = false;
          return;
        }

        // Parse expression like ">=7", "<5", "==8"
        const operator = expression.match(/^[<>=!]+/)?.[0] || "==";
        const threshold = parseFloat(expression.replace(/^[<>=!]+/, ""));

        switch (operator) {
          case ">=":
            if (!(actualValue >= threshold)) matches = false;
            break;
          case ">":
            if (!(actualValue > threshold)) matches = false;
            break;
          case "<=":
            if (!(actualValue <= threshold)) matches = false;
            break;
          case "<":
            if (!(actualValue < threshold)) matches = false;
            break;
          case "==":
          case "=":
            if (!(actualValue === threshold)) matches = false;
            break;
          case "!=":
            if (!(actualValue !== threshold)) matches = false;
            break;
          default:
            matches = false;
        }
      });

      if (matches) {
        matchedRecommendations.push({
          priority: rule.priority,
          recommendation: rule.recommendation_text,
        });
      }
    } catch (e) {
      console.warn(
        `Invalid rule condition for rule ID ${rule.id}:`,
        rule.trigger_condition
      );
    }
  });

  // Sort by priority (lowest number = highest priority)
  return matchedRecommendations.sort((a, b) => a.priority - b.priority);
}

// Generate training program recommendations
function generateTrainingRecommendations(athleteId, teamId) {
  const athlete = getAthleteById(athleteId, teamId);
  if (!athlete) return [];

  // Get latest physical metrics
  const latestPhysical = getLatestPhysicalAssessment(athleteId, teamId);
  if (!latestPhysical) return [];

  // Get criteria weights for position
  const weights = getCriteriaWeightsByPosition(athlete.position);

  // Get all exercises
  const exercises = getExercises();

  // Score exercises based on focus_area match and athlete status
  const scoredExercises = exercises.map((ex) => {
    let score = 0;

    // Boost score if exercise focus matches high-weight criteria
    weights.forEach((w) => {
      if (ex.focus_area.toLowerCase().includes(w.criteria_name.toLowerCase())) {
        score += w.weight * 10;
      }
    });

    // Penalize if athlete is in rehabilitation
    if (athlete.status === "Rehabilitasi" && !ex.type.includes("Rehab")) {
      score -= 5;
    }

    return { ...ex, score };
  });

  // Return top 5 exercises
  return scoredExercises
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((ex) => ({
      exercise_id: ex.id,
      name: ex.name,
      type: ex.type,
      focus_area: ex.focus_area,
      description: ex.description,
    }));
}

module.exports = {
  // Athlete queries
  getAthleteById,
  getAthletesByTeam,
  createAthlete,
  updateAthlete,
  deleteAthlete,

  // Assessment queries
  getAssessmentsByAthlete,
  getAssessmentById,
  createAssessment,

  // Exercise queries
  getExercises,
  createExercise,
  getTrainingProgramsByAthlete,
  createTrainingProgram,

  // Team queries
  getTeamById,
  getTeamMembers,
  getTeamAthleteCount,

  // Dashboard queries
  getAthletePerformanceData,
  getLatestPhysicalAssessment,
  getLatestMentalAssessment,
  getLatestSleepAssessment,
  getTeamOverview,

  // Criteria and recommendation queries
  getCriteriaWeightsByPosition,
  getAllCriteriaWeights,
  updateCriteriaWeight,
  getRecommendationRules,
  createRecommendationRule,
  updateRecommendationRule,
  deleteRecommendationRule,

  // Helper functions
  calculateAthleteStatus,
  evaluateRecommendations,
  generateTrainingRecommendations,
};
