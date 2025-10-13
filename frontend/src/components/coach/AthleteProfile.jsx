import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { athleteAPI, dashboardAPI } from "../../services/api";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Moon,
  Dumbbell,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const METRIC_CATEGORIES = [
  { value: "Pemeriksaan Fisik", label: "Physical" },
  { value: "Kesehatan Mental", label: "Mental Health" },
  { value: "Kualitas Tidur", label: "Sleep Quality" },
];

export default function AthleteProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [physicalData, setPhysicalData] = useState(null);
  const [mentalData, setMentalData] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Pemeriksaan Fisik");
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAthleteData();
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedCategory) {
      fetchPerformanceData();
    }
  }, [id, selectedCategory, selectedMetric]);

  const fetchAthleteData = async () => {
    try {
      const [athleteRes, physicalRes, mentalRes, sleepRes] = await Promise.all([
        athleteAPI.getById(id),
        dashboardAPI.getPhysical(id),
        dashboardAPI.getMental(id),
        dashboardAPI.getSleep(id),
      ]);

      setAthlete(athleteRes.data);
      setPhysicalData(physicalRes.data);
      setMentalData(mentalRes.data);
      setSleepData(sleepRes.data);
    } catch (err) {
      console.error("Failed to fetch athlete data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await dashboardAPI.getPerformance(
        id,
        selectedCategory,
        selectedMetric
      );
      setPerformanceData(response.data);
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Athlete not found
      </div>
    );
  }

  // Prepare chart data
  const getPerformanceChartData = () => {
    if (!performanceData || performanceData.length === 0) return [];

    const chartData = [];
    performanceData.forEach((metricGroup) => {
      metricGroup.data.forEach((point) => {
        const existingPoint = chartData.find((p) => p.date === point.date);
        if (existingPoint) {
          existingPoint[point.metric] = point.value;
          existingPoint[`${point.metric}_change`] = point.percentageChange;
        } else {
          chartData.push({
            date: point.date,
            [point.metric]: point.value,
            [`${point.metric}_change`]: point.percentageChange,
          });
        }
      });
    });

    return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const radarData =
    physicalData?.metrics.map((m) => ({
      metric: m.metric,
      value: m.value,
      fullMark: m.maxValue,
    })) || [];

  const mentalBarData =
    mentalData?.metrics.map((m) => ({
      name: m.metric,
      value: m.value,
      maxValue: m.maxValue,
    })) || [];

  const sleepBarData =
    sleepData?.metrics.map((m) => ({
      name: m.metric,
      value: m.value,
      maxValue: m.maxValue,
    })) || [];

  const performanceChartData = getPerformanceChartData();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/coach/dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{athlete.name}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">{athlete.position}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  athlete.status === "Prima"
                    ? "bg-green-100 text-green-800"
                    : athlete.status === "Fit"
                    ? "bg-blue-100 text-blue-800"
                    : athlete.status === "Pemulihan"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {athlete.status}
              </span>
            </div>
          </div>

          {athlete.last_assessment_date && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Last Assessment</p>
              <p className="font-semibold text-gray-900">
                {new Date(athlete.last_assessment_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Tracking Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Tracking
            </h3>
          </div>

          <div className="flex space-x-2">
            {METRIC_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setSelectedMetric(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === cat.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {performanceChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => {
                  if (name.includes("_change")) return null;
                  const changeName = `${name}_change`;
                  const change = performanceChartData.find(
                    (d) => d[name] === value
                  )?.[changeName];
                  return [
                    `${value}/10 ${
                      change ? `(${change > 0 ? "+" : ""}${change}%)` : ""
                    }`,
                    name,
                  ];
                }}
              />
              <Legend />
              {performanceData.map((metricGroup, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={metricGroup.metric}
                  stroke={`hsl(${idx * 60}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No performance data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Physical Assessment - Spider Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Physical Assessment
              </h3>
            </div>
            {physicalData?.overallScore !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Fitness</p>
                <p className="text-2xl font-bold text-green-600">
                  {physicalData.overallScore}%
                </p>
              </div>
            )}
          </div>

          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No physical assessment data
            </div>
          )}
        </div>

        {/* Mental Health - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Mental Health
            </h3>
          </div>

          {mentalBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mentalBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No mental health data
            </div>
          )}
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Moon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sleep Quality</h3>
        </div>

        {sleepData?.warning && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {sleepData.warning}
          </div>
        )}

        {sleepBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sleepBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Score" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No sleep quality data
          </div>
        )}
      </div>
    </div>
  );
}
