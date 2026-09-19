import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import GoalsPage from './pages/GoalsPage';
import CreateGoalPage from './pages/CreateGoalPage';
import GoalDetailsPage from './pages/GoalDetailsPage';
import EditGoalPage from './pages/EditGoalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProgressPage from './pages/ProgressPage';
import AchievementsPage from './pages/AchievementsPage';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DesignSystemShowcase from './pages/DesignSystemShowcase';
import TasksPage from './pages/TasksPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider position="bottom-right">
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
            </Route>

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Goal & Task Management Routes */}
              <Route path="goals" element={<GoalsPage />} />
              <Route path="goals/create" element={<CreateGoalPage />} />
              <Route path="goals/:id" element={<GoalDetailsPage />} />
              <Route path="goals/:id/edit" element={<EditGoalPage />} />
              <Route path="tasks" element={<TasksPage />} />

              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="design-system" element={<DesignSystemShowcase />} />
            </Route>

            {/* Fallback Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
