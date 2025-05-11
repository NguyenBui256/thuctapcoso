import React, { useState } from 'react';
import axios from '../../common/axios-customize';

const ContactProjectModal = ({ isOpen, onClose, projectId, projectName }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        try {
            setSending(true);
            setError('');

            const response = await axios.post(`/api/v1/projects/${projectId}/contact`, {
                message: message.trim()
            });

            console.log('Message sent successfully:', response.data);
            setSuccess(true);
            setMessage('');
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="flex justify-between items-center pb-3 border-b mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Send an email to {projectName}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-4">
                            The email will be received by the project admins
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
                                Your message has been sent successfully!
                            </div>
                        )}

                        <div className="mt-4">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                rows="6"
                                disabled={sending || success}
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6">
                        <button
                            onClick={handleSend}
                            disabled={sending || success}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                        >
                            {sending ? 'Sending...' : success ? 'Sent!' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactProjectModal; 