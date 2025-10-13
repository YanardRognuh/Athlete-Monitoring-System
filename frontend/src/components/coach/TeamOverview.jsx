import { useState, useEffect } from "react";
import { dashboardAPI } from "../../services/api";
import { Users, Activity, TrendingUp, Shield } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  Prima: "#10b981",
  Fit: "#3b82f6",
  Pemulihan: "#f59e0b",
  Rehabilitasi: "#ef4444",
};

const POSITION_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function TeamOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await dashboardAPI.getTeamOverview();
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
    } finally {
      setLoading(false);
    }
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

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load team data
      </div>
    );
  }

  const statusData = Object.entries(data.statusDistribution).map(
    ([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name],
    })
  );

  const positionData = Object.entries(data.positionDistribution).map(
    ([name, value], index) => ({
      name,
      value,
      color: POSITION_COLORS[index],
    })
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Overview</h2>
        <p className="text-gray-600 mt-1">
          Monitor your entire team's performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Athletes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.totalAthletes}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Fitness</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.avgTeamFitness}%
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prima Athletes</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {data.statusDistribution.Prima}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Rehabilitation</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {data.statusDistribution.Rehabilitasi}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Position Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Position Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={positionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Athletes">
                {positionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Athletes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Athletes
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Position
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Last Assessment
                </th>
              </tr>
            </thead>
            <tbody>
              {data.athletes.map((athlete) => (
                <tr key={athlete.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {athlete.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {athlete.position}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${STATUS_COLORS[athlete.status]}20`,
                        color: STATUS_COLORS[athlete.status],
                      }}
                    >
                      {athlete.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {athlete.lastAssessment || "No assessment yet"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
