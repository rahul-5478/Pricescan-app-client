import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/Layout";

// Pages
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyzePage  from "./pages/AnalyzePage";
import ChatPage     from "./pages/ChatPage";
import HistoryPage  from "./pages/HistoryPage";
import InsightsPage from "./pages/InsightsPage";
import AIToolsPage  from "./pages/AIToolsPage";
import VisualAnalyzePage from "./pages/VisualAnalyzePage";
import SocialToolsPage from "./pages/SocialToolsPage";
import NicheToolsPage from "./pages/NicheToolsPage";
import WishlistPage from "./pages/WishlistPage";
import AlertsPage   from "./pages/AlertsPage";
import BulkPage     from "./pages/BulkPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Routes>
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyze"   element={<AnalyzePage />} />
        <Route path="/chat"      element={<ChatPage />} />
        <Route path="/history"   element={<HistoryPage />} />
        <Route path="/insights"  element={<InsightsPage />} />
        <Route path="/ai-tools"  element={<AIToolsPage />} />
        <Route path="/visual"    element={<VisualAnalyzePage />} />
        <Route path="/social"    element={<SocialToolsPage />} />
        <Route path="/niche"     element={<NicheToolsPage />} />
        <Route path="/wishlist"  element={<WishlistPage />} />
        <Route path="/alerts"    element={<AlertsPage />} />
        <Route path="/bulk"      element={<BulkPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}