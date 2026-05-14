import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Video, LogOut, Shield, RefreshCw } from 'lucide-react';
import { App, Button, Typography, Spin, Layout, Divider, Tooltip } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const { Header, Content } = Layout;
const { Text } = Typography;

const LOAD_TIMEOUT_MS = 15000;

const LiveRoom = ({ userRole = 'student' }) => {
    const { meetingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { modal } = App.useApp();
    const { currentUser: authUser } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const timeoutRef = useRef(null);

    const queryParams = new URLSearchParams(location.search);
    const sessionTitle = queryParams.get('title') || 'Live Lesson';

    const dailyDomain = import.meta.env.VITE_DAILY_DOMAIN || 'ngwavha';
    const roomUrl = `https://${dailyDomain}.daily.co/${meetingId}`;

    useEffect(() => {
        // Safety timeout — if iframe hasn't loaded in 15s, show an error instead of hanging
        timeoutRef.current = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                setError('The live room is taking too long to load. Please check your internet connection and try again.');
            }
        }, LOAD_TIMEOUT_MS);

        return () => clearTimeout(timeoutRef.current);
    }, []);

    const handleIframeLoad = () => {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        setError(null);
    };

    const handleIframeError = () => {
        clearTimeout(timeoutRef.current);
        setIsLoading(false);
        setError('Failed to load the live room. Please check your connection and try again.');
    };

    const handleRetry = () => {
        setIsLoading(true);
        setError(null);
        // Re-trigger timeout
        timeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setError('Still unable to connect. Please try again later.');
        }, LOAD_TIMEOUT_MS);
    };

    const handleLeave = () => {
        if (userRole === 'instructor') {
            modal.confirm({
                title: 'Leave or End Session?',
                content: 'If you end the session, all participants will be disconnected.',
                okText: 'End Session for All',
                okType: 'danger',
                cancelText: 'Just Leave',
                onOk: async () => {
                    try {
                        const sessionId = queryParams.get('sessionId');
                        if (sessionId) {
                            await api.patch(`/live-sessions/${sessionId}/status`, { status: 'ended' });
                        }
                    } catch (e) {
                        console.error('Failed to update session status', e);
                    }
                    navigate('/teacher/live');
                },
                onCancel: () => navigate('/teacher/live')
            });
        } else {
            navigate('/student/live');
        }
    };

    return (
        <Layout className="h-screen bg-black overflow-hidden flex flex-col">
            <Header className="bg-dark-900 border-b border-dark-800 px-6 flex justify-between items-center h-16 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary-500/10 rounded-lg flex items-center justify-center border border-primary-500/20">
                        <Video className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg m-0 leading-none">{sessionTitle}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Text className="text-dark-500 text-xs flex items-center gap-1">
                                <Shield className="h-3 w-3" /> Secure Encrypted Room
                            </Text>
                            <Divider type="vertical" className="border-dark-700" />
                            <Text className="text-emerald-500 text-xs font-mono">• Live</Text>
                        </div>
                    </div>
                </div>

                <Tooltip title="Leave session">
                    <Button
                        danger
                        ghost
                        icon={<LogOut className="h-4 w-4" />}
                        onClick={handleLeave}
                    >
                        Leave
                    </Button>
                </Tooltip>
            </Header>

            <Content className="relative flex-1 bg-dark-950">
                {/* Loading overlay */}
                {isLoading && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950 z-50">
                        <Spin size="large" />
                        <Text className="text-dark-400 mt-4">Connecting to live room...</Text>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950 z-50 gap-4">
                        <div className="text-center max-w-md px-6">
                            <div className="text-red-400 text-5xl mb-4">⚠️</div>
                            <Text className="text-white text-lg font-semibold block mb-2">Connection Failed</Text>
                            <Text className="text-dark-400 block mb-6">{error}</Text>
                            <Button
                                type="primary"
                                icon={<RefreshCw className="h-4 w-4" />}
                                onClick={handleRetry}
                                size="large"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Daily.co iframe */}
                {!error && (
                    <iframe
                        key={isLoading ? 'loading' : 'loaded'}
                        src={roomUrl}
                        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                        style={{ width: '100%', height: '100%', border: 0, display: isLoading ? 'none' : 'block' }}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        title={sessionTitle}
                    />
                )}
            </Content>

            <style>{`
                .ant-layout-header { line-height: normal !important; }
            `}</style>
        </Layout>
    );
};

export default LiveRoom;
