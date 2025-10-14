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
    console.log(`Setting ${category}.${metricName} to ${value}`);
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
        <p className="mt-1 text-gray-600">Record athlete medical assessment</p>
      </div>

      {success && (
        <div className="px-4 py-3 mb-6 text-green-700 border border-green-200 rounded-lg bg-green-50">
          Assessment created successfully!
        </div>
      )}

      {error && (
        <div className="flex items-center px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
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
              <label className="block mb-2 text-sm font-medium text-gray-700">
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
              <label className="block mb-2 text-sm font-medium text-gray-700">
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
            <label className="block mb-2 text-sm font-medium text-gray-700">
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
            className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {category}
            </h3>

            <div className="space-y-4">
              {metricNames.map((metricName) => (
                <div key={metricName}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {metricName}
                    </label>
                    <span className="text-sm font-semibold text-gray-900">
                      {metrics[category]?.[metricName] ?? 5} / 10
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Updated range input: barely visible track */}
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={metrics[category]?.[metricName] ?? 5}
                      onChange={(e) =>
                        handleMetricChange(category, metricName, e.target.value)
                      }
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
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
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        height: "6px",
                        borderRadius: "3px",
                        outline: "none",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    />
                    {/* Only show 0 and 10 buttons */}
                    <div className="flex space-x-1">
                      {[0, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            handleMetricChange(category, metricName, val)
                          }
                          className={`w-7 h-7 text-xs rounded text-gray-600 font-medium ${
                            metrics[category]?.[metricName] === val
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
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
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 space-x-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Assessment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
