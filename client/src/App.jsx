import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CourseListPage from './pages/courses/CourseListPage'
import CourseDetailsPage from './pages/courses/CourseDetailsPage'
import StudentDashboard from './pages/student/StudentDashboard'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/courses" element={<CourseListPage />} />
                    <Route path="/course/:slug" element={<CourseDetailsPage />} />

                    {/* Student Routes */}
                    <Route element={<ProtectedRoute role="student" />}>
                        <Route path="/my-courses" element={<StudentDashboard />} />
                    </Route>

                    {/* Instructor Routes */}
                    <Route element={<ProtectedRoute role="instructor" />}>
                        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
