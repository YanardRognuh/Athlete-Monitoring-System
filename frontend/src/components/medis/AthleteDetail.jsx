// frontend/src/components/medis/AthleteDetail.jsx
import { useState, useEffect } from "react";
import { athleteAPI, assessmentAPI } from "../../services/api";
import {
  ArrowLeft,
  Calendar,
  Scale,
  FileText,
  Activity,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import LoadingSkeleton from "../common/LoadingSkeleton";

const statusColors = {
  Prima: "bg-green-100 text-green-800",
  Fit: "bg-blue-100 text-blue-800",
  Pemulihan: "bg-yellow-100 text-yellow-800",
  Rehabilitasi: "bg-red-100 text-red-800",
};

const categoryIcons = {
  "Pemeriksaan Fisik": Scale,
  "Kesehatan Mental": Activity,
  "Kualitas Tidur": Calendar,
  Rehabilitasi: FileText,
  Recovery: Activity,
  "Tingkat Aktivitas": Activity,
};

export default function AthleteDetail({ athleteId, onBack }) {
  const [athlete, setAthlete] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (athleteId) {
      fetchAthleteAndAssessments();
    }
  }, [athleteId]);

  const fetchAthleteAndAssessments = async () => {
    try {
      const [athleteRes, assessmentsRes] = await Promise.all([
        athleteAPI.getById(athleteId),
        assessmentAPI.getByAthlete(athleteId),
      ]);

      setAthlete(athleteRes.data);
      setAssessments(assessmentsRes.data);
      if (assessmentsRes.data.length > 0) {
        setExpandedAssessment(assessmentsRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch athlete details:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessment = (id) => {
    setExpandedAssessment(expandedAssessment === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg animate-pulse">
          <div className="w-1/3 h-8 mb-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-4 mb-2 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
        Athlete not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Athletes
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{athlete.name}</h2>
            <div className="flex items-center mt-2 space-x-4">
              <span className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {athlete.position}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[athlete.status]
                }`}
              >
                {athlete.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* No assessments */}
      {assessments.length === 0 && (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No Assessments Yet
          </h3>
          <p className="text-gray-600">
            This athlete hasn't been assessed yet.
          </p>
        </div>
      )}

      {/* Assessments List */}
      <div className="space-y-3">
        {assessments.map((assessment) => {
          const isExpanded = expandedAssessment === assessment.id;
          const metricsByCategory = assessment.metrics.reduce((acc, metric) => {
            if (!acc[metric.metric_category]) acc[metric.metric_category] = [];
            acc[metric.metric_category].push(metric);
            return acc;
          }, {});

          return (
            <div
              key={assessment.id}
              className="overflow-hidden bg-white border border-gray-200 rounded-lg"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleAssessment(assessment.id)}
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-2 text-gray-500" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Assessment on {assessment.date}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {assessment.assessor_name}
                      {assessment.weight_kg && (
                        <>
                          <span className="mx-2">•</span>
                          <Scale className="w-4 h-4 mr-1" />
                          {assessment.weight_kg} kg
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {Object.entries(metricsByCategory).map(
                    ([category, metrics]) => {
                      const Icon = categoryIcons[category] || Activity;
                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <div className="flex items-center mb-2">
                            <Icon className="w-4 h-4 mr-2 text-indigo-600" />
                            <h4 className="text-sm font-medium text-gray-900">
                              {category}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {metrics.map((metric) => (
                              <div
                                key={metric.metric_name}
                                className="p-2 text-xs rounded bg-gray-50"
                              >
                                <div className="text-gray-600">
                                  {metric.metric_name}
                                </div>
                                <div className="mt-1 font-medium text-gray-900">
                                  {metric.value}/10
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}

                  {assessment.notes && (
                    <div className="pt-3 mt-4 border-t border-gray-100">
                      <h4 className="mb-1 text-sm font-medium text-gray-900">
                        Notes
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {assessment.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
