// Clear any notification-related cache or localStorage data
export const clearNotificationCache = () => {
    try {
        // Clear notification-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('notification') || key.includes('badge') || key.includes('count'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log(`🧹 Cleared ${keysToRemove.length} notification-related items from localStorage`);
        
        // Clear any session storage items
        if (typeof sessionStorage !== 'undefined') {
            const sessionKeysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (key.includes('notification') || key.includes('badge') || key.includes('count'))) {
                    sessionKeysToRemove.push(key);
                }
            }
            
            sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
            console.log(`🧹 Cleared ${sessionKeysToRemove.length} notification-related items from sessionStorage`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to clear notification cache:', error);
        return false;
    }
};

// Auto-clear on load in development
if (import.meta.env.DEV) {
    clearNotificationCache();
}
