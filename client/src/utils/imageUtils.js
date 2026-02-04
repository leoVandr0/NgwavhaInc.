export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Remove /api from VITE_API_URL or use default localhost
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    // Ensure the URL starts with a slash
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${formattedUrl}`;
};

export const getAvatarUrl = (url) => {
    if (!url || url === 'default-avatar.png') return '/default-avatar.png';
    return getImageUrl(`/uploads/${url}`);
};

export const getCourseThumbnail = (url) => {
    return getImageUrl(url) || '/default-course.jpg';
};
