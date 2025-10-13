import { useState, useEffect } from "react";
import { athleteAPI, assessmentAPI } from "../../services/api";
import { Save, AlertCircle } from "lucide-react";

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

export default function AssessmentForm() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAthletes();
    initializeMetrics();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await athleteAPI.getAll();
      setAthletes(response.data);
    } catch (err) {
      console.error("Failed to fetch athletes:", err);
    }
  };

  const initializeMetrics = () => {
    const initialMetrics = {};
    Object.entries(METRIC_STRUCTURE).forEach(([category, metricNames]) => {
      initialMetrics[category] = {};
      metricNames.forEach((name) => {
        initialMetrics[category][name] = 5;
      });
    });
    setMetrics(initialMetrics);
  };

  const handleMetricChange = (category, metricName, value) => {
    setMetrics((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metricName]: parseInt(value),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAthlete) {
      setError("Please select an athlete");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await assessmentAPI.create({
        athleteId: selectedAthlete,
        date,
        weight: weight ? parseFloat(weight) : null,
        notes,
        metrics,
      });

      setSuccess(true);
      setNotes("");
      setWeight("");
      initializeMetrics();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const getScaleColor = (value) => {
    if (value >= 8) return "bg-green-500";
    if (value >= 6) return "bg-blue-500";
    if (value >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Assessment</h2>
        <p className="text-gray-600 mt-1">Record athlete medical assessment</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Assessment created successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Athlete *
              </label>
              <select
                value={selectedAthlete}
                onChange={(e) => setSelectedAthlete(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Choose athlete...</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name} - {athlete.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="70.5"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Additional observations..."
            />
          </div>
        </div>

        {/* Metrics */}
        {Object.entries(METRIC_STRUCTURE).map(([category, metricNames]) => (
          <div
            key={category}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {category}
            </h3>

            <div className="space-y-4">
              {metricNames.map((metricName) => (
                <div key={metricName}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {metricName}
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {metrics[category]?.[metricName] || 5} / 10
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={metrics[category]?.[metricName] || 5}
                      onChange={(e) =>
                        handleMetricChange(category, metricName, e.target.value)
                      }
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${getScaleColor(
                          metrics[category]?.[metricName] || 5
                        )} 0%, ${getScaleColor(
                          metrics[category]?.[metricName] || 5
                        )} ${
                          (metrics[category]?.[metricName] || 5) * 10
                        }%, #e5e7eb ${
                          (metrics[category]?.[metricName] || 5) * 10
                        }%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex space-x-1">
                      {[0, 2, 4, 6, 8, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            handleMetricChange(category, metricName, val)
                          }
                          className={`w-8 h-8 text-xs rounded ${
                            metrics[category]?.[metricName] === val
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              initializeMetrics();
              setNotes("");
              setWeight("");
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Assessment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
