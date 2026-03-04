export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Use absolute URL from environment or fallback to relative
    const baseUrl = import.meta.env.VITE_API_ORIGIN || '';

    // Ensure the path starts with a slash
    const formattedPath = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${formattedPath}`;
};

export const getAvatarUrl = (url) => {
    if (!url || url === 'default-avatar.png' || url.includes('default-avatar')) {
        return '/default-avatar.png';
    }
    // If it already has /uploads/ or starts with http, return as is (via getImageUrl)
    if (url.startsWith('/uploads/') || url.startsWith('http')) {
        return getImageUrl(url);
    }
    // Otherwise, assume it's a raw filename in the uploads directory
    return getImageUrl(`/uploads/${url}`);
};

export const getCourseThumbnail = (url) => {
    if (!url || url === '/uploads/default-course.jpg' || url.includes('default-course')) {
        return '/default-course.jpg';
    }

    // For local filenames, ensure /uploads/ is prepended
    if (!url.startsWith('http') && !url.startsWith('/uploads/')) {
        return getImageUrl(`/uploads/${url}`);
    }

    return getImageUrl(url) || '/default-course.jpg';
};
