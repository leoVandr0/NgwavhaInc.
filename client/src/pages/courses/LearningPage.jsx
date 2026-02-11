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
    Download,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Layout, Menu, Collapse, Progress, Tabs, Button, message } from 'antd';
import api from '../../services/api';
import Footer from '../../components/layout/Footer';

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
            return await api.put(`/enrollments/${learningData?.course?.id}/progress`, { lectureId });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['learning-content', slug]);
            }
        }
    );

    // Extract course data safely
    const course = learningData?.course;
    const content = learningData?.content;
    const enrollment = learningData?.enrollment;

    const handleLectureClick = (lecture) => {
        setActiveLecture(lecture);
        if (!enrollment?.completedLectures?.includes(lecture._id)) {
            updateProgressMutation.mutate(lecture._id);
        }
    };

    const handleNextLecture = () => {
        if (!content?.sections) return;

        let foundCurrent = false;
        for (const section of content.sections) {
            for (const lecture of section.lectures) {
                if (foundCurrent) {
                    handleLectureClick(lecture);
                    return;
                }
                if (lecture._id === activeLecture?._id) {
                    foundCurrent = true;
                }
            }
        }
    };

    const handlePreviousLecture = () => {
        if (!content?.sections) return;

        let previousLecture = null;
        for (const section of content.sections) {
            for (const lecture of section.lectures) {
                if (lecture._id === activeLecture?._id && previousLecture) {
                    handleLectureClick(previousLecture);
                    return;
                }
                previousLecture = lecture;
            }
        }
    };

    // Add keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.target.tagName === 'VIDEO') return; // Don't interfere with video controls

            switch (e.key) {
                case 'ArrowRight':
                    handleNextLecture();
                    break;
                case 'ArrowLeft':
                    handlePreviousLecture();
                    break;
                case ' ':
                    e.preventDefault();
                    const video = document.querySelector('video');
                    if (video) {
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [activeLecture, content]);

    if (isLoading) return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (error) return null;

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
                        <h1 className="text-white text-base font-bold truncate max-w-md">{course?.title || 'Loading...'}</h1>
                        <div className="flex items-center gap-2">
                            <Progress
                                percent={Math.round(enrollment?.progress || 0)}
                                size="small"
                                strokeColor="#FFA500"
                                showInfo={false}
                                className="w-24 mb-0"
                            />
                            <span className="text-xs text-dark-400">{Math.round(enrollment?.progress || 0)}% Complete</span>
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
                            {activeLecture?.type === 'live' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 border border-dark-800 shadow-2xl">
                                    <div className="h-24 w-24 bg-orange-500/10 rounded-full flex items-center justify-center animate-pulse mb-6 border border-orange-500/20">
                                        <Monitor className="h-10 w-10 text-orange-500" />
                                    </div>
                                    <div className="text-center px-6">
                                        <h2 className="text-2xl font-bold text-white mb-2 font-display uppercase tracking-widest">Live Class Session</h2>
                                        <p className="text-dark-400 max-w-md mx-auto mb-8 leading-relaxed">
                                            This is a scheduled live interactive session where you can participate in real-time discussion and learning with your instructor.
                                        </p>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<Video className="h-5 w-5" />}
                                            className="h-14 px-10 bg-orange-600 hover:bg-orange-700 border-none rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20"
                                            onClick={() => navigate(`/student/live`)}
                                        >
                                            Join Live Session
                                        </Button>
                                    </div>
                                </div>
                            ) : activeLecture?.videoUrl ? (
                                <div className="relative w-full h-full">
                                    {/* Loading State */}
                                    <div className="absolute inset-0 bg-dark-900 flex items-center justify-center z-10" id="video-loading">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                                            <p className="text-dark-400">Loading video...</p>
                                        </div>
                                    </div>

                                    {/* Video Element */}
                                    <video
                                        src={`http://localhost:5001${activeLecture.videoUrl}`}
                                        controls
                                        className="w-full h-full"
                                        controlsList="nodownload noremoteplayback"
                                        preload="metadata"
                                        key={activeLecture._id}
                                        onLoadedData={() => {
                                            const loadingEl = document.getElementById('video-loading');
                                            if (loadingEl) loadingEl.style.display = 'none';
                                        }}
                                        onError={(e) => {
                                            console.error('Video error:', e);
                                            const loadingEl = document.getElementById('video-loading');
                                            if (loadingEl) {
                                                loadingEl.innerHTML = `
                                                    <div class="flex flex-col items-center gap-4">
                                                        <div class="text-red-500">
                                                            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                            </svg>
                                                        </div>
                                                        <p class="text-red-400">Failed to load video</p>
                                                        <p class="text-dark-500 text-sm">Please check your connection and try again</p>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    >
                                        <source src={`http://localhost:5001${activeLecture.videoUrl}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>

                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium">{activeLecture.title}</p>
                                        <p className="text-dark-300 text-xs">
                                            {activeLecture.videoDuration ?
                                                `${Math.floor(activeLecture.videoDuration / 60)}:${String(activeLecture.videoDuration % 60).padStart(2, '0')}` :
                                                'Unknown duration'
                                            }
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-dark-500 space-y-4">
                                    <div className="relative">
                                        <Monitor className="h-20 w-20 opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="h-8 w-8 opacity-40" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl mb-2">No content available</p>
                                        <p className="text-sm text-dark-600">
                                            {activeLecture ?
                                                'This lecture doesn\'t have any playable content' :
                                                'Select a lecture from the curriculum to start learning'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Lecture Navigation */}
                        {activeLecture && (
                            <div className="bg-dark-900 border-t border-dark-800 px-8 py-4">
                                <div className="flex items-center justify-between">
                                    <Button
                                        onClick={handlePreviousLecture}
                                        disabled={!content?.sections?.[0]?.lectures?.[0]}
                                        className="flex items-center gap-2 bg-dark-800 border-dark-700 text-white hover:bg-dark-700 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-white font-medium">{activeLecture.title}</p>
                                        <p className="text-dark-400 text-sm">
                                            {activeLecture.videoDuration ?
                                                `${Math.floor(activeLecture.videoDuration / 60)}:${String(activeLecture.videoDuration % 60).padStart(2, '0')}` :
                                                'Unknown duration'
                                            }
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleNextLecture}
                                        className="flex items-center gap-2 bg-primary-500 border-primary-500 text-dark-950 hover:bg-primary-600"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

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
                                                    <p>{course?.description || 'No description available'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-dark-800">
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Level</p>
                                                        <p className="text-white capitalize">{course?.level || 'All'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Language</p>
                                                        <p className="text-white">{course?.language || 'English'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Lectures</p>
                                                        <p className="text-white">{course?.totalLectures || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Duration</p>
                                                        <p className="text-white">{course?.totalDuration || 0}m</p>
                                                    </div>
                                                </div>

                                                {/* Keyboard Shortcuts */}
                                                <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                                                    <h4 className="text-white font-bold text-lg mb-4">Keyboard Shortcuts</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-dark-800 px-3 py-1 rounded border border-dark-700">
                                                                <span className="text-white text-sm font-mono">Space</span>
                                                            </div>
                                                            <span className="text-dark-400 text-sm">Play/Pause video</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-dark-800 px-3 py-1 rounded border border-dark-700">
                                                                <span className="text-white text-sm font-mono">←</span>
                                                            </div>
                                                            <span className="text-dark-400 text-sm">Previous lecture</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-dark-800 px-3 py-1 rounded border border-dark-700">
                                                                <span className="text-white text-sm font-mono">→</span>
                                                            </div>
                                                            <span className="text-dark-400 text-sm">Next lecture</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-dark-800 px-3 py-1 rounded border border-dark-700">
                                                                <span className="text-white text-sm font-mono">Click</span>
                                                            </div>
                                                            <span className="text-dark-400 text-sm">Select lecture from sidebar</span>
                                                        </div>
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
                        <Footer />
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
                                            {section.lectures?.filter(l => enrollment?.completedLectures?.includes(l._id)).length || 0} / {section.lectures?.length || 0} | {section.lectures?.length || 0} lectures
                                        </span>
                                    </div>
                                }
                                key={section._id}
                                className="border-b border-dark-800"
                            >
                                <div className="bg-dark-950">
                                    {section.lectures?.map((lecture, lIndex) => {
                                        const isCompleted = enrollment?.completedLectures?.includes(lecture._id);
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
                                                        {lecture.type === 'live' ? <Monitor className="h-3 w-3 text-orange-500" /> : <Play className="h-3 w-3" />}
                                                        <span>
                                                            {lecture.type === 'live' ? 'Live Session' : lecture.videoDuration ? `${Math.floor(lecture.videoDuration / 60)}:${String(lecture.videoDuration % 60).padStart(2, '0')}` : 'Video'}
                                                        </span>
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
