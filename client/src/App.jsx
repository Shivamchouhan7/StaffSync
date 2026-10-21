import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice';

// Layouts & Guardrails
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupAdminPage from './pages/SetupAdminPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import ManagersPage from './pages/ManagersPage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TrainingsPage from './pages/TrainingsPage';
import PerformancePage from './pages/PerformancePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/setup-admin" element={<SetupAdminPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Directory & Teams */}
        <Route
          path="employees"
          element={
            <ProtectedRoute allowedRoles={['hr', 'manager']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="managers"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <ManagersPage />
            </ProtectedRoute>
          }
        />

        {/* Operations */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />

        {/* Company & Growth */}
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="trainings" element={<TrainingsPage />} />
        <Route path="performance" element={<PerformancePage />} />

        {/* Account Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
