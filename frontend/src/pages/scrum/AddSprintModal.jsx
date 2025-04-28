import React, { useState } from 'react';
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


    const handleSave = async () => {
        if(endDate < startDate){
            toast.error("Ngày bắt đầu không thể sau ngày kết thúc")
            return
        }
        if(!sprintName){
            toast.error("Tên sprint không được để trống")
            return
        }
        const body = {
            projectId,
            name: sprintName,
            startDate,
            endDate
        }
        await fetchWithAuth(`${BASE_API_URL}/v1/sprint/create`, window.location, true, {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(res => {
                if(res.error) toast.error(res.message)
                else setSuccess()
            })
        
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
                onClick={onClose}
            >
                <FiX/>
            </div>
        </div>
    );
}

export default AddSprintModal;