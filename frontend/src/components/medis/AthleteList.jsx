import { useState, useEffect } from "react";
import { athleteAPI } from "../../services/api";
import { Users, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AthleteDetail from "./AthleteDetail";

const statusColors = {
  Prima: "bg-green-100 text-green-800",
  Fit: "bg-blue-100 text-blue-800",
  Pemulihan: "bg-yellow-100 text-yellow-800",
  Rehabilitasi: "bg-red-100 text-red-800",
};

export default function AthleteList() {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await athleteAPI.getAll();
      setAthletes(response.data);
    } catch (err) {
      setError("Failed to load athletes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-lg animate-pulse">
            <div className="w-1/4 h-4 mb-4 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  if (selectedAthleteId) {
    return (
      <AthleteDetail
        athleteId={selectedAthleteId}
        onBack={() => setSelectedAthleteId(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Athletes</h2>
          <p className="mt-1 text-gray-600">
            Manage and monitor athlete information
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{athletes.length} Athletes</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete) => (
          <div
            key={athlete.id}
            className="p-6 transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {athlete.name}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {athlete.position}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[athlete.status]
                }`}
              >
                {athlete.status}
              </span>
            </div>

            {athlete.last_assessment_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Last Assessment: {athlete.last_assessment_date}</span>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedAthleteId(athlete.id);
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {athletes.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No athletes found</p>
        </div>
      )}
    </div>
  );
}
