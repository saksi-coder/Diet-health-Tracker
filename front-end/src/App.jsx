import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CalorieLog from "./pages/CalorieLog";
import WaterLog from "./pages/WaterLog";
import ExerciseLog from "./pages/ExerciseLog";
import WeightLog from "./pages/WeightLog";
import Profile from "./pages/Profile";

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`main-content ${!isAuthenticated ? "main-content-full" : ""}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/log/calories" element={<CalorieLog />} />
              <Route path="/log/water" element={<WaterLog />} />
              <Route path="/log/exercise" element={<ExerciseLog />} />
              <Route path="/log/weight" element={<WeightLog />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--border-radius-md)",
              fontFamily: "var(--font-family)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "var(--color-success)", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "var(--color-error)", secondary: "#fff" },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
