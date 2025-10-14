// frontend/src/pages/MedisPage.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Users, ClipboardList, Dumbbell, Settings, MapPin } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import AthleteList from "../components/medis/AthleteList";
// import TeamList from "../components/medis/TeamList";
import ExerciseLibrary from "../components/medis/ExerciseLibrary";
import AssessmentForm from "../components/medis/AssessmentForm";
import RecommendationManager from "../components/medis/RecommendationManager";

const sidebarItems = [
  { path: "/medis/athletes", label: "Athletes", icon: Users },
  // { path: "/medis/teams", label: "Teams", icon: MapPin },
  { path: "/medis/assessments", label: "Assessments", icon: ClipboardList },
  { path: "/medis/exercises", label: "Exercise Library", icon: Dumbbell },
  { path: "/medis/recommendations", label: "Recommendations", icon: Settings },
];

export default function MedisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-6">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/medis/athletes" replace />}
            />
            <Route path="/athletes" element={<AthleteList />} />
            {/* <Route path="/teams" element={<TeamList />} />{" "} */}
            <Route path="/assessments" element={<AssessmentForm />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route
              path="/recommendations"
              element={<RecommendationManager />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
