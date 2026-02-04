import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Plus, TrendingUp, DollarSign, User, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
    const { currentUser } = useAuth();

    const { data: courses, isLoading: coursesLoading } = useQuery('instructor-courses', async () => {
        const { data } = await api.get('/courses/my');
        return data;
    });

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery('teacher-students', async () => {
        const { data } = await api.get('/enrollments/teacher-students');
        return data;
    });

    const totalStudents = enrollments?.length || 0;
    const totalCourses = courses?.length || 0;

    // Calculate total earnings from actual enrollments
    const totalEarnings = enrollments?.reduce((acc, enrollment) => {
        return acc + (parseFloat(enrollment.pricePaid) || 0);
    }, 0) || 0;

    // Group enrollments by course for better display
    const enrollmentsByCourse = enrollments?.reduce((acc, enrollment) => {
        const courseId = enrollment.course.id;
        if (!acc[courseId]) {
            acc[courseId] = {
                course: enrollment.course,
                students: []
            };
        }
        acc[courseId].students.push(enrollment.student);
        return acc;
    }, {}) || {};

    const recentEnrollments = enrollments?.slice(0, 5) || [];

    return (
        <div className="min-h-screen bg-dark-950 text-white font-sans p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-white">
                            Instructor Dashboard
                        </h1>
                        <p className="text-dark-400 mt-1">
                            Welcome back, {currentUser?.name}. Manage your courses and track performance.
                        </p>
                    </div>
                    <Link
                        to="/teacher/create-course"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-dark-950 font-bold rounded-none transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Course
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-dark-900 border border-dark-800 p-6 flex items-start justify-between">
                        <div>
                            <p className="text-dark-400 text-sm font-medium uppercase tracking-wider">Total Students</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalStudents}</h3>
                        </div>
                        <div className="bg-dark-800 p-3 rounded-full">
                            <Users className="h-6 w-6 text-primary-500" />
                        </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-6 flex items-start justify-between">
                        <div>
                            <p className="text-dark-400 text-sm font-medium uppercase tracking-wider">Total Courses</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalCourses}</h3>
                        </div>
                        <div className="bg-dark-800 p-3 rounded-full">
                            <BookOpen className="h-6 w-6 text-primary-500" />
                        </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-6 flex items-start justify-between">
                        <div>
                            <p className="text-dark-400 text-sm font-medium uppercase tracking-wider">Total Earnings</p>
                            <h3 className="text-4xl font-bold text-white mt-2">${totalEarnings.toFixed(2)}</h3>
                        </div>
                        <div className="bg-dark-800 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-primary-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Enrollments */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Recent Enrollments</h2>
                        
                        {enrollmentsLoading ? (
                            <div className="text-center py-10 text-dark-400">Loading enrollments...</div>
                        ) : recentEnrollments.length > 0 ? (
                            <div className="bg-dark-900 border border-dark-800 overflow-hidden">
                                <div className="divide-y divide-dark-800">
                                    {recentEnrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">{enrollment.student.name}</p>
                                                        <p className="text-sm text-dark-400">{enrollment.student.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-white">{enrollment.course.title}</p>
                                                    <p className="text-xs text-dark-400">
                                                        {new Date(enrollment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-dark-900 border border-dark-800">
                                <Users className="h-12 w-12 text-dark-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No enrollments yet</h3>
                                <p className="text-dark-400">Students will appear here when they enroll in your courses.</p>
                            </div>
                        )}
                    </div>

                    {/* Courses List */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Your Courses</h2>

                        {coursesLoading ? (
                            <div className="text-center py-10 text-dark-400">Loading courses...</div>
                        ) : courses?.length > 0 ? (
                            <div className="bg-dark-900 border border-dark-800 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-800 text-dark-300 text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Course</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-800">
                                        {courses.map((course) => {
                                            const courseEnrollments = enrollmentsByCourse[course.id]?.students || [];
                                            const courseRevenue = courseEnrollments.length * (parseFloat(course.price) || 0);
                                            
                                            return (
                                                <tr key={course.id} className="hover:bg-dark-800/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-12 bg-dark-700 overflow-hidden flex-shrink-0">
                                                                {course.thumbnail && (
                                                                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-white text-sm">{course.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-dark-300">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-primary-500" />
                                                            {courseEnrollments.length}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-dark-300">
                                                        ${courseRevenue.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-dark-900 border border-dark-800">
                                <BookOpen className="h-12 w-12 text-dark-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No courses yet</h3>
                                <p className="text-dark-400 mb-4">Create your first course to start teaching.</p>
                                <Link
                                    to="/teacher/create-course"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-dark-950 font-bold text-sm transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Course
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
