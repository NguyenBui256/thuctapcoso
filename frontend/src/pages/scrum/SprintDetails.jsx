import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../common/axios-customize';
import SprintProgressBar from '../../components/sprint/SprintProgressBar';

// Existing imports and code...

const SprintDetails = () => {
    const { projectId, sprintId } = useParams();
    const [sprint, setSprint] = useState(null);
    const [loading, setLoading] = useState(true);

    // Existing code...

    return (
        <div className="container mx-auto px-4 py-8">
            {loading ? (
                <div className="text-center">Loading sprint details...</div>
            ) : sprint ? (
                <div>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h1 className="text-2xl font-bold mb-2">{sprint.name}</h1>
                        <div className="text-gray-600 mb-4">{sprint.description}</div>

                        {/* Thêm thanh tiến độ Sprint */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Tiến độ Sprint</h3>
                            <SprintProgressBar sprintId={sprint.id} autoRefresh={true} />
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-gray-100 px-3 py-1 rounded-full">
                                <span className="font-semibold">Bắt đầu:</span> {formatDate(sprint.startDate)}
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-full">
                                <span className="font-semibold">Kết thúc:</span> {formatDate(sprint.endDate)}
                            </div>
                            <div className="bg-gray-100 px-3 py-1 rounded-full">
                                <span className="font-semibold">Trạng thái:</span> {getStatusText(sprint.status)}
                            </div>
                        </div>
                    </div>

                    {/* Rest of the component... */}
                </div>
            ) : (
                <div className="text-center">Sprint not found</div>
            )}
        </div>
    );
};

export default SprintDetails; 