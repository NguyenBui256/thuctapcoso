import React, { useState, useEffect } from 'react';
import UserSettings from './UserSettings';
import ChangePassword from './ChangePassword';
import EmailNotifications from './EmailNotifications';

const AccountSettings = () => {
    const [activeTab, setActiveTab] = useState('user-settings');

    useEffect(() => {
        console.log('AccountSettings component mounted');
    }, []);

    const tabs = [
        { id: 'user-settings', label: 'USER SETTINGS' },
        { id: 'change-password', label: 'CHANGE PASSWORD' },
        { id: 'email-notifications', label: 'EMAIL NOTIFICATIONS' },
    ];

    const renderContent = () => {
        console.log('Rendering content for tab:', activeTab);
        switch (activeTab) {
            case 'user-settings':
                return <UserSettings />;
            case 'change-password':
                return <ChangePassword />;
            case 'email-notifications':
                return <EmailNotifications />;
            default:
                return <UserSettings />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white border-r">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-800 uppercase">User Settings</h2>
                        </div>
                        <nav className="p-4">
                            <ul className="space-y-1">
                                {tabs.map(tab => (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => {
                                                console.log('Tab clicked:', tab.id);
                                                setActiveTab(tab.id);
                                            }}
                                            className={`block w-full text-left py-2 px-4 ${activeTab === tab.id
                                                ? 'text-gray-900 bg-gray-100 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings; 