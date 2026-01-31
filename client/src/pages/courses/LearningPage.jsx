import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Play,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    MessageSquare,
    Star,
    ArrowLeft,
    Monitor,
    Download
} from 'lucide-react';
import { Layout, Menu, Collapse, Progress, Tabs, Button, message } from 'antd';
import api from '../../services/api';

const { Header, Sider, Content } = Layout;
const { Panel } = Collapse;

const LearningPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeLecture, setActiveLecture] = useState(null);
    const [expandedSections, setExpandedSections] = useState([]);

    const { data: learningData, isLoading, error } = useQuery(
        ['learning-content', slug],
        async () => {
            const { data } = await api.get(`/enrollments/courses/${slug}/content`);
            return data;
        },
        {
            onSuccess: (data) => {
                // Set first lecture with a video as default
                if (data.content?.sections) {
                    for (const section of data.content.sections) {
                        if (section.lectures?.length > 0) {
                            setActiveLecture(section.lectures[0]);
                            setExpandedSections([section._id]);
                            break;
                        }
                    }
                }
            },
            onError: () => {
                message.error('You must be enrolled to view this content');
                navigate(`/course/${slug}`);
            }
        }
    );

    const updateProgressMutation = useMutation(
        async (lectureId) => {
            return await api.put(`/enrollments/${learningData.course.id}/progress`, { lectureId });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['learning-content', slug]);
            }
        }
    );

    const handleLectureClick = (lecture) => {
        setActiveLecture(lecture);
        if (!learningData.enrollment.completedLectures?.includes(lecture._id)) {
            updateProgressMutation.mutate(lecture._id);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (error) return null;

    const { course, content, enrollment } = learningData;

    return (
        <Layout className="min-h-screen bg-dark-950">
            {/* Dark Header */}
            <Header className="bg-dark-900 border-b border-dark-800 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button
                        type="text"
                        icon={<ArrowLeft className="text-white" />}
                        onClick={() => navigate('/student/dashboard')}
                        className="hover:bg-dark-800"
                    />
                    <div className="hidden md:block">
                        <h1 className="text-white text-base font-bold truncate max-w-md">{course.title}</h1>
                        <div className="flex items-center gap-2">
                            <Progress
                                percent={Math.round(enrollment.progress)}
                                size="small"
                                strokeColor="#FFA500"
                                showInfo={false}
                                className="w-24 mb-0"
                            />
                            <span className="text-xs text-dark-400">{Math.round(enrollment.progress)}% Complete</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        className="bg-dark-800 border-dark-700 text-white hover:bg-dark-700 flex items-center gap-2"
                        icon={<Star className="h-4 w-4 text-yellow-500" />}
                    >
                        Leave a rating
                    </Button>
                </div>
            </Header>

            <Layout>
                {/* Main Content Area */}
                <Content className="overflow-y-auto bg-black">
                    <div className="max-w-6xl mx-auto">
                        {/* Video Player Section */}
                        <div className="aspect-video bg-dark-900 relative group">
                            {activeLecture?.videoUrl ? (
                                <video
                                    src={`http://localhost:5000${activeLecture.videoUrl}`}
                                    controls
                                    className="w-full h-full"
                                    controlsList="nodownload"
                                    autoPlay
                                    key={activeLecture._id}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-center flex-col items-center justify-center text-dark-500 space-y-4">
                                    <Monitor className="h-20 w-20 opacity-20" />
                                    <p className="text-xl">Select a lecture to start watching</p>
                                </div>
                            )}
                        </div>

                        {/* Lecture Info and Tabs */}
                        <div className="p-8 pb-20">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">{activeLecture?.title || 'Welcome back!'}</h2>
                                <p className="text-dark-400">{activeLecture?.description}</p>
                            </div>

                            <Tabs
                                defaultActiveKey="overview"
                                className="custom-tabs"
                                items={[
                                    {
                                        key: 'overview',
                                        label: 'Overview',
                                        children: (
                                            <div className="text-dark-300 space-y-6 max-w-3xl">
                                                <div>
                                                    <h3 className="text-white font-bold text-lg mb-2">About this course</h3>
                                                    <p>{course.description}</p>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-dark-800">
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Level</p>
                                                        <p className="text-white capitalize">{course.level}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Language</p>
                                                        <p className="text-white">{course.language}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Lectures</p>
                                                        <p className="text-white">{course.totalLectures}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Duration</p>
                                                        <p className="text-white">{course.totalDuration}m</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'notes',
                                        label: 'Notes',
                                        children: (
                                            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 text-center">
                                                <FileText className="h-12 w-12 text-dark-600 mx-auto mb-4" />
                                                <p className="text-dark-400">Click the 'Create Note' button to start taking notes for this lecture.</p>
                                            </div>
                                        )
                                    },
                                    {
                                        key: 'announcements',
                                        label: 'Announcements',
                                        children: <p className="text-dark-400">No announcements from the instructor yet.</p>
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </Content>

                {/* Sidebar Curriculum */}
                <Sider
                    width={400}
                    className="bg-dark-900 border-l border-dark-800 overflow-y-auto hidden lg:block"
                    theme="dark"
                >
                    <div className="p-4 border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="text-white font-bold mb-0">Course Content</h3>
                    </div>

                    <Collapse
                        activeKey={expandedSections}
                        onChange={setExpandedSections}
                        ghost
                        expandIcon={({ isActive }) => isActive ? <ChevronUp className="text-dark-400" /> : <ChevronDown className="text-dark-400" />}
                        className="curriculum-collapse"
                    >
                        {content?.sections?.map((section, sIndex) => (
                            <Panel
                                header={
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm">Section {sIndex + 1}: {section.title}</span>
                                        <span className="text-dark-500 text-xs mt-1">
                                            {section.lectures?.filter(l => enrollment.completedLectures?.includes(l._id)).length} / {section.lectures?.length} | {section.lectures?.length} lectures
                                        </span>
                                    </div>
                                }
                                key={section._id}
                                className="border-b border-dark-800"
                            >
                                <div className="bg-dark-950">
                                    {section.lectures?.map((lecture, lIndex) => {
                                        const isCompleted = enrollment.completedLectures?.includes(lecture._id);
                                        const isActive = activeLecture?._id === lecture._id;

                                        return (
                                            <div
                                                key={lecture._id}
                                                onClick={() => handleLectureClick(lecture)}
                                                className={`p-4 cursor-pointer flex items-start gap-4 transition-colors ${isActive ? 'bg-primary-500/10' : 'hover:bg-dark-800'}`}
                                            >
                                                <div className="mt-1">
                                                    {isCompleted ? (
                                                        <CheckCircle className="h-4 w-4 text-primary-500" />
                                                    ) : (
                                                        <div className="h-4 w-4 border-2 border-dark-600 rounded-sm" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm mb-1 ${isActive ? 'text-primary-400 font-bold' : 'text-dark-200'}`}>
                                                        {lIndex + 1}. {lecture.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-dark-500 text-xs">
                                                        <Play className="h-3 w-3" />
                                                        <span>{Math.floor(lecture.videoDuration / 60)}:{String(lecture.videoDuration % 60).padStart(2, '0')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Panel>
                        ))}
                    </Collapse>
                </Sider>
            </Layout>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ant-layout { background: transparent !important; }
                .curriculum-collapse .ant-collapse-header { 
                    padding: 16px 20px !important; 
                    background: #1A1A1A !important;
                }
                .curriculum-collapse .ant-collapse-content-box {
                    padding: 0 !important;
                }
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom: 1px solid #333 !important;
                }
                .custom-tabs .ant-tabs-tab {
                    color: #999 !important;
                    font-weight: 700 !important;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: white !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: #FFA500 !important;
                    height: 3px !important;
                }
            ` }} />
        </Layout>
    );
};

export default LearningPage;
