import React, { useState, useEffect } from 'react';
import userSettingsService from '../../services/userSettingsService';

const UserSettings = () => {
    const [formData, setFormData] = useState({
        id: 1,
        username: '',
        email: '',
        fullName: '',
        language: 'en',
        theme: 'light',
        bio: '',
        photoUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserSettings();
    }, []);

    const fetchUserSettings = async () => {
        try {
            setLoading(true);
            const data = await userSettingsService.getUserSettings();
            setFormData({
                ...data.data,
            });
            console.log(data);
        } catch (err) {
            setError('Failed to load user settings');
            console.error('Error loading user settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                email: formData.email,
                fullName: formData.fullName,
                language: formData.language,
                theme: formData.theme,
                bio: formData.bio,
                photoUrl: formData.photoUrl
            };
            await userSettingsService.updateUserSettings(updateData);
            alert('Settings updated successfully!');
        } catch (err) {
            alert('Failed to update settings');
            console.error('Error updating settings:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600">{error}</div>
                <button
                    onClick={fetchUserSettings}
                    className="mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-teal-500">User Settings</h2>

            <div className="flex items-start mb-8">
                <div className="w-48 h-48 bg-purple-300 mr-6">
                    {formData.photoUrl ? (
                        <img
                            src={formData.photoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-white text-5xl">
                                {/* Pixelated deer image from Taiga */}
                                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
                                    <rect x="8" y="4" width="2" height="2" />
                                    <rect x="14" y="4" width="2" height="2" />
                                    <rect x="6" y="6" width="2" height="2" />
                                    <rect x="16" y="6" width="2" height="2" />
                                    <rect x="4" y="8" width="2" height="2" />
                                    <rect x="18" y="8" width="2" height="2" />
                                    <rect x="2" y="10" width="2" height="2" />
                                    <rect x="6" y="10" width="2" height="2" />
                                    <rect x="10" y="10" width="2" height="2" />
                                    <rect x="14" y="10" width="2" height="2" />
                                    <rect x="18" y="10" width="2" height="2" />
                                    <rect x="20" y="10" width="2" height="2" />
                                    <rect x="2" y="12" width="2" height="2" />
                                    <rect x="20" y="12" width="2" height="2" />
                                    <rect x="4" y="14" width="2" height="2" />
                                    <rect x="18" y="14" width="2" height="2" />
                                    <rect x="6" y="16" width="2" height="2" />
                                    <rect x="16" y="16" width="2" height="2" />
                                    <rect x="8" y="18" width="2" height="2" />
                                    <rect x="14" y="18" width="2" height="2" />
                                    <rect x="10" y="16" width="4" height="2" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">
                        CHANGE PHOTO
                    </button>
                    <button className="text-teal-500 hover:underline">
                        Use default image
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none bg-gray-100"
                        disabled
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                    </label>
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    >
                        <option value="en">English (US)</option>
                        <option value="vi">Vietnamese</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                    </label>
                    <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    >
                        <option value="light">taiga</option>
                        <option value="dark">dark</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio (max. 210 chars)
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        maxLength={210}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="bg-teal-400 text-white px-6 py-2 rounded hover:bg-teal-500"
                    >
                        SAVE
                    </button>
                </div>
            </form>

            <div className="mt-10 text-gray-600 flex space-x-8">
                <a href="#" className="text-teal-500 hover:underline">Download Taiga profile</a>
                <a href="#" className="text-red-500 hover:underline">Delete Taiga account</a>
            </div>
        </div>
    );
};

export default UserSettings; 