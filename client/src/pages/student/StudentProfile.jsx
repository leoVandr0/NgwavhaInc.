import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    User,
    ChevronRight,
    ExternalLink
} from 'lucide-react';

const StudentProfile = () => {
    const { currentUser } = useAuth();

    // Mock data for the UI demonstration - in a real app these would come from backend
    const stats = [
        { label: 'Enrolled Courses', value: '12', icon: BookOpen },
        { label: 'Hours Learned', value: '248', icon: Clock },
        { label: 'Certificates', value: '8', icon: Award },
        { label: 'Learning Streak', value: '45', icon: TrendingUp },
    ];

    const weeklyProgress = [
        { day: 'Mon', hours: 2.5, height: '40%' },
        { day: 'Tue', hours: 1.5, height: '25%' },
        { day: 'Wed', hours: 3, height: '50%' },
        { day: 'Thu', hours: 0, height: '4%' },
        { day: 'Fri', hours: 2, height: '35%' },
        { day: 'Sat', hours: 4, height: '70%' },
        { day: 'Sun', hours: 1, height: '15%' },
    ];

    const achievements = [
        {
            title: 'Fast Learner',
            description: 'Completed 5 courses in one month',
            date: 'Earned Jan 15, 2026',
            icon: '🚀'
        },
        {
            title: 'Coding Streak',
            description: '30 days learning streak',
            date: 'Earned Jan 10, 2026',
            icon: '🔥'
        },
        {
            title: 'Certificate Master',
            description: 'Earned 10 certificates',
            date: 'Earned Dec 28, 2025',
            icon: '🏆'
        },
        {
            title: 'Early Bird',
            description: 'Completed lessons before 8 AM for 7 days',
            date: 'Earned Dec 20, 2025',
            icon: '🌅'
        },
    ];

    const ongoingCourses = [
        {
            title: 'Complete Web Development Bootcamp 2026',
            instructor: 'Angela Yu',
            timeAgo: '2 hours ago',
            progress: 68,
            lessons: '35/52',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300'
        },
        {
            title: 'Advanced React & Redux Masterclass',
            instructor: 'Maximilian Schwarzmüller',
            timeAgo: '1 day ago',
            progress: 42,
            lessons: '16/38',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=300'
        },
        {
            title: 'Python for Data Science and Machine Learning',
            instructor: 'Jose Portilla',
            timeAgo: '3 days ago',
            progress: 25,
            lessons: '11/45',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bbda38a5f452?auto=format&fit=crop&q=80&w=300'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Sidebar Section */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-dark-900 border-2 border-primary-500 rounded-2xl p-8 flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center mb-6">
                            <User className="w-16 h-16 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold mb-1">{currentUser?.name || "Sarah Johnson"}</h2>
                        <p className="text-dark-400 text-sm mb-6">{currentUser?.email || "sarah.johnson@email.com"}</p>

                        <p className="text-dark-300 text-sm mb-8 leading-relaxed">
                            Passionate learner exploring web development, data science, and design. Always eager to learn new skills!
                        </p>

                        {/* Sidebar Stats Grid */}
                        <div className="grid grid-cols-1 gap-4 w-full mb-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 flex items-center gap-4 group hover:border-primary-500/30 transition-colors">
                                    <div className="w-12 h-12 rounded-full border border-primary-500/50 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-dark-950 transition-all duration-300">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-dark-400 font-bold leading-none mb-1">{stat.label}</p>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-primary-500 hover:bg-primary-600 text-dark-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="flex-1 space-y-8">

                    {/* Weekly Progress Card */}
                    <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 lg:p-8">
                        <h3 className="text-xl font-bold mb-8">This Week's Progress</h3>

                        <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                            {/* Bar Chart */}
                            <div className="flex-1 w-full">
                                <div className="flex items-end justify-between h-40 gap-3 lg:gap-6 mb-4 px-2">
                                    {weeklyProgress.map((day, idx) => (
                                        <div key={idx} className="flex flex-col items-center flex-1 group">
                                            {/* Bar Container */}
                                            <div className="w-full bg-dark-800/50 rounded-lg h-32 relative overflow-hidden mb-3">
                                                {/* Bar Fill */}
                                                <div
                                                    className={`absolute bottom-0 w-full rounded-b-lg transition-all duration-700 ease-out ${idx === 5 ? 'bg-primary-500' : 'bg-primary-600/40'} group-hover:bg-primary-500 shadow-[0_0_15px_rgba(255,165,0,0.2)]`}
                                                    style={{ height: day.height }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest text-dark-400 font-bold mb-1 opacity-60">{day.day}</span>
                                            <span className="text-xs font-bold text-white group-hover:text-primary-500 transition-colors">{day.hours}h</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="flex flex-row md:flex-col justify-between items-end md:items-start w-full md:w-48 gap-4 md:border-l md:border-dark-800 md:pl-10 pb-2">
                                <div>
                                    <p className="text-xs text-dark-400 font-medium mb-1">Total this week</p>
                                    <p className="text-4xl font-black text-white">14.5 <span className="text-primary-500 text-xl">hours</span></p>
                                </div>
                                <div className="text-right md:text-left">
                                    <p className="text-[10px] uppercase tracking-widest text-dark-400 font-bold mb-1">vs last week</p>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-md">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        <p className="text-green-500 text-sm font-bold tracking-tight">
                                            +2.5 hours
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Achievements Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-bold">Recent Achievements</h3>
                            <button className="text-[10px] font-black text-primary-500 hover:text-primary-400 flex items-center gap-1.5 uppercase tracking-widest group transition-all">
                                View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {achievements.map((achievement, idx) => (
                                <div key={idx} className="bg-dark-900 border border-dark-800 rounded-3xl p-6 flex items-start gap-6 hover:border-primary-500/20 hover:bg-dark-800/30 transition-all duration-300 group">
                                    <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110 drop-shadow-xl">{achievement.icon}</div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-lg mb-1 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{achievement.title}</h4>
                                        <p className="text-dark-400 text-sm mb-4 leading-relaxed font-medium">{achievement.description}</p>
                                        <div className="inline-block px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
                                            <p className="text-[10px] uppercase tracking-widest text-primary-500 font-black">{achievement.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Continue Learning Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-bold">Continue Learning</h3>
                            <button className="text-[10px] font-black text-primary-500 hover:text-primary-400 flex items-center gap-1.5 uppercase tracking-widest group transition-all">
                                View All Courses <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {ongoingCourses.map((course, idx) => (
                                <div key={idx} className="bg-dark-900 border border-dark-800 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-8 hover:border-primary-500/30 hover:bg-dark-800/30 transition-all duration-300 group">
                                    {/* Course Image */}
                                    <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-500 rounded-lg text-dark-950 text-[10px] font-black uppercase tracking-widest">
                                            Live Course
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <h4 className="font-bold text-xl mb-1 group-hover:text-primary-500 transition-colors tracking-tight truncate">{course.title}</h4>
                                                <p className="text-dark-400 text-sm font-medium">{course.instructor}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="sm:hidden w-full bg-primary-500 hover:bg-primary-600 text-dark-950 font-black px-8 py-3 rounded-xl transition-all h-fit">
                                                    Continue
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-dark-400 mb-5">
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-500" /> {course.timeAgo}</span>
                                            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-500" /> {course.lessons} lessons</span>
                                        </div>

                                        {/* Progress Bar Container */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Mastery Progress</span>
                                                <span className="text-xs font-black text-primary-500">{course.progress}%</span>
                                            </div>
                                            <div className="relative w-full bg-dark-800 h-2.5 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="hidden md:block bg-primary-500 hover:bg-primary-600 active:scale-95 text-dark-950 font-black px-10 py-4 rounded-2xl transition-all h-fit shadow-lg shadow-primary-500/20">
                                        Continue
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
