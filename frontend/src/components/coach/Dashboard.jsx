import { useState, useEffect } from "react";
import { athleteAPI } from "../../services/api";
import { Users, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  Prima: "bg-green-100 text-green-800 border-green-200",
  Fit: "bg-blue-100 text-blue-800 border-blue-200",
  Pemulihan: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Rehabilitasi: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS = {
  Prima: TrendingUp,
  Fit: Activity,
  Pemulihan: AlertCircle,
  Rehabilitasi: AlertCircle,
};

export default function Dashboard() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    prima: 0,
    fit: 0,
    pemulihan: 0,
    rehabilitasi: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await athleteAPI.getAll();
      const athleteData = response.data;
      setAthletes(athleteData);

      // Calculate stats
      const statusCount = {
        total: athleteData.length,
        prima: athleteData.filter((a) => a.status === "Prima").length,
        fit: athleteData.filter((a) => a.status === "Fit").length,
        pemulihan: athleteData.filter((a) => a.status === "Pemulihan").length,
        rehabilitasi: athleteData.filter((a) => a.status === "Rehabilitasi")
          .length,
      };
      setStats(statusCount);
    } catch (err) {
      console.error("Failed to fetch athletes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAthleteClick = (athleteId) => {
    navigate(`/coach/athletes/${athleteId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Overview of your team's performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Athletes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prima</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.prima}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fit</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.fit}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pemulihan</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.pemulihan}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rehabilitasi</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {stats.rehabilitasi}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Athletes
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => {
            const StatusIcon = STATUS_ICONS[athlete.status];
            return (
              <div
                key={athlete.id}
                onClick={() => handleAthleteClick(athlete.id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {athlete.name}
                    </h4>
                    <p className="text-sm text-gray-600">{athlete.position}</p>
                  </div>
                  <StatusIcon className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      STATUS_COLORS[athlete.status]
                    }`}
                  >
                    {athlete.status}
                  </span>
                  {athlete.last_assessment_date && (
                    <span className="text-xs text-gray-500">
                      {new Date(
                        athlete.last_assessment_date
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {athletes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No athletes found</p>
          </div>
        )}
      </div>
    </div>
  );
}
