import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContexts";
import LoginPage from "./pages/LoginPage";
import MedisPage from "./pages/MedisPage";
import CoachPage from "./pages/CoachPage";
import LoadingSkeleton from "./components/common/LoadingSkeleton";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === "medis" ? (
              <Navigate to="/medis" replace />
            ) : (
              <Navigate to="/coach" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/medis/*"
        element={
          <ProtectedRoute allowedRoles={["medis"]}>
            <MedisPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/*"
        element={
          <ProtectedRoute allowedRoles={["pelatih"]}>
            <CoachPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
