import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Plus, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
    const { currentUser } = useAuth();

    const { data: courses, isLoading } = useQuery('instructor-courses', async () => {
        const { data } = await api.get('/courses/my');
        return data; // Now includes studentCount
    });

    const totalStudents = courses?.reduce((acc, course) => acc + (parseInt(course.studentCount) || 0), 0) || 0;
    const totalCourses = courses?.length || 0;

    // Calculate total earnings (mock logic, assuming price * students)
    // In a real app, we'd fetch transaction stats
    const totalEarnings = courses?.reduce((acc, course) => {
        return acc + ((parseInt(course.studentCount) || 0) * (parseFloat(course.price) || 0));
    }, 0) || 0;

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
                            <p className="text-dark-400 text-sm font-medium uppercase tracking-wider">Total Earnings (Est.)</p>
                            <h3 className="text-4xl font-bold text-white mt-2">${totalEarnings.toFixed(2)}</h3>
                        </div>
                        <div className="bg-dark-800 p-3 rounded-full">
                            <DollarSign className="h-6 w-6 text-primary-500" />
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Your Courses</h2>

                    {isLoading ? (
                        <div className="text-center py-10 text-dark-400">Loading courses...</div>
                    ) : courses?.length > 0 ? (
                        <div className="bg-dark-900 border border-dark-800 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-dark-800 text-dark-300 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Students</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-dark-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-16 bg-dark-700 overflow-hidden flex-shrink-0">
                                                        {course.thumbnail && (
                                                            <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-white">{course.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-dark-300">
                                                {parseInt(course.studentCount) || 0}
                                            </td>
                                            <td className="px-6 py-4 text-dark-300">
                                                ${course.price}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'published'
                                                        ? 'bg-green-100 text-green-800' // Using standard colors for status visibility, or could use orange
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to="/teacher/courses" // Assuming this page handles content editing
                                                    className="text-primary-500 hover:text-primary-400 font-medium text-sm"
                                                >
                                                    Edit Content
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-dark-900 border border-dark-800">
                            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
                            <p className="text-dark-400 mb-6">Create your first course to start teaching.</p>
                            <Link
                                to="/teacher/create-course"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-dark-950 font-bold transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Create Course
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
