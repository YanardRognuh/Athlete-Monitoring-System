// frontend/src/components/coach/AthleteManagement.jsx
import { useState, useEffect } from "react";
import { athleteAPI } from "../../services/api";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";

const POSITION_OPTIONS = ["Striker", "Midfielder", "Defender", "Goalkeeper"];
const STATUS_OPTIONS = ["Prima", "Fit", "Pemulihan", "Rehabilitasi"];

export default function AthleteManagement() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "Striker",
    status: "Fit",
  });
  const { addToast } = useToast();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      addToast("Name is required", "error");
      return;
    }

    try {
      await athleteAPI.create({
        name: formData.name,
        position: formData.position,
      });
      addToast("Athlete added successfully", "success");
      fetchAthletes();
      setIsAdding(false);
      setFormData({ name: "", position: "Striker", status: "Fit" });
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to add athlete", "error");
    }
  };

  const handleEdit = async (id) => {
    if (!formData.name.trim()) {
      addToast("Name is required", "error");
      return;
    }

    try {
      await athleteAPI.update(id, {
        name: formData.name,
        position: formData.position,
        status: formData.status,
      });
      addToast("Athlete updated successfully", "success");
      fetchAthletes();
      setEditingId(null);
      setFormData({ name: "", position: "Striker", status: "Fit" });
    } catch (err) {
      addToast(
        err.response?.data?.error || "Failed to update athlete",
        "error"
      );
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${name}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await athleteAPI.delete(id);
      addToast("Athlete deleted successfully", "success");
      fetchAthletes();
    } catch (err) {
      addToast(
        err.response?.data?.error || "Failed to delete athlete",
        "error"
      );
    }
  };

  const startEdit = (athlete) => {
    setEditingId(athlete.id);
    setFormData({
      name: athlete.name,
      position: athlete.position,
      status: athlete.status,
    });
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

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Athlete Management
            </h2>
            <p className="mt-1 text-gray-600">
              Add, edit, or remove athletes from your team
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Athlete
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Add New Athlete
          </h3>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Position
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {POSITION_OPTIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add Athlete
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({ name: "", position: "Striker", status: "Fit" });
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Athletes List */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Athlete
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Last Assessment
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {athletes.map((athlete) => (
                <tr
                  key={athlete.id}
                  className={editingId === athlete.id ? "bg-blue-50" : ""}
                >
                  {editingId === athlete.id ? (
                    // Edit Row
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          {POSITION_OPTIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {athlete.last_assessment_date || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(athlete.id)}
                          className="mr-3 text-indigo-600 hover:text-indigo-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Row
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {athlete.name}
                        </div>
                      </td>
                      <td className="flex items-center px-6 py-4 text-gray-500 whitespace-nowrap">
                        <MapPin className="w-4 h-4 mr-1" />
                        {athlete.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
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
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {athlete.last_assessment_date ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(
                              athlete.last_assessment_date
                            ).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <button
                          onClick={() => startEdit(athlete)}
                          className="mr-3 text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(athlete.id, athlete.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {athletes.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No athletes found. Add your first athlete!</p>
          </div>
        )}
      </div>
    </div>
  );
}
