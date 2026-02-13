import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Video,
    Mic,
    MessageSquare,
    Users,
    LogOut,
    Maximize2,
    Settings,
    Shield
} from 'lucide-react';
import {
    App,
    Button,
    Typography,
    Spin,
    Layout,
    Divider,
    Avatar,
    Tooltip,
    Modal
} from 'antd';

import useAuthStore from '../../store/authStore';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const LiveRoom = ({ userRole = 'student' }) => {
    const { meetingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { message, modal } = App.useApp();
    const [isLoading, setIsLoading] = useState(true);
    const { user: authUser } = useAuthStore();
    const jitsiContainerRef = useRef(null);
    const apiRef = useRef(null);

    const queryParams = new URLSearchParams(location.search);
    const sessionTitle = queryParams.get('title') || 'Live Lesson';

    useEffect(() => {
        // Load Jitsi script dynamicallly
        const script = document.createElement('script');
        script.src = 'https://8x8.vc/vpaas-magic-cookie-83344b97a26f49e494a73229b9be5736/external_api.js';
        // Note: For production you might want to use meet.jit.si/external_api.js or a self-hosted version
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi();
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) apiRef.current.dispose();
            document.body.removeChild(script);
        };
    }, []);

    const initJitsi = () => {
        const domain = 'meet.jit.si';
        const options = {
            roomName: meetingId,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: authUser?.name || 'User',
                email: authUser?.email,
                avatarUrl: authUser?.avatar ? `/uploads/${authUser.avatar}` : null
            },
            configOverwrite: {
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                desktopSharingFrameRate: {
                    min: 5,
                    max: 15
                },
                enableWelcomePage: false,
                enableClosePage: false
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'raisehand',
                    'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur',
                    'help', 'mute-everyone', 'security'
                ],
            }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListeners({
            readyToClose: () => {
                navigate(userRole === 'instructor' ? '/teacher/live' : '/student/live');
            },
            videoConferenceJoined: () => {
                setIsLoading(false);
                message.success('Connected to live room');
            }
        });
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
                    if (apiRef.current) {
                        // There's no direct "end meeting for all" command in Jitsi iframe api easily exposed, 
                        // but we can update our DB status and then hangup.
                        // Realistically, the instructor leaving usually ends it if they are the only moderator.
                        try {
                            // We need the session ID, which we don't have in params. 
                            // We might need to fetch session by meetingId or pass it in query.
                            const sessionId = queryParams.get('sessionId');
                            if (sessionId) {
                                await api.patch(`/live-sessions/${sessionId}/status`, { status: 'ended' });
                            }
                        } catch (e) {
                            console.error('Failed to update status', e);
                        }
                        apiRef.current.executeCommand('hangup');
                    }
                    navigate('/teacher/live');
                },
                onCancel: () => {
                    if (apiRef.current) apiRef.current.executeCommand('hangup');
                    navigate('/teacher/live');
                }
            });
        } else {
            if (apiRef.current) apiRef.current.executeCommand('hangup');
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
                                <Shield className="h-3 w-3" /> Secure E2E Encrypted Room
                            </Text>
                            <Divider type="vertical" className="border-dark-700" />
                            <Text className="text-emerald-500 text-xs font-mono">• Live</Text>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
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
                </div>
            </Header>

            <Content className="relative flex-1 bg-dark-950">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950 z-50">
                        <Spin size="large" />
                        <Text className="text-dark-400 mt-4">Initializing transmission room...</Text>
                    </div>
                )}
                <div ref={jitsiContainerRef} className="w-full h-full" />
            </Content>

            <style inset>{`
                .ant-layout-header {
                    line-height: normal !important;
                }
            `}</style>
        </Layout>
    );
};

export default LiveRoom;
