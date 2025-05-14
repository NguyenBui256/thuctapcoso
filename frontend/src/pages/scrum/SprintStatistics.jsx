import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

const SprintStatistics = () => {
    const { projectId } = useParams();
    const [progress, setProgress] = useState({
        totalTasks: 0,
        completedTasks: 0,
        totalSprints: 0,
        averageTaskPerSprint: 0
    });

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                fetchWithAuth(`${BASE_API_URL}/v1/sprint/progress?projectId=${projectId}`)
                    .then(res => res.json())
                    .then(res => setProgress(res.data))
            } catch (error) {
                console.error('Error fetching progress:', error);
            }
        };

        fetchProgress();
    }, [projectId]);

    return (
        <div className="bg-gray-700 text-white p-4 rounded mb-6">
            <div className="flex items-center gap-4">
                <div className="w-48 h-8 bg-white overflow-hidden relative">
                    <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ 
                            width: `${progress.totalTasks > 0 ? (progress.completedTasks / progress.totalTasks * 100) : 0}%` 
                        }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-800 font-medium">
                        {progress.totalTasks > 0 ? `${Math.round((progress.completedTasks / progress.totalTasks * 100))}%` : '0%'}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-2xl">{progress.totalTasks}</span>
                        <span className="text-xs text-gray-300">total<br />tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl">{progress.completedTasks}</span>
                        <span className="text-xs text-gray-300">completed<br />tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl">{progress.totalSprints}</span>
                        <span className="text-xs text-gray-300">total<br />sprints</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl">{progress.averageTaskPerSprint.toFixed(2)}</span>
                        <span className="text-xs text-gray-300">average tasks<br />per sprint</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SprintStatistics; 