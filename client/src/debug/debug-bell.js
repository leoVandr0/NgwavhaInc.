// Debug script to check bell icon functionality
export const debugBellIcon = () => {
    console.log('🔔 Debugging bell icon...');
    
    // Check authentication status
    console.log('🔍 Checking authentication...');
    const userElement = document.querySelector('[data-user]');
    if (userElement) {
        console.log('✅ User data found:', userElement.dataset);
    } else {
        console.log('⚠️ No user data element found');
    }
    
    // Check for bell buttons specifically
    console.log('🔍 Looking for bell buttons...');
    const bellButtons = document.querySelectorAll('button');
    const bellButton = Array.from(bellButtons).find(button => {
        return button.innerHTML.includes('lucide-bell') || button.textContent.includes('🔔');
    });
    
    if (bellButton) {
        console.log('✅ Bell button found:', bellButton);
        console.log('🔍 Bell button classes:', bellButton.className);
        console.log('🔍 Bell button HTML:', bellButton.outerHTML);
        
        // Check if it's visible
        const styles = window.getComputedStyle(bellButton);
        console.log('🔍 Bell button visibility:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            zIndex: styles.zIndex
        });
        
        // Check if it's covered by other elements
        const rect = bellButton.getBoundingClientRect();
        console.log('🔍 Bell button position:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            isVisible: rect.width > 0 && rect.height > 0
        });
        
        if (rect.width > 0 && rect.height > 0) {
            const elementAtPoint = document.elementFromPoint(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );
            console.log('🔍 Element at bell button center:', elementAtPoint);
            
            if (elementAtPoint !== bellButton) {
                console.warn('⚠️ Bell button might be covered by another element!');
            }
        }
        
        // Add click listener for debugging
        bellButton.addEventListener('click', (e) => {
            console.log('🔔 Bell button clicked!', e);
            console.log('🔍 Event details:', {
                type: e.type,
                target: e.target,
                currentTarget: e.currentTarget,
                defaultPrevented: e.defaultPrevented,
                bubbles: e.bubbles
            });
        });
        
    } else {
        console.error('❌ Bell button not found!');
        console.log('🔍 All buttons found:', bellButtons.length);
        
        // Check for any bell-related elements
        const allBells = document.querySelectorAll('[class*="bell"], [class*="Bell"], [class*="lucide-bell"]');
        console.log('🔍 Found bell elements:', allBells);
        
        // Check for notification-related elements
        const notificationElements = document.querySelectorAll('[title*="notification"], [aria-label*="notification"]');
        console.log('🔍 Found notification elements:', notificationElements);
    }
    
    // Check if we're on the right page
    console.log('🔍 Current page:', {
        url: window.location.href,
        path: window.location.pathname
    });
    
    // Check React Router
    console.log('🔍 Checking React Router...');
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools available');
    } else {
        console.log('⚠️ React DevTools not available');
    }
    
    // Test manual navigation
    console.log('🧪 Testing manual navigation...');
    try {
        if (window.location.pathname !== '/settings/notifications') {
            console.log('🧪 You can manually navigate to: /settings/notifications');
        }
    } catch (error) {
        console.error('❌ Manual navigation test failed:', error);
    }
};

// Auto-run debug in development
if (import.meta.env.DEV) {
    setTimeout(() => {
        debugBellIcon();
    }, 2000);
}
