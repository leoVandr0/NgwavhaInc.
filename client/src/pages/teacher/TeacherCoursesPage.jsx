import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Plus,
    Video,
    FileText,
    Trash2,
    Upload,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    Play,
    Settings,
    Layout as LayoutIcon,
    Pause,
    RefreshCw
} from 'lucide-react';
import {
    App,
    Button,
    Input,
    Collapse,
    Progress,
    Typography,
    Card,
    Select,
    Divider,
    Empty,
    Spin,
    Space,
    Tag,
    Modal,
    Tooltip
} from 'antd';
import api from '../../services/api';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const TeacherCoursesPage = () => {
    const { message, modal } = App.useApp();
    const [courses, setCourses] = useState([]);
    const [courseContent, setCourseContent] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedLectureId, setSelectedLectureId] = useState('');

    // UI States
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [isAddingLecture, setIsAddingLecture] = useState({ active: false, sectionId: '' });
    const [newLectureTitle, setNewLectureTitle] = useState('');

    // Upload States
    const [uploadQueue, setUploadQueue] = useState([]);
    const [activeUploadId, setActiveUploadId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [pausedUploadId, setPausedUploadId] = useState(null);

    const chunkSizeRef = useRef(5 * 1024 * 1024); // 5MB chunks
    const uploadControllerRef = useRef(null);
    const uploadStartRef = useRef(null);

    // Initial Fetch: Courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoadingCourses(true);
                const { data } = await api.get('/courses/my');
                setCourses(data || []);
            } catch (error) {
                message.error('Unable to load your courses.');
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [message]);

    // Fetch Course Content when a course is selected
    const fetchCourseContent = async (courseId) => {
        if (!courseId) {
            setCourseContent(null);
            return;
        }

        try {
            setIsLoadingContent(true);
            const { data } = await api.get(`/courses/${courseId}/content`);
            setCourseContent(data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Unable to load course content.');
            setCourseContent(null);
        } finally {
            setIsLoadingContent(false);
        }
    };

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseContent(selectedCourseId);
        } else {
            setCourseContent(null);
        }
    }, [selectedCourseId]);

    // Course Builder Actions
    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        try {
            await api.post(`/courses/${selectedCourseId}/sections`, { title: newSectionTitle });
            message.success('Section added!');
            setNewSectionTitle('');
            setIsAddingSection(false);
            fetchCourseContent(selectedCourseId);
        } catch (error) {
            message.error('Failed to add section.');
        }
    };

    const handleAddLecture = async (sectionId) => {
        if (!newLectureTitle.trim()) return;
        try {
            await api.post(`/courses/${selectedCourseId}/sections/${sectionId}/lectures`, {
                title: newLectureTitle,
                type: 'video'
            });
            message.success('Lecture added!');
            setNewLectureTitle('');
            setIsAddingLecture({ active: false, sectionId: '' });
            fetchCourseContent(selectedCourseId);
        } catch (error) {
            message.error('Failed to add lecture.');
        }
    };

    const handleDeleteSection = (sectionId) => {
        modal.confirm({
            title: 'Delete Section?',
            content: 'This will permanently remove the section and all its lectures.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/courses/${selectedCourseId}/sections/${sectionId}`);
                    message.success('Section deleted');
                    fetchCourseContent(selectedCourseId);
                } catch (error) {
                    message.error('Failed to delete section.');
                }
            }
        });
    };

    const handleDeleteLecture = (sectionId, lectureId) => {
        modal.confirm({
            title: 'Delete Lecture?',
            content: 'Are you sure you want to delete this lecture?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/courses/${selectedCourseId}/sections/${sectionId}/lectures/${lectureId}`);
                    message.success('Lecture deleted');
                    fetchCourseContent(selectedCourseId);
                } catch (error) {
                    message.error('Failed to delete lecture.');
                }
            }
        });
    };

    const [previewVideo, setPreviewVideo] = useState({ active: false, url: '', title: '' });

    // Upload Logic
    const handleFileSelection = (event, sectionId, lectureId, lectureTitle, sectionTitle) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newItems = files.map((file) => ({
            id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
            file,
            courseId: selectedCourseId,
            sectionId,
            lectureId,
            lectureTitle,
            sectionTitle,
            uploadId: null,
            totalChunks: Math.ceil(file.size / chunkSizeRef.current),
            uploadedChunks: 0,
            uploadedBytes: 0,
            status: 'queued',
            progress: 0,
            speed: 0,
            eta: null,
            errorMessage: ''
        }));

        setUploadQueue((prev) => [...prev, ...newItems]);
        event.target.value = '';
        message.info(`Added ${files.length} video(s) to upload queue.`);
    };

    const uploadItem = async (item) => {
        uploadControllerRef.current = new AbortController();
        uploadStartRef.current = Date.now();

        setActiveUploadId(item.id);
        setUploadQueue((prev) =>
            prev.map((qi) => qi.id === item.id ? { ...qi, status: 'uploading', errorMessage: '' } : qi)
        );

        try {
            let uploadId = item.uploadId;

            if (!uploadId) {
                const { data } = await api.post(
                    `/courses/${item.courseId}/sections/${item.sectionId}/lectures/${item.lectureId}/video/chunked/init`,
                    { fileName: item.file.name, totalChunks: item.totalChunks }
                );
                uploadId = data.uploadId;
                setUploadQueue((prev) =>
                    prev.map((qi) => qi.id === item.id ? { ...qi, uploadId } : qi)
                );
            }

            const startChunk = item.uploadedChunks || 0;
            const totalChunks = item.totalChunks;
            const fileSize = item.file.size;

            for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex += 1) {
                const start = chunkIndex * chunkSizeRef.current;
                const end = Math.min(start + chunkSizeRef.current, fileSize);
                const chunk = item.file.slice(start, end);

                const formData = new FormData();
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', chunkIndex);
                formData.append('chunk', chunk);

                await api.post(
                    `/courses/${item.courseId}/sections/${item.sectionId}/lectures/${item.lectureId}/video/chunked`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        signal: uploadControllerRef.current.signal
                    }
                );

                const uploadedChunks = chunkIndex + 1;
                const uploadedBytes = Math.min(uploadedChunks * chunkSizeRef.current, fileSize);
                const percent = Math.round((uploadedBytes / fileSize) * 100);
                const elapsedMs = Date.now() - (uploadStartRef.current || Date.now());
                const elapsedSeconds = Math.max(elapsedMs / 1000, 1);
                const speed = uploadedBytes / elapsedSeconds;
                const remainingBytes = Math.max(fileSize - uploadedBytes, 0);
                const eta = speed > 0 ? Math.round(remainingBytes / speed) : null;

                setUploadQueue((prev) =>
                    prev.map((qi) => qi.id === item.id ? {
                        ...qi,
                        uploadedChunks,
                        uploadedBytes,
                        progress: percent,
                        speed,
                        eta
                    } : qi)
                );
            }

            await api.post(
                `/courses/${item.courseId}/sections/${item.sectionId}/lectures/${item.lectureId}/video/chunked/complete`,
                { uploadId, totalChunks: item.totalChunks, fileName: item.file.name }
            );

            setUploadQueue((prev) =>
                prev.map((qi) => qi.id === item.id ? { ...qi, status: 'completed', progress: 100, eta: 0 } : qi)
            );
            message.success(`Uploaded ${item.file.name}`);
            fetchCourseContent(item.courseId);
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                setUploadQueue((prev) =>
                    prev.map((qi) => qi.id === item.id ? { ...qi, status: 'paused', errorMessage: 'Paused' } : qi)
                );
                setPausedUploadId(item.id);
                return;
            }

            const errMsg = error.response?.data?.message || 'Upload failed.';
            setUploadQueue((prev) =>
                prev.map((qi) => qi.id === item.id ? { ...qi, status: 'error', errorMessage: errMsg } : qi)
            );
            message.error(`Upload failed: ${item.file.name}`);
        } finally {
            setActiveUploadId(null);
        }
    };

    useEffect(() => {
        if (isPaused || activeUploadId) return;
        const nextItem = uploadQueue.find((qi) => qi.status === 'queued');
        if (nextItem) uploadItem(nextItem);
    }, [activeUploadId, isPaused, uploadQueue]);

    const handlePauseUpload = () => {
        if (uploadControllerRef.current) {
            setIsPaused(true);
            uploadControllerRef.current.abort();
        }
    };

    const handleResumeUpload = () => {
        if (!pausedUploadId) {
            setIsPaused(false);
            return;
        }

        setUploadQueue((prev) =>
            prev.map((qi) => qi.id === pausedUploadId ? { ...qi, status: 'queued' } : qi)
        );
        setPausedUploadId(null);
        setIsPaused(false);
    };

    const formatBytes = (bytes) => {
        if (!bytes || Number.isNaN(bytes)) return '0 B/s';
        const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
        let value = bytes;
        let ui = 0;
        while (value >= 1024 && ui < units.length - 1) {
            value /= 1024;
            ui += 1;
        }
        return `${value.toFixed(1)} ${units[ui]}`;
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-dark-950 min-h-screen text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
                        <LayoutIcon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: 'white' }}>Course Content Studio</Title>
                        <Text className="text-dark-400">Design your curriculum and upload high-quality tutorials.</Text>
                    </div>
                </div>

                <div className="w-full md:w-auto min-w-[300px]">
                    <Select
                        size="large"
                        placeholder="Select a course to manage"
                        style={{ width: '100%' }}
                        value={selectedCourseId}
                        onChange={setSelectedCourseId}
                        suffixIcon={<ChevronDown className="h-4 w-4 text-dark-400" />}
                        className="custom-select"
                        loading={isLoadingCourses}
                    >
                        {courses.map(course => (
                            <Select.Option key={course.id} value={course.id}>
                                {course.title}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Course Builder Section */}
                <div className="lg:col-span-8">
                    {!selectedCourseId ? (
                        <Card className="bg-dark-900 border-dark-800 rounded-2xl text-center py-20 border-dashed border-2">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div className="space-y-4">
                                        <Text className="text-dark-400 text-lg block">Select a course from the dropdown above to start building.</Text>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<Plus className="h-4 w-4" />}
                                            onClick={() => window.location.href = '/teacher/create-course'}
                                        >
                                            Create New Course
                                        </Button>
                                    </div>
                                }
                            />
                        </Card>
                    ) : isLoadingContent ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" tip="Loading curriculum..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-dark-900/50 p-6 rounded-2xl border border-dark-800">
                                <div>
                                    <Title level={4} style={{ color: 'white', margin: 0 }}>Curriculum</Title>
                                    <Text className="text-dark-400 text-sm">{courseContent?.sections?.length || 0} Sections • {courseContent?.totalLectures || 0} Lectures</Text>
                                </div>
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<Plus className="h-4 w-4" />}
                                    onClick={() => setIsAddingSection(true)}
                                >
                                    Add Section
                                </Button>
                            </div>

                            {isAddingSection && (
                                <Card className="bg-dark-800 border-primary-500/50 shadow-lg shadow-primary-500/5">
                                    <div className="space-y-4">
                                        <Input
                                            size="large"
                                            placeholder="Enter section title (e.g., Introduction to React)"
                                            value={newSectionTitle}
                                            onChange={(e) => setNewSectionTitle(e.target.value)}
                                            onPressEnter={handleAddSection}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={() => setIsAddingSection(false)}>Cancel</Button>
                                            <Button type="primary" onClick={handleAddSection}>Save Section</Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Collapse
                                accordion
                                className="curriculum-collapse"
                                expandIcon={({ isActive }) => <ChevronDown className={`h-5 w-5 transition-transform ${isActive ? 'rotate-180' : ''}`} />}
                            >
                                {courseContent?.sections?.map((section, sIdx) => (
                                    <Panel
                                        header={
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-dark-500 font-mono text-sm">Section {sIdx + 1}:</span>
                                                    <Text strong className="text-white text-base">{section.title}</Text>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Text className="text-dark-400 text-xs">{section.lectures?.length || 0} Lectures</Text>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<Trash2 className="h-4 w-4" />}
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSection(section._id);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        }
                                        key={section._id}
                                    >
                                        <div className="space-y-3 pl-4">
                                            {section.lectures?.map((lecture, lIdx) => (
                                                <div key={lecture._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-dark-950/50 border border-dark-800 rounded-xl hover:border-dark-700 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-8 w-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-500 group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-colors">
                                                            {lecture.type === 'video' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Text className="text-white font-medium">{lecture.title}</Text>
                                                                {lecture.videoUrl && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                                            </div>
                                                            {lecture.videoUrl ? (
                                                                <Text
                                                                    className="text-primary-500 text-xs block hover:underline cursor-pointer flex items-center gap-1"
                                                                    onClick={() => setPreviewVideo({
                                                                        active: true,
                                                                        url: lecture.videoUrl,
                                                                        title: lecture.title
                                                                    })}
                                                                >
                                                                    <Play className="h-3 w-3" /> Preview tutorial
                                                                </Text>
                                                            ) : (
                                                                <Text className="text-amber-500/70 text-xs block flex items-center gap-1"><Clock className="h-3 w-3" /> No video content uploaded yet</Text>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                                        <input
                                                            id={`upload-input-${lecture._id}`}
                                                            type="file"
                                                            className="hidden"
                                                            accept="video/*"
                                                            onChange={(e) => handleFileSelection(e, section._id, lecture._id, lecture.title, section.title)}
                                                        />
                                                        <Button
                                                            icon={<Upload className="h-4 w-4" />}
                                                            size="small"
                                                            type={lecture.videoUrl ? "default" : "primary"}
                                                            ghost={!!lecture.videoUrl}
                                                            onClick={() => document.getElementById(`upload-input-${lecture._id}`)?.click()}
                                                        >
                                                            {lecture.videoUrl ? 'Replace' : 'Upload'}
                                                        </Button>
                                                        <Button
                                                            type="text"
                                                            danger
                                                            icon={<Trash2 className="h-4 w-4" />}
                                                            size="small"
                                                            onClick={() => handleDeleteLecture(section._id, lecture._id)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {isAddingLecture.active && isAddingLecture.sectionId === section._id ? (
                                                <div className="p-4 bg-dark-900 rounded-xl border border-dark-700 space-y-3">
                                                    <Input
                                                        placeholder="Enter lecture title"
                                                        value={newLectureTitle}
                                                        onChange={(e) => setNewLectureTitle(e.target.value)}
                                                        onPressEnter={() => handleAddLecture(section._id)}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="small" onClick={() => setIsAddingLecture({ active: false, sectionId: '' })}>Cancel</Button>
                                                        <Button size="small" type="primary" onClick={() => handleAddLecture(section._id)}>Add</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="dashed"
                                                    block
                                                    icon={<Plus className="h-4 w-4" />}
                                                    onClick={() => setIsAddingLecture({ active: true, sectionId: section._id })}
                                                >
                                                    Add Lecture
                                                </Button>
                                            )}
                                        </div>
                                    </Panel>
                                ))}
                            </Collapse>
                        </div>
                    )}
                </div>

                {/* Sidebar: Upload Queue & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <Card
                        title={<div className="flex items-center gap-2 text-white"><Upload className="h-5 w-5 text-primary-500" /> Upload Queue</div>}
                        className="bg-dark-900 border-dark-800 rounded-2xl sticky top-24"
                        headStyle={{ borderBottom: '1px solid #333' }}
                    >
                        {uploadQueue.length === 0 ? (
                            <div className="text-center py-10 opacity-40">
                                <Clock className="h-10 w-10 mx-auto mb-3" />
                                <Text className="text-dark-400">Queue is empty</Text>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Tag color={activeUploadId ? 'processing' : 'default'}>{activeUploadId ? 'Uploading' : 'Active Wait'}</Tag>
                                    <div className="space-x-2">
                                        <Button
                                            size="small"
                                            icon={isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                            onClick={isPaused ? handleResumeUpload : handlePauseUpload}
                                            disabled={!activeUploadId && !isPaused}
                                        />
                                        <Button
                                            size="small"
                                            danger
                                            onClick={() => setUploadQueue([])}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                                    {uploadQueue.map((item) => (
                                        <div key={item.id} className="space-y-2 last:border-0 pb-4 border-b border-dark-800">
                                            <div className="flex justify-between gap-2">
                                                <div className="truncate">
                                                    <Text className="text-white font-medium text-sm block truncate">{item.file.name}</Text>
                                                    <Text className="text-dark-500 text-[10px] uppercase tracking-wide">{item.sectionTitle} » {item.lectureTitle}</Text>
                                                </div>
                                                {item.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                                                {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                            </div>

                                            <Progress
                                                percent={item.progress}
                                                size="small"
                                                status={item.status === 'error' ? 'exception' : (item.status === 'completed' ? 'success' : 'active')}
                                                strokeColor="#FFA500"
                                                trailColor="#1e1e1e"
                                            />

                                            <div className="flex justify-between text-[10px] text-dark-500">
                                                <span>{item.status.toUpperCase()}</span>
                                                {item.status === 'uploading' && (
                                                    <div className="flex gap-3">
                                                        <span>{formatBytes(item.speed)}</span>
                                                        <span>ETA: {item.eta ? `${item.eta}s` : '--'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.errorMessage && <Text type="danger" className="text-[10px]">{item.errorMessage}</Text>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="bg-dark-900 border-dark-800 rounded-2xl p-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <Play className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <Text className="text-dark-400 text-xs block">Ready to go?</Text>
                                <Text className="text-white font-bold block">Preview Course</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-dark-900 border-dark-800 rounded-2xl p-2">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                <Settings className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <Text className="text-dark-400 text-xs block">Need help?</Text>
                                <Text className="text-white font-bold block">Instructor Guide</Text>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Modal
                title={previewVideo.title}
                open={previewVideo.active}
                onCancel={() => setPreviewVideo({ ...previewVideo, active: false })}
                footer={null}
                width={800}
                centered
                className="video-preview-modal"
            >
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        src={`http://localhost:5000${previewVideo.url}`}
                        controls
                        className="w-full h-full"
                        autoPlay
                    />
                </div>
            </Modal>

            <style inset>{`
                .custom-select .ant-select-selector {
                    background: #1A1A1A !important;
                    border: 1px solid #333 !important;
                    border-radius: 12px !important;
                    height: 48px !important;
                    display: flex !important;
                    align-items: center !important;
                    color: white !important;
                }
                .ant-select-dropdown {
                    background: #1A1A1A !important;
                    border: 1px solid #333 !important;
                    border-radius: 12px !important;
                    padding: 8px !important;
                }
                .ant-select-item {
                    color: #999 !important;
                    border-radius: 8px !important;
                    margin-bottom: 4px !important;
                }
                .ant-select-item-option-selected {
                    background: #FFA500 !important;
                    color: #1a1a1a !important;
                }
                .ant-select-item-option-hover {
                    background: #333 !important;
                }
                .curriculum-collapse {
                    background: transparent !important;
                    border: none !important;
                }
                .curriculum-collapse > .ant-collapse-item {
                    background: #111 !important;
                    border: 1px solid #222 !important;
                    border-radius: 16px !important;
                    margin-bottom: 16px !important;
                    overflow: hidden;
                }
                .ant-collapse-content {
                    background: #111 !important;
                    border-top: 1px solid #222 !important;
                }
                .ant-collapse-header {
                    padding: 16px 24px !important;
                    color: white !important;
                }
                .ant-btn-primary {
                    background: #FFA500 !important;
                    border-color: #FFA500 !important;
                    color: #000 !important;
                    font-weight: 700 !important;
                    border-radius: 8px !important;
                }
                .ant-btn-primary:hover {
                    background: #FFB533 !important;
                    border-color: #FFB533 !important;
                }
                .ant-input {
                    background: #111 !important;
                    border: 1px solid #333 !important;
                    color: white !important;
                    border-radius: 8px !important;
                }
                .ant-input:focus {
                    border-color: #FFA500 !important;
                    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.1) !important;
                }
                .ant-progress-text {
                    color: #fff !important;
                    font-size: 10px !important;
                }
            `}</style>
        </div>
    );
};

export default TeacherCoursesPage;
