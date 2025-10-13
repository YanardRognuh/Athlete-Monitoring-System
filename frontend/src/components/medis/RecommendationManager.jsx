import { useState } from "react";
import { Settings, Plus, Trash2, Save } from "lucide-react";

export default function RecommendationManager() {
  const [activeTab, setActiveTab] = useState("weights");
  const [criteriaWeights, setCriteriaWeights] = useState([
    { id: 1, position: "Striker", criteria: "Kecepatan", weight: 25 },
    { id: 2, position: "Striker", criteria: "Kekuatan", weight: 20 },
    { id: 3, position: "Striker", criteria: "Kelincahan", weight: 20 },
    { id: 4, position: "Midfielder", criteria: "Daya Tahan", weight: 30 },
    { id: 5, position: "Midfielder", criteria: "Kecepatan", weight: 20 },
    { id: 6, position: "Defender", criteria: "Kekuatan", weight: 30 },
    { id: 7, position: "Defender", criteria: "Keseimbangan", weight: 25 },
    { id: 8, position: "Goalkeeper", criteria: "Keseimbangan", weight: 25 },
    { id: 9, position: "Goalkeeper", criteria: "Fleksibilitas", weight: 20 },
  ]);

  const [recommendationRules, setRecommendationRules] = useState([
    {
      id: 1,
      priority: 1,
      condition: "Physical Score < 5",
      recommendation: "Increase training intensity gradually",
    },
    {
      id: 2,
      priority: 2,
      condition: "Mental Stress > 7",
      recommendation: "Schedule counseling session",
    },
    {
      id: 3,
      priority: 3,
      condition: "Sleep < 7 hours",
      recommendation: "Implement sleep hygiene protocol",
    },
  ]);

  const positions = ["Striker", "Midfielder", "Defender", "Goalkeeper"];
  const criteriaOptions = [
    "Fleksibilitas",
    "Kekuatan",
    "Daya Tahan",
    "Kecepatan",
    "Keseimbangan",
    "Kelincahan",
  ];

  const handleWeightChange = (id, newWeight) => {
    setCriteriaWeights((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, weight: parseInt(newWeight) } : item
      )
    );
  };

  const handleAddWeight = () => {
    const newId = Math.max(...criteriaWeights.map((w) => w.id), 0) + 1;
    setCriteriaWeights([
      ...criteriaWeights,
      {
        id: newId,
        position: "Striker",
        criteria: "Kecepatan",
        weight: 10,
      },
    ]);
  };

  const handleDeleteWeight = (id) => {
    setCriteriaWeights((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddRule = () => {
    const newId = Math.max(...recommendationRules.map((r) => r.id), 0) + 1;
    setRecommendationRules([
      ...recommendationRules,
      {
        id: newId,
        priority: recommendationRules.length + 1,
        condition: "",
        recommendation: "",
      },
    ]);
  };

  const handleDeleteRule = (id) => {
    setRecommendationRules((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // TODO: Implement API call to save data
    alert("Settings saved successfully!");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Recommendation System
        </h2>
        <p className="text-gray-600 mt-1">
          Configure decision support system criteria and rules
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("weights")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === "weights"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Criteria Weights
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === "rules"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Recommendation Rules
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Criteria Weights Tab */}
          {activeTab === "weights" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Define importance weights for each position's criteria
                </p>
                <button
                  onClick={handleAddWeight}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Weight</span>
                </button>
              </div>

              <div className="space-y-3">
                {positions.map((position) => {
                  const positionWeights = criteriaWeights.filter(
                    (w) => w.position === position
                  );
                  const totalWeight = positionWeights.reduce(
                    (sum, w) => sum + w.weight,
                    0
                  );

                  return (
                    <div
                      key={position}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {position}
                        </h4>
                        <span
                          className={`text-sm font-medium ${
                            totalWeight === 100
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Total: {totalWeight}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {positionWeights.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-3 bg-gray-50 p-3 rounded"
                          >
                            <select
                              value={item.criteria}
                              onChange={(e) =>
                                setCriteriaWeights((prev) =>
                                  prev.map((w) =>
                                    w.id === item.id
                                      ? { ...w, criteria: e.target.value }
                                      : w
                                  )
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              {criteriaOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.weight}
                                onChange={(e) =>
                                  handleWeightChange(item.id, e.target.value)
                                }
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <span className="text-gray-600">%</span>
                            </div>

                            <button
                              onClick={() => handleDeleteWeight(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendation Rules Tab */}
          {activeTab === "rules" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Define automated recommendation rules based on conditions
                </p>
                <button
                  onClick={handleAddRule}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-4">
                {recommendationRules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trigger Condition
                          </label>
                          <input
                            type="text"
                            value={rule.condition}
                            onChange={(e) =>
                              setRecommendationRules((prev) =>
                                prev.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, condition: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Physical Score < 5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recommendation
                          </label>
                          <textarea
                            value={rule.recommendation}
                            onChange={(e) =>
                              setRecommendationRules((prev) =>
                                prev.map((r) =>
                                  r.id === rule.id
                                    ? { ...r, recommendation: e.target.value }
                                    : r
                                )
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter recommendation text..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {recommendationRules.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No recommendation rules defined</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
