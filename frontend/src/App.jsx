import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./features/queue/LoginPage";
import RegisterPage from "./features/queue/RegisterPage";
import ReceptionistDashboard from "./features/receptionist/ReceptionistDashboard";
import PatientWaitingRoom from "./features/patient/PatientWaitingRoom";
import SettingsPage from "./features/queue/SettingsPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/receptionist" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid rgba(20,184,166,0.2)", borderRadius: "12px", fontSize: "14px" },
          success: { iconTheme: { primary: "#14b8a6", secondary: "#0f172a" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#0f172a" } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/receptionist" element={<ProtectedRoute><ReceptionistDashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/patient/:clinicId" element={<PatientWaitingRoom />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
