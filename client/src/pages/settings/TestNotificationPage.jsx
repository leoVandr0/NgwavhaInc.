import React from 'react';

const TestNotificationPage = () => {
    return (
        <div className="min-h-screen bg-dark-950 text-white p-6">
            <h1 className="text-3xl font-bold mb-4">Test Notification Page</h1>
            <p className="text-dark-400">If you can see this page, the routing is working!</p>
            <div className="mt-8">
                <button 
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default TestNotificationPage;
