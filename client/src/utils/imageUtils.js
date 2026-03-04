export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Remove /api from VITE_API_URL or use default relative
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

    // Ensure the URL starts with a slash
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${formattedUrl}`;
};

export const getAvatarUrl = (url) => {
    if (!url || url === 'default-avatar.png' || url.includes('default-avatar')) {
        return '/default-avatar.png';
    }
    // If it already has /uploads/ or starts with http, don't prepend again
    if (url.startsWith('/uploads/') || url.startsWith('http')) {
        return getImageUrl(url);
    }
    return getImageUrl(`/uploads/${url}`);
};

export const getCourseThumbnail = (url) => {
    if (!url || url === '/uploads/default-course.jpg' || url.includes('default-course')) {
        return '/default-course.jpg';
    }
    return getImageUrl(url) || '/default-course.jpg';
};
