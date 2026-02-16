import React, { useState } from 'react';
import { CheckCircle, User, Bell, Shield } from 'lucide-react';
import NotificationPreferences from './NotificationPreferences';

const MultiStepRegister = ({ 
    children, 
    formData, 
    setFormData, 
    loading, 
    onSubmit 
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [notificationPrefs, setNotificationPrefs] = useState({
        email: true,
        whatsapp: false,
        sms: false,
        push: true,
        inApp: true,
        courseUpdates: true,
        assignmentReminders: true,
        newMessages: true,
        promotionalEmails: false,
        weeklyDigest: false
    });

    const steps = [
        {
            number: 1,
            title: 'Account Information',
            description: 'Create your account credentials',
            icon: <User className="w-5 h-5" />
        },
        {
            number: 2,
            title: 'Notification Preferences',
            description: 'Choose how you want to stay updated',
            icon: <Bell className="w-5 h-5" />
        },
        {
            number: 3,
            title: 'Complete Setup',
            description: 'Review and create your account',
            icon: <CheckCircle className="w-5 h-5" />
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleNotificationSubmit = (prefs) => {
        setNotificationPrefs(prefs);
        handleNext();
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        
        // Merge notification preferences with form data
        const submissionData = {
            ...formData,
            notificationPreferences: notificationPrefs
        };

        await onSubmit(e, submissionData);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.name && formData.email && formData.password && 
                       formData.password === formData.confirmPassword;
            case 2:
                return true; // Notification preferences are always valid
            case 3:
                return true; // Final review step
            default:
                return false;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                // Clone the original form and modify it for step 1
                return React.cloneElement(children, {
                    formData,
                    setFormData,
                    loading: false,
                    onSubmit: (e) => {
                        e.preventDefault();
                        if (isStepValid()) {
                            handleNext();
                        }
                    },
                    submitButtonText: 'Continue',
                    showNotificationStep: false
                });
            
            case 2:
                return (
                    <NotificationPreferences
                        preferences={notificationPrefs}
                        onChange={setNotificationPrefs}
                        onSkip={handleNext}
                    />
                );
            
            case 3:
                return (
                    <div className="bg-dark-900 rounded-lg p-6 space-y-6">
                        <div className="text-center">
                            <Shield className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Almost Done!
                            </h3>
                            <p className="text-dark-400">
                                Review your information and create your account
                            </p>
                        </div>

                        {/* Review Information */}
                        <div className="space-y-4">
                            <div className="bg-dark-800 rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-3">Account Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-dark-400">Name:</span>
                                        <span className="text-white">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-400">Email:</span>
                                        <span className="text-white">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-400">Role:</span>
                                        <span className="text-white capitalize">{formData.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-800 rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-3">Notification Channels</h4>
                                <div className="flex flex-wrap gap-2">
                                    {notificationPrefs.email && (
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Email</span>
                                    )}
                                    {notificationPrefs.whatsapp && (
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">WhatsApp</span>
                                    )}
                                    {notificationPrefs.sms && (
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">SMS</span>
                                    )}
                                    {notificationPrefs.push && (
                                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">Push</span>
                                    )}
                                    {notificationPrefs.inApp && (
                                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">In-App</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={loading}
                                className="flex-1 px-4 py-3 border border-dark-700 text-dark-300 rounded-lg hover:bg-dark-800 transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                        currentStep >= step.number
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-700 text-dark-400'
                                    }`}
                                >
                                    {step.icon}
                                </div>
                                <span className="text-xs mt-2 text-center">
                                    <div className={`font-medium ${
                                        currentStep >= step.number ? 'text-white' : 'text-dark-400'
                                    }`}>
                                        {step.title}
                                    </div>
                                    <div className="text-dark-500 max-w-[100px]">
                                        {step.description}
                                    </div>
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                                        currentStep > step.number ? 'bg-primary-500' : 'bg-dark-700'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="transition-all duration-300">
                {renderStepContent()}
            </div>

            {/* Navigation for Step 1 */}
            {currentStep === 1 && (
                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex-1 px-4 py-3 border border-dark-700 text-dark-300 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

export default MultiStepRegister;
