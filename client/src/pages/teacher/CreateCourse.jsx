import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { App } from 'antd';
import { Upload, X } from 'lucide-react';
import api from '../../services/api';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    // Initial State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'beginner',
        categoryId: '',
        thumbnailFile: null
    });

    // Fetch Categories
    const { data: categories } = useQuery('categories', async () => {
        try {
            const { data } = await api.get('/categories');
            return data;
        } catch (e) {
            return [
                { id: 1, name: 'Web Development' },
                { id: 2, name: 'Data Science' },
                { id: 3, name: 'Design' },
                { id: 4, name: 'Business' },
            ];
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                message.error('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                message.error('Image size should be less than 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, thumbnailFile: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let thumbnailPath = '/uploads/default-course.jpg';

            // Upload thumbnail if selected
            if (formData.thumbnailFile) {
                setUploading(true);
                const formDataUpload = new FormData();
                formDataUpload.append('thumbnail', formData.thumbnailFile);

                try {
                    console.log('Uploading thumbnail...', formData.thumbnailFile.name);
                    
                    const { data: uploadData } = await api.post('/upload/course-thumbnail', formDataUpload, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    
                    console.log('Upload response:', uploadData);
                    
                    if (uploadData.filePath) {
                        thumbnailPath = uploadData.filePath;
                    }
                    
                    message.success('Thumbnail uploaded successfully');
                } catch (uploadError) {
                    console.error('Thumbnail upload error:', uploadError);
                    const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Unknown upload error';
                    message.error(`Failed to upload thumbnail: ${errorMsg}`);
                    setLoading(false);
                    setUploading(false);
                    return; // Don't continue if thumbnail upload fails
                } finally {
                    setUploading(false);
                }
            }

            console.log('Creating course with thumbnail:', thumbnailPath);
            
            const { data } = await api.post('/courses', {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                level: formData.level,
                categoryId: formData.categoryId || 1,
                thumbnail: thumbnailPath
            });

            message.success('Course created successfully!');
            navigate('/teacher/courses');
        } catch (error) {
            console.error('Course creation error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create course';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 text-white font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-white">Create New Course</h1>
                    <p className="text-dark-400 mt-2">Start building your new course. You can add video content in the next step.</p>
                </div>

                <div className="bg-dark-900 border border-dark-800 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-dark-300">
                                Course Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Complete Python Bootcamp"
                                className="mt-1 block w-full bg-dark-800 border-dark-700 rounded-none shadow-sm focus:border-primary-500 focus:ring-primary-500 text-white sm:text-sm py-3 px-4"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-dark-300">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What will students learn?"
                                className="mt-1 block w-full bg-dark-800 border-dark-700 rounded-none shadow-sm focus:border-primary-500 focus:ring-primary-500 text-white sm:text-sm py-3 px-4"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-dark-300">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="mt-1 block w-full bg-dark-800 border-dark-700 rounded-none shadow-sm focus:border-primary-500 focus:ring-primary-500 text-white sm:text-sm py-3 px-4"
                                />
                            </div>

                            {/* Level */}
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium text-dark-300">
                                    Difficulty Level
                                </label>
                                <select
                                    name="level"
                                    id="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="mt-1 block w-full bg-dark-800 border-dark-700 rounded-none shadow-sm focus:border-primary-500 focus:ring-primary-500 text-white sm:text-sm py-3 px-4"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="all">All Levels</option>
                                </select>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-dark-300">
                                Category
                            </label>
                            <select
                                name="categoryId"
                                id="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="mt-1 block w-full bg-dark-800 border-dark-700 rounded-none shadow-sm focus:border-primary-500 focus:ring-primary-500 text-white sm:text-sm py-3 px-4"
                            >
                                <option value="">Select a category</option>
                                {categories && Array.isArray(categories) ? categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                )) : (
                                    <>
                                        <option value="1">Web Development</option>
                                        <option value="2">Business</option>
                                        <option value="3">Design</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label htmlFor="thumbnail" className="block text-sm font-medium text-dark-300 mb-2">
                                Course Thumbnail (Optional)
                            </label>

                            {thumbnailPreview ? (
                                <div className="relative">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-48 object-cover bg-dark-800 border-2 border-dark-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailPreview(null);
                                            setFormData(prev => ({ ...prev, thumbnailFile: null }));
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dark-700 border-dashed cursor-pointer bg-dark-800 hover:bg-dark-750 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 mb-3 text-dark-400" />
                                        <p className="mb-2 text-sm text-dark-300">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-dark-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        id="thumbnail"
                                        name="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-none text-dark-950 bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                            >
                                {uploading ? 'Uploading Image...' : loading ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
