/**
 * Helper utilities for the athlete monitoring application
 */

// Status color mapping
export const STATUS_COLORS = {
  Prima: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    hex: "#10b981",
  },
  Fit: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    hex: "#3b82f6",
  },
  Pemulihan: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    hex: "#f59e0b",
  },
  Rehabilitasi: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
    hex: "#ef4444",
  },
};

// Position mapping
export const POSITIONS = ["Striker", "Midfielder", "Defender", "Goalkeeper"];

// Status mapping
export const STATUSES = ["Prima", "Fit", "Pemulihan", "Rehabilitasi"];

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date
 */
export function formatDate(date, locale = "en-US") {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (MM/DD/YYYY)
 */
export function formatDateShort(date) {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculate days since last assessment
 * @param {string|Date} lastAssessmentDate - Last assessment date
 * @returns {number} Days since last assessment
 */
export function daysSinceAssessment(lastAssessmentDate) {
  if (!lastAssessmentDate) return null;

  const lastDate = new Date(lastAssessmentDate);
  const today = new Date();
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get status color class names
 * @param {string} status - Status name
 * @returns {string} Tailwind class names
 */
export function getStatusColor(status) {
  const colors = STATUS_COLORS[status];
  if (!colors) return "bg-gray-100 text-gray-800 border-gray-200";

  return `${colors.bg} ${colors.text} ${colors.border}`;
}

/**
 * Get status hex color
 * @param {string} status - Status name
 * @returns {string} Hex color
 */
export function getStatusHex(status) {
  return STATUS_COLORS[status]?.hex || "#6b7280";
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate overall score from metrics
 * @param {Array} metrics - Array of metric objects with value property
 * @param {number} maxValue - Maximum possible value (default: 10)
 * @returns {number} Percentage score
 */
export function calculateOverallScore(metrics, maxValue = 10) {
  if (!metrics || metrics.length === 0) return 0;

  const totalValue = metrics.reduce((sum, m) => sum + (m.value || 0), 0);
  return Math.round((totalValue / (metrics.length * maxValue)) * 100);
}

/**
 * Get metric color based on value
 * @param {number} value - Metric value (0-10)
 * @returns {string} Color class
 */
export function getMetricColor(value) {
  if (value >= 8) return "text-green-600";
  if (value >= 6) return "text-blue-600";
  if (value >= 4) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Get metric background color based on value
 * @param {number} value - Metric value (0-10)
 * @returns {string} Background color class
 */
export function getMetricBgColor(value) {
  if (value >= 8) return "bg-green-500";
  if (value >= 6) return "bg-blue-500";
  if (value >= 4) return "bg-yellow-500";
  return "bg-red-500";
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format weight to display string
 * @param {number} weight - Weight in kg
 * @returns {string} Formatted weight
 */
export function formatWeight(weight) {
  if (!weight) return "N/A";
  return `${weight.toFixed(1)} kg`;
}

/**
 * Get trend indicator
 * @param {number} change - Percentage change
 * @returns {object} Trend object with direction and color
 */
export function getTrend(change) {
  if (change > 0) {
    return {
      direction: "up",
      color: "text-green-600",
      icon: "↑",
      label: `+${change.toFixed(1)}%`,
    };
  } else if (change < 0) {
    return {
      direction: "down",
      color: "text-red-600",
      icon: "↓",
      label: `${change.toFixed(1)}%`,
    };
  }
  return {
    direction: "neutral",
    color: "text-gray-600",
    icon: "→",
    label: "0%",
  };
}

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if sleep is adequate
 * @param {number} hours - Hours of sleep
 * @returns {object} Sleep adequacy info
 */
export function checkSleepAdequacy(hours) {
  if (hours >= 7 && hours <= 9) {
    return {
      adequate: true,
      level: "optimal",
      color: "text-green-600",
      message: "Sleep duration is optimal",
    };
  } else if (hours >= 6 && hours < 7) {
    return {
      adequate: false,
      level: "insufficient",
      color: "text-yellow-600",
      message: "Sleep duration is slightly below recommended",
    };
  } else if (hours < 6) {
    return {
      adequate: false,
      level: "poor",
      color: "text-red-600",
      message: "Sleep duration is significantly below recommended",
    };
  } else {
    return {
      adequate: false,
      level: "excessive",
      color: "text-yellow-600",
      message: "Sleep duration is above recommended",
    };
  }
}

/**
 * Determine athlete readiness based on metrics
 * @param {Object} physicalMetrics - Physical assessment metrics
 * @param {Object} mentalMetrics - Mental health metrics
 * @param {Object} sleepMetrics - Sleep quality metrics
 * @returns {object} Readiness assessment
 */
export function assessReadiness(physicalMetrics, mentalMetrics, sleepMetrics) {
  const avgPhysical = calculateOverallScore(physicalMetrics);
  const avgMental = calculateOverallScore(mentalMetrics);
  const avgSleep = calculateOverallScore(sleepMetrics);

  const overall = (avgPhysical + avgMental + avgSleep) / 3;

  if (overall >= 80) {
    return {
      level: "High",
      color: "text-green-600",
      bgColor: "bg-green-50",
      message: "Athlete is in excellent condition",
    };
  } else if (overall >= 60) {
    return {
      level: "Moderate",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      message: "Athlete is in good condition",
    };
  } else if (overall >= 40) {
    return {
      level: "Low",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      message: "Athlete needs attention",
    };
  } else {
    return {
      level: "Critical",
      color: "text-red-600",
      bgColor: "bg-red-50",
      message: "Immediate intervention recommended",
    };
  }
}

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
