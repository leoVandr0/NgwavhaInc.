import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import PublicLayout from './layouts/PublicLayout';
import Login from './pages/auth/LoginPage';
import Register from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import HomePage from './pages/HomePage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherLiveSessions from './pages/teacher/TeacherLiveSessions';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentLiveSessions from './pages/common/StudentLiveSessions';
import TeacherProfile from './pages/teacher/TeacherProfile';
import LiveRoom from './pages/common/LiveRoom';
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailsPage from './pages/courses/CourseDetailsPage';
import InstructorsPage from './pages/courses/InstructorsPage';
import LearningPage from './pages/courses/LearningPage';
import CartPage from './pages/student/CartPage';
import WishlistPage from './pages/student/WishlistPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import CookiesPage from './pages/legal/CookiesPage';
import CookieConsent from './components/CookieConsent';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FFA500', // Orange primary
          colorBgBase: '#1a1a1a',  // Dark base
          colorTextBase: '#ffffff', // White text
        },
        algorithm: theme.darkAlgorithm, // Enable Ant Design Dark Mode
      }}
    >
      <WebSocketProvider>
        <AuthProvider>
          <AntApp>
            <CookieConsent />
            <Routes>
              {/* Public Routes with Navbar and Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/course/:slug" element={<CourseDetailsPage />} />
                <Route path="/instructors" element={<InstructorsPage />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/unauthorized" element={
                <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
                  <h1>Access Denied</h1>
                  <p>You do not have permission to view this page.</p>
                  <a href="/" style={{ color: '#FFA500' }}>Return to Home</a>
                </div>
              } />

              {/* Legal Pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              <Route
                path="/learn/:slug"
                element={
                  <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                    <LearningPage />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<div>My Courses</div>} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="assignments" element={<StudentAssignmentsPage />} />
                <Route path="live" element={<StudentLiveSessions />} />
                <Route path="live-room/:meetingId" element={<LiveRoom userRole="student" />} />
                <Route path="schedule" element={<div>My Schedule</div>} />
                <Route path="profile" element={<StudentProfile />} />
                {/* Redirect /student to /student/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Teacher Routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'instructor']}>
                    <TeacherLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="create-course" element={<CreateCourse />} />
                <Route path="courses" element={<TeacherCoursesPage />} />
                <Route path="live" element={<TeacherLiveSessions />} />
                <Route path="live-room/:meetingId" element={<LiveRoom userRole="instructor" />} />
                <Route path="students" element={<TeacherStudentsPage />} />
                <Route path="assignments" element={<TeacherAssignmentsPage />} />
                <Route path="profile" element={<TeacherProfile />} />
                {/* Redirect /teacher to /teacher/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Catch all - Redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AntApp>
        </AuthProvider>
      </WebSocketProvider>
    </ConfigProvider>
  );
}

export default App;
