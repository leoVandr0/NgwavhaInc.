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
    // Full R2 / external CDN URL — return as-is
    if (url.startsWith('http')) {
        return url;
    }
    // Local path already includes /uploads/
    if (url.startsWith('/uploads/')) {
        return getImageUrl(url);
    }
    // Raw local filename — prepend /uploads/
    return getImageUrl(`/uploads/${url}`);
};

export const getCourseThumbnail = (url) => {
    if (!url || url === '/uploads/default-course.jpg' || url.includes('default-course')) {
        return '/default-course.jpg';
    }
    // Full R2 / external CDN URL — return as-is
    if (url.startsWith('http')) {
        return url;
    }
    // Local path already includes /uploads/
    if (url.startsWith('/uploads/')) {
        return getImageUrl(url);
    }
    // Raw local filename — prepend /uploads/
    return getImageUrl(`/uploads/${url}`) || '/default-course.jpg';
};
