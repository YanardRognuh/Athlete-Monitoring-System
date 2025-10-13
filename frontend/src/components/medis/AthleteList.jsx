import { useState, useEffect } from "react";
import { athleteAPI } from "../../services/api";
import { Users, Calendar, MapPin } from "lucide-react";

const statusColors = {
  Prima: "bg-green-100 text-green-800",
  Fit: "bg-blue-100 text-blue-800",
  Pemulihan: "bg-yellow-100 text-yellow-800",
  Rehabilitasi: "bg-red-100 text-red-800",
};

export default function AthleteList() {
  const [athletes, setAthletes] = useState([]);
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
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Athletes</h2>
          <p className="text-gray-600 mt-1">
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {athlete.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
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

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {athletes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No athletes found</p>
        </div>
      )}
    </div>
  );
}
