import { useQuery } from 'react-query';
import {
    Video,
    Calendar,
    Clock,
    Play,
    ChevronRight,
    Users,
    Info
} from 'lucide-react';
import {
    App,
    Button,
    Card,
    Typography,
    Tag,
    Empty,
    Spin,
    Avatar,
    Space,
    Tooltip
} from 'antd';
import dayjs from 'dayjs';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const StudentLiveSessions = () => {
    const navigate = useNavigate();

    const { data: sessions, isLoading } = useQuery('student-sessions', async () => {
        const { data } = await api.get('/live-sessions/student');
        return data;
    });

    const handleJoinSession = (session) => {
        navigate(`/student/live-room/${session.meetingId}?title=${encodeURIComponent(session.title)}`);
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-white min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
                        <Video className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: 'white' }}>Live Classes</Title>
                        <Text className="text-dark-400">Join real-time sessions from your enrolled courses.</Text>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Spin size="large" tip="Finding upcoming classes..." />
                </div>
            ) : sessions?.length === 0 ? (
                <Card className="bg-dark-900 border-dark-800 rounded-2xl text-center py-20 border-dashed border-2">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="space-y-4">
                                <Text className="text-dark-400 text-lg block">No live classes scheduled for your courses.</Text>
                                <Text className="text-dark-500 text-sm block">Check back later or enroll in more courses to see live sessions.</Text>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                        <Card
                            key={session.id}
                            className={`bg-dark-900 border-dark-800 rounded-2xl overflow-hidden hover:border-dark-700 transition-all ${session.status === 'live' ? 'ring-2 ring-primary-500/30' : ''}`}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Tag color={session.status === 'live' ? 'orange' : 'blue'}>
                                    {session.status === 'live' ? 'LIVE NOW' : 'COMING UP'}
                                </Tag>
                                <Tooltip title={`Duration: ${session.duration} mins`}>
                                    <div className="flex items-center gap-1 text-dark-400 text-xs">
                                        <Clock className="h-3 w-3" />
                                        {session.duration} min
                                    </div>
                                </Tooltip>
                            </div>

                            <Title level={4} style={{ color: 'white', marginBottom: '8px' }} className="line-clamp-2">
                                {session.title}
                            </Title>
                            <Text className="text-dark-400 text-sm block mb-6">{session.course?.title}</Text>

                            <div className="flex items-center gap-3 mb-8 bg-black/30 p-3 rounded-xl border border-dark-800">
                                <Avatar src={session.instructor?.avatar} icon={<Users />} className="bg-dark-700" />
                                <div className="flex flex-col">
                                    <Text className="text-white font-medium text-sm">{session.instructor?.name}</Text>
                                    <Text className="text-dark-500 text-[10px] uppercase tracking-wider">Instructor</Text>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-dark-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-primary-500" />
                                        {dayjs(session.startTime).format('ddd, MMM D')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-primary-500" />
                                        {dayjs(session.startTime).format('h:mm A')}
                                    </div>
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    icon={<Play className="h-4 w-4" />}
                                    disabled={session.status !== 'live'}
                                    onClick={() => handleJoinSession(session)}
                                    className={session.status === 'live' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                >
                                    {session.status === 'live' ? 'Join Live Class' : 'Wait for Start'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-12 bg-primary-500/5 border border-primary-500/10 p-6 rounded-2xl flex items-start gap-4">
                <div className="h-10 w-10 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">How Live Classes work</h4>
                    <p className="text-dark-400 text-sm leading-relaxed">
                        Live classes allow you to interact directly with your instructors. Once the session goes live,
                        the 'Join' button will activate. We recommend joining 2 minutes early to test your audio settings.
                    </p>
                </div>
            </div>

            <style inset>{`
                .ant-tag {
                    border-radius: 6px !important;
                    font-weight: 700 !important;
                    font-size: 10px !important;
                    padding: 2px 8px !important;
                }
                .ant-card {
                    background: #111 !important;
                }
            `}</style>
        </div>
    );
};

export default StudentLiveSessions;
