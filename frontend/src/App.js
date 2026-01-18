import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@/pages/LoginPage';
import FirstLoginPasswordChangePage from '@/pages/FirstLoginPasswordChangePage';
import DashboardPage from '@/pages/DashboardPage';
import DashboardPageV2 from '@/pages/DashboardPageV2';
import BonusPage from '@/pages/BonusPage';
import CarreiraPage from '@/pages/CarreiraPage';
import ExtratoPage from '@/pages/ExtratoPage';
import DREPage from '@/pages/DREPage';
import ForecastPage from '@/pages/ForecastPage';
import CompetenciasPage from '@/pages/CompetenciasPage';
import AdminPage from '@/pages/AdminPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import UserManagementPage from '@/pages/UserManagementPage';
import ProfilePage from '@/pages/ProfilePage';
import '@/App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/first-login-password-change" element={<FirstLoginPasswordChangePage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPageV2 />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard-classic"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/bonus"
              element={
                <PrivateRoute>
                  <BonusPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/carreira"
              element={
                <PrivateRoute>
                  <CarreiraPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/extrato"
              element={
                <PrivateRoute>
                  <ExtratoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dre"
              element={
                <PrivateRoute>
                  <DREPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <PrivateRoute>
                  <ForecastPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/competencias"
              element={
                <PrivateRoute>
                  <CompetenciasPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <PrivateRoute>
                  <UserManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;