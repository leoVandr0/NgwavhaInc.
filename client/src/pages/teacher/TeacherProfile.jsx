import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    User,
    Mail,
    Linkedin,
    Globe,
    Twitter,
    Youtube,
    Award,
    Briefcase,
    GraduationCap,
    Save,
    Camera,
    Plus,
    X,
    Users,
    Star,
    PlayCircle,
    CheckCircle
} from 'lucide-react';
import { message } from 'antd';
import api from '../../services/api';

const TeacherProfile = () => {
    const { currentUser, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        headline: '',
        bio: '',
        email: '',
        linkedin: '',
        twitter: '',
        youtube: '',
        website: '',
        skills: '',
        certifications: '',
        experience: '',
        avatar: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                headline: currentUser.headline || '',
                bio: currentUser.bio || '',
                email: currentUser.email || '',
                linkedin: currentUser.linkedin || '',
                twitter: currentUser.twitter || '',
                youtube: currentUser.youtube || '',
                website: currentUser.website || '',
                skills: currentUser.skills || '',
                certifications: currentUser.certifications || '',
                experience: currentUser.experience || '',
                avatar: currentUser.avatar || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            // In a real app with AuthContext, you'd update the context
            // If the login function from useAuth updates the context:
            // login(data, localStorage.getItem('token')); 
            // But we already have currentUser in context. We might need a way to refresh it.
            // For now, let's assume message success is enough or a local update if possible.
            message.success('Profile updated successfully!');
            setIsEditing(false);
            window.location.reload(); // Simple way to refresh context for now
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);

        try {
            const { data } = await api.post('/auth/avatar', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar: data.url }));
            message.success('Avatar uploaded successfully!');
        } catch (error) {
            message.error('Failed to upload avatar');
        }
    };

    // Helper to render skills as badges
    const renderSkills = (skillsString) => {
        if (!skillsString) return null;
        return skillsString.split(',').map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-sm font-medium">
                {skill.trim()}
            </span>
        ));
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-dark-950 text-white pb-20">
            {/* Header Section */}
            <div className="bg-dark-900 border-b border-dark-800 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Picture */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 shadow-2xl shadow-primary-500/20 bg-dark-800">
                                {formData.avatar ? (
                                    <img src={getImageUrl(formData.avatar)} alt={formData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-20 h-20 text-dark-400" />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-2 right-2 p-3 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
                                    <Camera className="w-5 h-5 text-dark-950" />
                                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                                </label>
                            )}
                        </div>

                        {/* Name & Headline */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                {isEditing ? (
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-xl px-4 py-2 outline-none transition-all text-2xl font-black w-full md:w-auto"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-black">{formData.name}</h1>
                                )}
                                {!isEditing && (
                                    <div className="hidden">
                                        {/* Button moved to stats section for better alignment */}
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <input
                                    name="headline"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Web Developer & Instructor"
                                    className="w-full bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-xl px-4 py-2 outline-none transition-all mb-4 text-xl font-medium"
                                />
                            ) : (
                                <p className="text-xl text-primary-400 font-medium mb-6">
                                    {formData.headline || "Passionate Educator"}
                                </p>
                            )}

                            {/* Social Quick Links (ReadOnly) */}
                            {!isEditing && (
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    {formData.website && (
                                        <a href={formData.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-800 hover:bg-primary-500 hover:text-dark-950 rounded-lg transition-all">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                    {formData.linkedin && (
                                        <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-800 hover:bg-[#0077b5] rounded-lg transition-all">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {formData.twitter && (
                                        <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-800 hover:bg-[#1da1f2] rounded-lg transition-all">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                    )}
                                    {formData.youtube && (
                                        <a href={formData.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-800 hover:bg-[#ff0000] rounded-lg transition-all">
                                            <Youtube className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap md:flex-nowrap items-end gap-3 w-full lg:w-auto">
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest h-[52px] min-w-[100px] flex items-center justify-center"
                                >
                                    Edit Profile
                                </button>
                            )}
                            <div className="text-center bg-dark-800/50 px-4 py-2.5 rounded-xl border border-dark-800 flex-1 md:flex-none md:min-w-[120px]">
                                <p className="text-dark-400 text-[9px] uppercase font-black mb-0.5 tracking-tight opacity-70">Total Students</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <Users className="w-3 h-3 text-primary-500" />
                                    <p className="text-lg font-bold whitespace-nowrap">152,403</p>
                                </div>
                            </div>
                            <div className="text-center bg-dark-800/50 px-4 py-2.5 rounded-xl border border-dark-800 flex-1 md:flex-none md:min-w-[120px]">
                                <p className="text-dark-400 text-[9px] uppercase font-black mb-0.5 tracking-tight opacity-70">Reviews</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <Star className="w-3 h-3 text-yellow-500" />
                                    <p className="text-lg font-bold whitespace-nowrap">24,562</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">

                    {/* Left & Middle Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-500/10 rounded-lg">
                                    <User className="w-6 h-6 text-primary-500" />
                                </div>
                                <h2 className="text-2xl font-bold">About Me</h2>
                            </div>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="8"
                                    className="w-full bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none transition-all leading-relaxed"
                                    placeholder="Write your professional bio..."
                                />
                            ) : (
                                <div className="prose prose-invert max-w-none text-dark-300 leading-relaxed text-lg">
                                    {formData.bio || "No bio provided yet."}
                                </div>
                            )}
                        </section>

                        {/* Experience Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-500/10 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-primary-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Experience</h2>
                            </div>
                            {isEditing ? (
                                <textarea
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    rows="6"
                                    className="w-full bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none transition-all leading-relaxed"
                                    placeholder="List your professional background..."
                                />
                            ) : (
                                <div className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                                    {formData.experience || "No experience shared yet."}
                                </div>
                            )}
                        </section>

                        {/* Certifications Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-500/10 rounded-lg">
                                    <Award className="w-6 h-6 text-primary-500" />
                                </div>
                                <h2 className="text-2xl font-bold">Certifications</h2>
                            </div>
                            {isEditing ? (
                                <textarea
                                    name="certifications"
                                    value={formData.certifications}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-2xl px-6 py-4 outline-none transition-all"
                                    placeholder="List your certifications..."
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.certifications ? formData.certifications.split('\n').map((cert, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-800 rounded-xl">
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                            <span>{cert}</span>
                                        </div>
                                    )) : <p className="text-dark-400">No certifications listed.</p>}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column (Sidebar Edit/Links) */}
                    <div className="space-y-8">

                        {/* Action Buttons (Sticky) */}
                        {isEditing && (
                            <div className="bg-dark-900 border border-primary-500/30 p-6 rounded-2xl sticky top-24 z-10">
                                <h3 className="text-lg font-bold mb-4">Save Changes</h3>
                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary-500 hover:bg-primary-600 text-dark-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20"
                                    >
                                        {loading ? <Plus className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="w-full bg-dark-800 hover:bg-dark-700 text-white font-bold py-4 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Skills Section */}
                        <div className="bg-dark-900 border border-dark-800 p-8 rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Skills</h3>
                                <GraduationCap className="w-5 h-5 text-primary-500" />
                            </div>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-dark-400 mb-2">Separate skills with commas</p>
                                    <textarea
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full bg-dark-800 border-2 border-dark-700 focus:border-primary-500 rounded-xl px-4 py-3 outline-none transition-all"
                                        placeholder="JS, React, Python..."
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills ? renderSkills(formData.skills) : <p className="text-dark-400">Add skills to your profile.</p>}
                                </div>
                            )}
                        </div>

                        {/* Social Links Form (Show only in Edit) */}
                        <div className={`bg-dark-900 border border-dark-800 p-8 rounded-3xl ${isEditing ? 'block' : 'hidden md:block'}`}>
                            <h3 className="text-xl font-bold mb-6">Contact & Social</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-dark-500 uppercase">Public Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500 disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-dark-500 uppercase">LinkedIn Profile</label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                        <input
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-dark-500 uppercase">Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                        <input
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            placeholder="https://..."
                                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-dark-500 uppercase">Twitter</label>
                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                                        <input
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className="w-full bg-dark-800 border-2 border-dark-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherProfile;
