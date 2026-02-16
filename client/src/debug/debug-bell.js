// Debug script to check bell icon functionality
export const debugBellIcon = () => {
    console.log('🔔 Debugging bell icon...');
    
    // Check if bell icon exists
    const bellIcon = document.querySelector('a[href="/settings/notifications"]');
    if (bellIcon) {
        console.log('✅ Bell icon found:', bellIcon);
        console.log('🔍 Bell icon classes:', bellIcon.className);
        console.log('🔍 Bell icon href:', bellIcon.getAttribute('href'));
        
        // Add click listener for debugging
        bellIcon.addEventListener('click', (e) => {
            console.log('🔔 Bell icon clicked!', e);
            console.log('🔍 Event details:', {
                type: e.type,
                target: e.target,
                currentTarget: e.currentTarget,
                defaultPrevented: e.defaultPrevented
            });
        });
        
        // Check if it's visible
        const styles = window.getComputedStyle(bellIcon);
        console.log('🔍 Bell icon visibility:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            zIndex: styles.zIndex
        });
        
        // Check if it's covered by other elements
        const rect = bellIcon.getBoundingClientRect();
        console.log('🔍 Bell icon position:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
        
        // Check elements at the same position
        const elementAtPoint = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
        console.log('🔍 Element at bell icon center:', elementAtPoint);
        
        if (elementAtPoint !== bellIcon) {
            console.warn('⚠️ Bell icon might be covered by another element!');
        }
        
    } else {
        console.error('❌ Bell icon not found!');
        console.log('🔍 Looking for any bell icons...');
        const allBells = document.querySelectorAll('[class*="bell"], [class*="Bell"]');
        console.log('🔍 Found bell elements:', allBells);
    }
    
    // Check React Router
    console.log('🔍 Checking React Router...');
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools available');
    } else {
        console.log('⚠️ React DevTools not available');
    }
};

// Auto-run debug in development
if (import.meta.env.DEV) {
    setTimeout(() => {
        debugBellIcon();
    }, 2000);
}
