import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../utils/AuthUtils'
import { BASE_API_URL } from '../../common/constants';

function UpdateSprintModal({ projectId, sprint, setSprint, isOpen, onClose, onDelete }) {

    if (!isOpen) return null;

    const [tmpSprint, setTmpSprint] = useState(sprint);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    // Sync tmpSprint with sprint prop when it changes
    useEffect(() => {
        if (isOpen && sprint) {
            setTmpSprint({ ...sprint });
        }
    }, [isOpen, sprint]);

    const handleChangeSprint = (attr, value) => {
        setTmpSprint(prev => ({
            ...prev,
            [attr]: value
        }))
    }

    const handleDelete = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/sprint/delete/${sprint.id}?projectId=${projectId}`, window.location, true, {
            method: "POST"
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) toast.error(res.message)
                else {
                    toast.success("Sprint deleted successfully");
                    onDelete();
                    onClose();
                }
            })
            .catch(error => {
                toast.error("Failed to delete sprint");
                console.error(error);
            });
    }

    const handleSave = async () => {
        const { name, startDate, endDate } = tmpSprint;
        if (endDate < startDate) {
            toast.error("Ngày bắt đầu không thể sau ngày kết thúc")
            return
        }
        if (!name) {
            toast.error("Tên sprint không được để trống")
            return
        }
        const body = {
            projectId,
            name,
            startDate,
            endDate
        }
        await fetchWithAuth(`${BASE_API_URL}/v1/sprint/update/${sprint.id}`, window.location, true, {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    toast.error(res.message);
                } else {
                    setSprint(res.data);
                    toast.success("Sprint updated successfully");
                    onClose();
                }
            })
            .catch(error => {
                toast.error("Failed to update sprint");
                console.error(error);
            });
    };

    const handleCloseModal = () => {
        setOpenDeleteConfirm(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            {/* New Sprint Form */}
            <div className="flex justify-center items-center">
                <div className="w-full max-w-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Cập nhật sprint</h2>

                    {/* Sprint Name Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Sprint name"
                            value={tmpSprint.name}
                            onChange={(e) => handleChangeSprint('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Date Range Inputs */}
                    <div className="flex gap-4 mb-6">
                        <input
                            type="date"
                            value={tmpSprint.startDate}
                            onChange={(e) => {
                                handleChangeSprint('startDate', e.target.value)
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="date"
                            value={tmpSprint.endDate}
                            onChange={(e) => handleChangeSprint('endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Save Button */}
                    <div className='flex justify-evenly'>
                        <div className="flex">
                            <button
                                onClick={handleSave}
                                className="bg-green-400 hover:bg-green-500 text-white font-medium py-3 px-8 rounded"
                            >
                                LƯU
                            </button>
                        </div>

                        <button
                            className='hover:text-green-600'
                            onClick={() => setOpenDeleteConfirm(true)}
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            <div
                className='absolute top-10 right-10 text-4xl cursor-pointer'
                onClick={handleCloseModal}
            >
                <FiX />
            </div>

            {openDeleteConfirm && (
                <div className='fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center'>
                    <p className='text-3xl mb-4'>Xóa sprint</p>
                    <p className='text-2xl mb-4'>Bạn muốn xác nhận xóa sprint này?</p>
                    <p className='text-xl mb-5'>{sprint.name}</p>
                    <div className='flex gap-20'>
                        <button
                            className='hover:text-green-500'
                            onClick={() => setOpenDeleteConfirm(false)}
                        >
                            Hủy
                        </button>

                        <button
                            className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-4 rounded"
                            onClick={handleDelete}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UpdateSprintModal;