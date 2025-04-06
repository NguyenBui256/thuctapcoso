import React, { useState } from 'react';
import userSettingsService from '../../services/userSettingsService';
import bcrypt from 'bcryptjs';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        setError(null);
    };

    const validateForm = () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return false;
        }
        return true;
    };

    const hashPassword = async (password) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError(null);

            // Hash both current and new passwords
            const hashedCurrentPassword = await hashPassword(formData.currentPassword);
            const hashedNewPassword = await hashPassword(formData.newPassword);

            // Send hashed passwords to server
            await userSettingsService.changePassword({
                currentPassword: hashedCurrentPassword,
                newPassword: hashedNewPassword
            });

            setSuccess(true);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-teal-500">Change password</h2>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current password
                    </label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Your current password (or empty if you have no password yet)"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New password
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Type a new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retype new password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Retype the new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 border border-red-200 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 border border-green-200 rounded">
                        Password changed successfully!
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-teal-400 text-white rounded uppercase text-sm font-medium hover:bg-teal-500 disabled:bg-teal-300"
                    >
                        {loading ? 'SAVING...' : 'SAVE'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword; 