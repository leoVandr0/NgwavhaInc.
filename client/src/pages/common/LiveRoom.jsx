import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Video, VideoOff, Mic, MicOff, LogOut, Shield, MonitorUp, MonitorX,
    MessageSquare, Users, Send, X
} from 'lucide-react';
import { App, Button, Typography, Spin, Layout, Divider, Tooltip, Input, Avatar, Badge } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import useMediasoupRoom from '../../hooks/useMediasoupRoom';

const { Header, Content } = Layout;
const { Text } = Typography;

// A single <video> tile that binds a MediaStream to the element.
//   kind:   'audio' | 'video' — drives the paused overlay (audio tiles show
//           a small "Muted" pill; video tiles show a full "Camera off" cover).
//   paused: true when the remote producer is paused (mic muted, cam off).
const VideoTile = ({ stream, label, muted, isScreen, role, kind = 'video', paused = false, micPaused = false, initial }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && stream) ref.current.srcObject = stream;
    }, [stream]);

    const showCameraOff = paused && kind === 'video';
    // Mic indicator shows whenever the peer's audio producer is paused —
    // independently of whether this tile itself is paused (it's a per-peer
    // signal, surfaced on the peer's video tile).
    const showMicMuted = micPaused || (paused && kind === 'audio');

    return (
        <div className={`relative bg-dark-900 rounded-xl overflow-hidden border border-dark-800 ${isScreen ? 'col-span-full row-span-2' : ''}`}>
            <video
                ref={ref}
                autoPlay
                playsInline
                muted={muted}
                className={`w-full h-full object-cover transition-opacity ${showCameraOff ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: '#0a0a0a' }}
            />

            {/* Camera off — full-tile placeholder with the participant's initial. */}
            {showCameraOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 gap-3">
                    <Avatar size={64} className="bg-dark-700 text-white text-2xl">
                        {initial || (label || '?')[0]}
                    </Avatar>
                    <div className="flex items-center gap-2 text-dark-400 text-xs">
                        <VideoOff className="h-4 w-4" />
                        <span>Camera off</span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg backdrop-blur">
                <Text className="text-white text-xs font-medium">{label}</Text>
                {role === 'instructor' && <Shield className="h-3 w-3 text-primary-500" />}
                {isScreen && <Text className="text-primary-400 text-[10px] uppercase">screen</Text>}
                {showMicMuted && (
                    <span className="flex items-center gap-1 text-red-400 text-[10px]">
                        <MicOff className="h-3 w-3" /> Muted
                    </span>
                )}
            </div>
        </div>
    );
};

// Hidden <audio> element for a remote peer. Each consumer.track is wrapped in
// its own MediaStream by the hook, so video tiles don't carry audio — the
// audio plays from here instead. Pause/resume is handled by the SFU stopping
// forwarding when the producer is paused, so no extra logic is needed here.
const AudioPlayer = ({ stream }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current && stream) ref.current.srcObject = stream;
    }, [stream]);
    return <audio ref={ref} autoPlay playsInline />;
};

const LiveRoom = ({ userRole = 'student' }) => {
    const { meetingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { modal } = App.useApp();
    const { currentUser: authUser } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const sessionTitle = queryParams.get('title') || 'Live Lesson';
    const sessionId = queryParams.get('sessionId');

    const [chatOpen, setChatOpen] = useState(false);
    const [peopleOpen, setPeopleOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const chatEndRef = useRef(null);

    const {
        status, error, peers, localStream, screenStream, remoteStreams, messages,
        micOn, camOn, isScreenSharing,
        toggleMic, toggleCam, startScreenShare, stopScreenShare, sendChat, endSession
    } = useMediasoupRoom({
        meetingId,
        displayName: authUser?.name,
        role: userRole,
        enabled: !!authUser
    });

    const isInstructor = userRole === 'instructor';

    // Auto-scroll chat to the newest message.
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatOpen]);

    // When the instructor ends the session, students get bounced out.
    useEffect(() => {
        if (status === 'ended') {
            navigate(isInstructor ? '/teacher/live' : '/student/live');
        }
    }, [status, isInstructor, navigate]);

    const handleLeave = () => {
        if (isInstructor) {
            modal.confirm({
                title: 'Leave or End Session?',
                content: 'If you end the session, all participants will be disconnected.',
                okText: 'End Session for All',
                okType: 'danger',
                cancelText: 'Just Leave',
                onOk: async () => {
                    try {
                        await endSession();
                        if (sessionId) {
                            await api.patch(`/live-sessions/${sessionId}/status`, { status: 'ended' });
                        }
                    } catch (e) {
                        console.error('Failed to end session', e);
                    }
                    navigate('/teacher/live');
                },
                onCancel: () => navigate('/teacher/live')
            });
        } else {
            navigate('/student/live');
        }
    };

    const handleSend = () => {
        sendChat(draft);
        setDraft('');
    };

    const isLoading = status === 'connecting';

    // Remote streams arrive as one entry per kind (audio + video per peer, plus
    // an optional screen). For rendering we want one tile per video/screen
    // stream, but we also need each peer's audio paused-state so the video
    // tile can show a mic-muted indicator. Audio is played back from a
    // dedicated hidden <audio> element below — never from the grid tiles.
    const audioByPeer = new Map();
    const videoTiles = [];
    for (const s of remoteStreams) {
        if (s.kind === 'audio') {
            audioByPeer.set(s.socketId, s);
        } else {
            videoTiles.push(s);
        }
    }

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
                            <Text className="text-emerald-500 text-xs font-mono">
                                {status === 'connected' ? '• Live' : '• Connecting'}
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip title="Participants">
                        <Badge count={peers.length + 1} size="small" color="#FFA500">
                            <Button
                                ghost
                                icon={<Users className="h-4 w-4" />}
                                onClick={() => { setPeopleOpen((v) => !v); setChatOpen(false); }}
                            />
                        </Badge>
                    </Tooltip>
                    <Tooltip title="Chat">
                        <Button
                            ghost
                            icon={<MessageSquare className="h-4 w-4" />}
                            onClick={() => { setChatOpen((v) => !v); setPeopleOpen(false); }}
                        />
                    </Tooltip>
                    <Tooltip title="Leave session">
                        <Button danger ghost icon={<LogOut className="h-4 w-4" />} onClick={handleLeave}>
                            Leave
                        </Button>
                    </Tooltip>
                </div>
            </Header>

            <Content className="relative flex-1 bg-dark-950 flex">
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
                            <Button type="primary" onClick={() => window.location.reload()} size="large">
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Video grid */}
                <div className="flex-1 p-4 overflow-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,1fr)] gap-4 h-full">
                        {/* Local screen share (shown large) */}
                        {screenStream && (
                            <VideoTile stream={screenStream} label="You (screen)" muted isScreen />
                        )}
                        {/* Local camera */}
                        {localStream && (
                            <VideoTile
                                stream={localStream}
                                label={`${authUser?.name || 'You'} (you)`}
                                muted
                                role={userRole}
                                kind="video"
                                paused={!camOn}
                                micPaused={!micOn}
                                initial={(authUser?.name || 'Y')[0]}
                            />
                        )}
                        {/* Remote video / screen tiles (audio is played from
                            the hidden block below so muted peers don't lose
                            sound just because we hide audio tiles). */}
                        {videoTiles.map((s) => (
                            <VideoTile
                                key={s.producerId}
                                stream={s.stream}
                                label={s.name}
                                role={s.role}
                                isScreen={s.screen}
                                muted={false}
                                kind={s.kind}
                                paused={s.paused}
                                micPaused={!!audioByPeer.get(s.socketId)?.paused}
                                initial={(s.name || '?')[0]}
                            />
                        ))}
                    </div>

                    {/* Remote audio playback — one hidden <audio> per peer.
                        Kept out of the grid so the video tile owns the mute UI. */}
                    <div className="hidden" aria-hidden>
                        {[...audioByPeer.values()].map((s) => (
                            <AudioPlayer key={s.producerId} stream={s.stream} />
                        ))}
                    </div>
                </div>

                {/* Participants panel */}
                {peopleOpen && (
                    <div className="w-72 bg-dark-900 border-l border-dark-800 flex flex-col shrink-0">
                        <div className="flex items-center justify-between p-4 border-b border-dark-800">
                            <Text className="text-white font-semibold">In this room</Text>
                            <Button type="text" size="small" icon={<X className="h-4 w-4 text-dark-400" />} onClick={() => setPeopleOpen(false)} />
                        </div>
                        <div className="flex-1 overflow-auto p-2 space-y-1">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800">
                                <Avatar size="small" className="bg-primary-500">{(authUser?.name || 'Y')[0]}</Avatar>
                                <Text className="text-white text-sm">{authUser?.name || 'You'} (you)</Text>
                            </div>
                            {peers.map((p) => (
                                <div key={p.socketId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800">
                                    <Avatar size="small" className="bg-dark-700">{(p.name || '?')[0]}</Avatar>
                                    <Text className="text-dark-200 text-sm">{p.name}</Text>
                                    {p.role === 'instructor' && <Shield className="h-3 w-3 text-primary-500" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat panel */}
                {chatOpen && (
                    <div className="w-80 bg-dark-900 border-l border-dark-800 flex flex-col shrink-0">
                        <div className="flex items-center justify-between p-4 border-b border-dark-800">
                            <Text className="text-white font-semibold">Chat</Text>
                            <Button type="text" size="small" icon={<X className="h-4 w-4 text-dark-400" />} onClick={() => setChatOpen(false)} />
                        </div>
                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {messages.length === 0 && (
                                <Text className="text-dark-500 text-sm">No messages yet. Say hello 👋</Text>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.self ? 'items-end' : 'items-start'}`}>
                                    <Text className="text-dark-500 text-[10px] mb-0.5">
                                        {m.self ? 'You' : m.name}{m.role === 'instructor' ? ' • Instructor' : ''}
                                    </Text>
                                    <div className={`px-3 py-2 rounded-xl max-w-[85%] text-sm ${m.self ? 'bg-primary-500 text-black' : 'bg-dark-800 text-white'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 border-t border-dark-800 flex gap-2">
                            <Input
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onPressEnter={handleSend}
                                placeholder="Type a message..."
                                className="bg-dark-800 border-dark-700 text-white"
                            />
                            <Button type="primary" icon={<Send className="h-4 w-4" />} onClick={handleSend} />
                        </div>
                    </div>
                )}
            </Content>

            {/* Control bar */}
            {status === 'connected' && (
                <div className="bg-dark-900 border-t border-dark-800 px-6 py-3 flex items-center justify-center gap-3 shrink-0">
                    <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
                        <Button
                            shape="circle"
                            size="large"
                            danger={!micOn}
                            icon={micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            onClick={toggleMic}
                        />
                    </Tooltip>
                    <Tooltip title={camOn ? 'Turn off camera' : 'Turn on camera'}>
                        <Button
                            shape="circle"
                            size="large"
                            danger={!camOn}
                            icon={camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            onClick={toggleCam}
                        />
                    </Tooltip>
                    <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                        <Button
                            shape="circle"
                            size="large"
                            type={isScreenSharing ? 'primary' : 'default'}
                            icon={isScreenSharing ? <MonitorX className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
                            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                        />
                    </Tooltip>
                    <Button danger type="primary" size="large" icon={<LogOut className="h-4 w-4" />} onClick={handleLeave} className="ml-4">
                        {isInstructor ? 'End / Leave' : 'Leave'}
                    </Button>
                </div>
            )}

            <style>{`
                .ant-layout-header { line-height: normal !important; }
            `}</style>
        </Layout>
    );
};

export default LiveRoom;
