import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AlertsPage } from './pages/AlertsPage';
import { LogsPage } from './pages/LogsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SrePage } from './pages/SrePage';
import { FilesPage } from './pages/FilesPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0B0E14] flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing NEXUS OBSERVE authentication...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="infrastructure" element={<InfrastructurePage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="sre" element={<SrePage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
