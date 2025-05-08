import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../utils/AuthUtils'
import { BASE_API_URL } from '../../common/constants';

function AddSprintModal({ projectId, isOpen, onClose, setSuccess }) {

    const [sprintName, setSprintName] = useState('');
    const today = new Date()
    const weekLater = new Date()
    weekLater.setDate(today.getDate() + 7)
    const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(weekLater.toISOString().split('T')[0]);

    // Reset form values when the modal opens or closes
    useEffect(() => {
        if (isOpen) {
            // Update dates to current
            const newToday = new Date();
            const newWeekLater = new Date();
            newWeekLater.setDate(newToday.getDate() + 7);

            setSprintName('');
            setStartDate(newToday.toISOString().split('T')[0]);
            setEndDate(newWeekLater.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const resetForm = () => {
        setSprintName('');
        const newToday = new Date();
        const newWeekLater = new Date();
        newWeekLater.setDate(newToday.getDate() + 7);
        setStartDate(newToday.toISOString().split('T')[0]);
        setEndDate(newWeekLater.toISOString().split('T')[0]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (endDate < startDate) {
            toast.error("Ngày bắt đầu không thể sau ngày kết thúc")
            return
        }
        if (!sprintName) {
            toast.error("Tên sprint không được để trống")
            return
        }
        const body = {
            projectId,
            name: sprintName,
            startDate,
            endDate
        }
        console.log("Creating sprint with data:", body);
        console.log("ProjectId value:", projectId, "type:", typeof projectId);

        try {
            // Đảm bảo projectId được chuyển đổi sang số nếu nó là chuỗi
            const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;

            const apiUrl = `${BASE_API_URL}/v1/sprint/create`;
            console.log("Full API URL:", apiUrl);

            const res = await fetchWithAuth(apiUrl, window.location, true, {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    ...body,
                    projectId: numericProjectId
                })
            });

            console.log("Sprint creation API response status:", res.status, res.ok);
            const data = await res.json();
            console.log("Sprint creation API response data:", data);
            console.log("New sprint ID:", data.data?.id);

            if (data.error) {
                toast.error(data.message);
            } else {
                toast.success("Sprint created successfully");
                resetForm();
                setSuccess();
            }
        } catch (error) {
            console.error("Error creating sprint:", error);
            toast.error("Failed to create sprint");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            {/* New Sprint Form */}
            <div className="flex justify-center items-center">
                <div className="w-full max-w-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">New sprint</h2>

                    {/* Sprint Name Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Sprint name"
                            value={sprintName}
                            onChange={(e) => setSprintName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Date Range Inputs */}
                    <div className="flex gap-4 mb-6">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value)
                                console.log(e.target.value)
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSave}
                            className="bg-green-400 hover:bg-green-500 text-white font-medium py-3 px-8 rounded"
                        >
                            LƯU
                        </button>
                    </div>
                </div>
            </div>

            <div
                className='absolute top-10 right-10 text-4xl cursor-pointer'
                onClick={handleClose}
            >
                <FiX />
            </div>
        </div>
    );
}

export default AddSprintModal;