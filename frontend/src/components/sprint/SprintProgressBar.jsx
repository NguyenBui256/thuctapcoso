import React, { useState, useEffect } from 'react';
import axios from '../../common/axios-customize';
import { RefreshCw } from 'lucide-react';

/**
 * Component hiển thị thanh tiến độ của Sprint dựa trên số lượng task đã hoàn thành
 * @param {Object} props
 * @param {number} props.sprintId - ID của sprint cần hiển thị tiến độ
 * @param {boolean} props.autoRefresh - Tự động làm mới sau mỗi 30 giây
 * @returns React component
 */
const SprintProgressBar = ({ sprintId, autoRefresh = false }) => {
    const [progress, setProgress] = useState(0);
    const [tasksInfo, setTasksInfo] = useState({ total: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch progress data
    const fetchProgress = async () => {
        if (!sprintId) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching sprint progress for sprintId:', sprintId);
            const response = await axios.get(`/api/kanban/board/sprint/${sprintId}/progress`);
            console.log('Sprint progress data:', response.data);

            setProgress(response.data.percentage || 0);
            setTasksInfo({
                total: response.data.totalTasks || 0,
                completed: response.data.completedTasks || 0
            });
        } catch (err) {
            console.error('Error fetching sprint progress:', err);
            setError('Không thể tải dữ liệu tiến độ sprint');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and auto-refresh setup
    useEffect(() => {
        console.log('Setting up progress bar with sprintId:', sprintId);
        fetchProgress();

        // Set up frequent polling for better reactivity
        const pollInterval = setInterval(() => {
            console.log('Polling sprint progress');
            fetchProgress();
        }, 3000); // Poll every 3 seconds

        return () => {
            clearInterval(pollInterval);
        };
    }, [sprintId]); // Only depend on sprintId

    // Handle manual refresh button click
    const handleRefreshClick = () => {
        console.log('Manual refresh clicked');
        fetchProgress();
    };

    if (loading && tasksInfo.total === 0) {
        return (
            <div className="flex justify-center py-2">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-teal-500 border-r-transparent"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    if (tasksInfo.total === 0) {
        return <div className="text-gray-500 text-sm text-center">Không có task nào</div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <span className="text-teal-400 text-2xl font-bold mr-2">{progress}%</span>
                <button
                    onClick={handleRefreshClick}
                    className="text-gray-400 hover:text-teal-500 p-1"
                    title="Làm mới"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-1">
                <div
                    className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex items-center text-xs text-gray-400">
                <div>{tasksInfo.completed}/{tasksInfo.total} tasks hoàn thành</div>
            </div>
        </div>
    );
};

export default SprintProgressBar; 