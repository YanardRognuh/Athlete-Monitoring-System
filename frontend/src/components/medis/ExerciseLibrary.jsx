// frontend/src/components/medis/ExerciseLibrary.jsx
import { useState, useEffect } from "react";
import { exerciseAPI } from "../../services/api";
import { Dumbbell, Plus, Search, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import LoadingSkeleton from "../common/LoadingSkeleton";

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    focusArea: "",
    description: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await exerciseAPI.getAll();
      setExercises(response.data);
    } catch (err) {
      setError("Failed to load exercises");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExercise = async () => {
    const { name, type, focusArea } = formData;
    if (!name.trim() || !type.trim() || !focusArea.trim()) {
      addToast("Name, type, and focus area are required", "error");
      return;
    }

    try {
      await exerciseAPI.create({
        name,
        type,
        focusArea,
        description: formData.description || null,
      });
      addToast("Exercise added successfully", "success");
      fetchExercises();
      setIsAdding(false);
      setFormData({ name: "", type: "", focusArea: "", description: "" });
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to add exercise", "error");
    }
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.focus_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-lg animate-pulse">
            <div className="w-1/4 h-4 mb-4 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-3 mb-2 bg-gray-200 rounded"></div>
            <div className="w-1/3 h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Exercise Library
            </h2>
            <p className="mt-1 text-gray-600">
              Manage and create training exercises for athletes
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mt-4">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
            Add New Exercise
          </h3>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
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
                placeholder="Sprint 100m"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Type *
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Cardio"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Focus Area *
              </label>
              <input
                type="text"
                name="focusArea"
                value={formData.focusArea}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Kecepatan"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Latihan sprint jarak pendek"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleAddExercise}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Add Exercise
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({
                  name: "",
                  type: "",
                  focusArea: "",
                  description: "",
                });
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exercises Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-5 transition bg-white border border-gray-200 rounded-lg hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">
                      {exercise.name}
                    </h3>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span> {exercise.type}
                    </div>
                    <div>
                      <span className="font-medium">Focus:</span>{" "}
                      {exercise.focus_area}
                    </div>
                  </div>
                </div>
              </div>
              {exercise.description && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">
                    {exercise.description}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 col-span-full">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No exercises found</p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="mt-2 font-medium text-indigo-600 hover:text-indigo-800"
              >
                Add your first exercise
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
