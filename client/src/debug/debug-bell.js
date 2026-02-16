// Debug script to check bell icon functionality (optimized for performance)
export const debugBellIcon = () => {
    console.log('🔔 Debugging bell icon...');
    
    // Quick check for bell buttons
    const bellButtons = document.querySelectorAll('button');
    const bellButton = Array.from(bellButtons).find(button => {
        return button.innerHTML.includes('lucide-bell') || button.textContent.includes('🔔');
    });
    
    if (bellButton) {
        console.log('✅ Bell button found and should be clickable');
        
        // Only do detailed checks if button exists
        const rect = bellButton.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            console.log('✅ Bell button is visible and positioned correctly');
        } else {
            console.warn('⚠️ Bell button found but not visible');
        }
        
    } else {
        console.error('❌ Bell button not found!');
        console.log('� Try refreshing the page or check if the Navbar component is rendering');
    }
    
    console.log('🔍 Current page:', window.location.pathname);
    console.log('🧪 Manual navigation: You can go to /settings/notifications');
};

// Auto-run debug in development (commented out to prevent double execution)
// if (import.meta.env.DEV) {
//     setTimeout(() => {
//         debugBellIcon();
//     }, 2000);
// }
