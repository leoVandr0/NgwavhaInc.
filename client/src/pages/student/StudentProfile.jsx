import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    User,
    ChevronRight,
    ExternalLink,
    Play,
    Calendar,
    Target,
    Zap
} from 'lucide-react';
import { Card, Row, Col, Statistic, Progress, Avatar, Button, Badge, Timeline } from 'antd';
import useStudentData from '../../hooks/useStudentData';

const StudentProfile = () => {
    const { currentUser } = useAuth();
    const {
        loading,
        studentStats,
        enrolledCourses,
        weeklyProgress,
        achievements,
        recentActivity
    } = useStudentData();

    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-white text-xl">Loading profile data...</div>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Enrolled Courses',
            value: studentStats?.enrolledCourses || 0,
            icon: <BookOpen className="text-primary-500" />,
            color: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            title: 'Hours Learned',
            value: studentStats?.hoursLearned || 0,
            icon: <Clock className="text-green-500" />,
            color: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
        },
        {
            title: 'Certificates',
            value: studentStats?.certificates || 0,
            icon: <Award className="text-yellow-500" />,
            color: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20'
        },
        {
            title: 'Learning Streak',
            value: `${studentStats?.learningStreak || 0} days`,
            icon: <TrendingUp className="text-orange-500" />,
            color: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20'
        }
    ];

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Stats Grid */}
            <Row gutter={[16, 16]}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            className="bg-dark-800 border-dark-700 hover:border-primary-500/30 transition-all duration-300"
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-dark-400 text-sm mb-2">{stat.title}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color} ${stat.borderColor} border`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Weekly Progress */}
            <Card
                title="This Week's Progress"
                className="bg-dark-800 border-dark-700"
                bodyStyle={{ padding: '24px' }}
            >
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} lg={16}>
                        <div className="space-y-4">
                            <div className="flex items-end justify-between h-40 gap-2">
                                {weeklyProgress.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full bg-dark-700 rounded-lg h-32 relative overflow-hidden mb-2">
                                            <div
                                                className={`absolute bottom-0 w-full rounded-b-lg transition-all duration-700 ${index === weeklyProgress.length - 1 ? 'bg-primary-500' : 'bg-primary-600/40'
                                                    }`}
                                                style={{ height: day.height }}
                                            />
                                        </div>
                                        <span className="text-xs text-dark-400 font-medium">{day.day}</span>
                                        <span className="text-sm font-bold text-white">{day.hours}h</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-600">
                                <div>
                                    <p className="text-xs text-dark-400">Total this week</p>
                                    <p className="text-2xl font-bold text-white">
                                        {weeklyProgress.reduce((sum, day) => sum + day.hours, 0)}
                                        <span className="text-primary-500 text-xl ml-1">hours</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-dark-400">vs last week</p>
                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-md">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        <p className="text-green-500 text-sm font-bold">+2.5 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={8}>
                        <div className="space-y-4">
                            <div className="bg-dark-700 rounded-lg p-4">
                                <p className="text-xs text-dark-400 mb-2">Current Streak</p>
                                <p className="text-3xl font-bold text-primary-500">
                                    {studentStats?.learningStreak || 0}
                                </p>
                                <p className="text-xs text-dark-400 mt-1">days in a row</p>
                            </div>
                            <div className="bg-dark-700 rounded-lg p-4">
                                <p className="text-xs text-dark-400 mb-2">Average Progress</p>
                                <Progress
                                    percent={studentStats?.averageProgress || 0}
                                    strokeColor={{
                                        '0%': '#FFA500',
                                        '100%': '#FFA500',
                                    }}
                                    trailColor="#374151"
                                    strokeWidth={8}
                                />
                                <p className="text-xs text-dark-400 mt-2 text-center">
                                    {studentStats?.averageProgress || 0}% complete
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Recent Achievements */}
            <Card
                title="Recent Achievements"
                className="bg-dark-800 border-dark-700"
                bodyStyle={{ padding: '24px' }}
                extra={
                    <Button type="link" className="text-primary-500">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    {achievements.slice(0, 4).map((achievement) => (
                        <Col xs={24} sm={12} lg={6} key={achievement.id}>
                            <Card
                                className="bg-dark-700 border-dark-600 hover:border-primary-500/20 transition-all duration-300 group"
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {achievement.icon}
                                    </div>
                                    <h4 className="font-bold text-white mb-2 group-hover:text-primary-500 transition-colors">
                                        {achievement.title}
                                    </h4>
                                    <p className="text-dark-400 text-sm mb-3">{achievement.description}</p>
                                    <Badge
                                        count={achievement.date}
                                        className="bg-primary-500/10 text-primary-500 border-primary-500/20"
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </div>
    );

    const renderCourses = () => (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                {enrolledCourses.map((course) => (
                    <Col xs={24} md={12} lg={8} key={course.id}>
                        <Card
                            className="bg-dark-800 border-dark-700 hover:border-primary-500/30 transition-all duration-300 group"
                            cover={
                                <div className="relative">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            }
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-primary-500 transition-colors line-clamp-2">
                                        {course.title}
                                    </h4>
                                    <p className="text-dark-400 text-sm">{course.instructor}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-dark-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-primary-500" />
                                        {course.timeAgo}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4 text-primary-500" />
                                        {course.lessons}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-dark-400">Progress</span>
                                        <span className="text-sm font-bold text-primary-500">{course.progress}%</span>
                                    </div>
                                    <Progress
                                        percent={course.progress}
                                        strokeColor={{
                                            '0%': '#FFA500',
                                            '100%': '#FFA500',
                                        }}
                                        trailColor="#374151"
                                        strokeWidth={6}
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    className="w-full"
                                    icon={<Play className="w-4 h-4" />}
                                >
                                    Continue Learning
                                </Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );

    const renderActivity = () => (
        <Card
            title="Recent Activity"
            className="bg-dark-800 border-dark-700"
            bodyStyle={{ padding: '24px' }}
        >
            <Timeline
                items={recentActivity.map((activity) => ({
                    dot: activity.icon,
                    color: activity.type === 'achievement_earned' ? '#FFA500' : '#374151',
                    children: (
                        <div className="space-y-1">
                            <p className="text-white font-medium">{activity.title}</p>
                            {activity.description && (
                                <p className="text-dark-400 text-sm">{activity.description}</p>
                            )}
                            <p className="text-dark-500 text-xs">{activity.time}</p>
                        </div>
                    )
                }))}
            />
        </Card>
    );

    return (
        <div className="w-full overflow-hidden">
            {/* Header */}
            <div className="bg-dark-900 border-b border-dark-800">
                <div className="w-full px-4 lg:px-6 py-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                        {/* Profile Section */}
                        <div className="flex items-center gap-6">
                            <Avatar
                                size={80}
                                src={currentUser?.avatar}
                                className="bg-primary-500"
                            >
                                <User className="w-8 h-8" />
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    {currentUser?.name || "Student Name"}
                                </h1>
                                <p className="text-dark-400">
                                    {currentUser?.email || "student@example.com"}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex-1 flex lg:justify-end">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'overview', label: 'Overview' },
                                    { key: 'courses', label: 'My Courses' },
                                    { key: 'activity', label: 'Activity' }
                                ].map((tab) => (
                                    <Button
                                        key={tab.key}
                                        type={activeTab === tab.key ? 'primary' : 'text'}
                                        className="mb-2 lg:mb-0"
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        {tab.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full px-4 lg:px-6 py-6">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'courses' && renderCourses()}
                {activeTab === 'activity' && renderActivity()}
            </div>
        </div>
    );
};

export default StudentProfile;
