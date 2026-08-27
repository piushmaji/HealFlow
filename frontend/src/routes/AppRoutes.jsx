import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { DoctorsDirectoryPage } from '../pages/DoctorsDirectoryPage';
import { DoctorDetailsPage } from '../pages/DoctorDetailsPage';
import { BookAppointmentPage } from '../pages/BookAppointmentPage';
import { LiveQueuePage } from '../pages/LiveQueuePage';
import { PatientDashboardPage } from '../pages/PatientDashboardPage';
import { PatientProfilePage } from '../pages/PatientProfilePage';
import { DoctorConsultationChatPage } from '../pages/DoctorConsultationChatPage';
import { DoctorDashboardPage } from '../pages/DoctorDashboardPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { StyleGuidePage } from '../pages/StyleGuidePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// 1. General Protected Route Guard (Must be logged in)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 2. Unauthenticated Only Route Guard (If logged in, redirect directly to user workspace)
const UnauthenticatedOnlyRoute = ({ children }) => {
  const { isAuthenticated, isDoctor } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isDoctor ? "/doctor-dashboard" : "/patients/dashboard"} replace />;
  }
  return children;
};

// 3. Patient Only Route Guard (Strict Patient Access)
const PatientOnlyRoute = ({ children }) => {
  const { isAuthenticated, isPatient } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isPatient) {
    return <Navigate to="/doctor-dashboard" replace />;
  }
  return children;
};

// 4. Doctor Only Route Guard (Strict Doctor Access)
const DoctorOnlyRoute = ({ children }) => {
  const { isAuthenticated, isDoctor } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isDoctor) {
    return <Navigate to="/patients/dashboard" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Landing Page Layout (Only accessible when LOGGED OUT) */}
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <UnauthenticatedOnlyRoute>
              <HomePage />
            </UnauthenticatedOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <UnauthenticatedOnlyRoute>
              <LoginPage />
            </UnauthenticatedOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnauthenticatedOnlyRoute>
              <LoginPage />
            </UnauthenticatedOnlyRoute>
          }
        />
        <Route path="/style-guide" element={<StyleGuidePage />} />
      </Route>

      {/* 2. Authenticated Common Dashboard Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Patient Exclusive Routes */}
        <Route
          path="/patients/dashboard"
          element={
            <PatientOnlyRoute>
              <PatientDashboardPage />
            </PatientOnlyRoute>
          }
        />
        <Route
          path="/patient-dashboard"
          element={
            <PatientOnlyRoute>
              <PatientDashboardPage />
            </PatientOnlyRoute>
          }
        />
        <Route
          path="/patients/profile"
          element={
            <PatientOnlyRoute>
              <PatientProfilePage />
            </PatientOnlyRoute>
          }
        />
        <Route
          path="/patients/consultation/:appointmentId"
          element={
            <PatientOnlyRoute>
              <DoctorConsultationChatPage />
            </PatientOnlyRoute>
          }
        />
        <Route
          path="/patients/chat/:appointmentId"
          element={
            <PatientOnlyRoute>
              <DoctorConsultationChatPage />
            </PatientOnlyRoute>
          }
        />

        {/* Doctor Exclusive Route */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorOnlyRoute>
              <DoctorDashboardPage />
            </DoctorOnlyRoute>
          }
        />

        {/* Shared Workspace Feature Routes */}
        <Route path="/doctors" element={<DoctorsDirectoryPage />} />
        <Route path="/doctors/:doctorId" element={<DoctorDetailsPage />} />
        <Route path="/doctors/:doctorId/book" element={<BookAppointmentPage />} />
        <Route path="/patients/book-slot/:doctorId" element={<BookAppointmentPage />} />
        <Route path="/book-slot" element={<BookAppointmentPage />} />
        <Route path="/book-slot/:doctorId" element={<BookAppointmentPage />} />

        {/* Live Queue Routes */}
        <Route path="/patients/live-queue" element={<LiveQueuePage />} />
        <Route path="/patients/live-queue/:appointmentId" element={<LiveQueuePage />} />
        <Route path="/live-queue" element={<LiveQueuePage />} />
        <Route path="/live-queue/:appointmentId" element={<LiveQueuePage />} />

        {/* AI Assistant Routes */}
        <Route path="/patients/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
