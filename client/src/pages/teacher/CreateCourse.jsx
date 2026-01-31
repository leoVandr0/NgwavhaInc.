import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { App } from 'antd';
import api from '../../services/api';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        level: 'beginner',
        categoryId: '',
        thumbnail: null
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/courses', {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                level: formData.level,
                categoryId: formData.categoryId || 1 // Fallback ID if not selected
            });

            message.success('Course created successfully!');
            // Redirect to the Content Studio (TeacherCoursesPage) to add lectures
            navigate('/teacher/courses');
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create course');
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

                        {/* Category - Mocking if API fails */}
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

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-bold rounded-none text-dark-950 bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
