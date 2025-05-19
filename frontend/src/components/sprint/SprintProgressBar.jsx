import React, { useState, useEffect } from 'react';
import axios from '../../common/axios-customize';

/**
 * Component hiển thị thanh tiến độ của Sprint dựa trên số lượng task đã hoàn thành
 * @param {Object} props
 * @param {number} props.sprintId - ID của sprint cần hiển thị tiến độ
 * @param {Array} props.userStories - Danh sách user stories để phát hiện thay đổi
 * @returns React component
 */
const SprintProgressBar = ({ sprintId, userStories }) => {
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

            const response = await axios.get(`/api/kanban/board/sprint/${sprintId}/progress`);
            setProgress(response.data.percentage || 0);
            setTasksInfo({
                total: response.data.totalTasks || 0,
                completed: response.data.completedTasks || 0
            });
        } catch (err) {
            setError('Không thể tải dữ liệu tiến độ sprint');
        } finally {
            setLoading(false);
        }
    };

    // Fetch lại khi sprintId hoặc userStories thay đổi
    useEffect(() => {
        fetchProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sprintId, userStories]);

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
        <div className="w-full flex">
            <div className='w-full'>
                <div className="flex items-center justify-between">
                    <span className="text-teal-400 text-2xl font-bold mr-2">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-1">
                    <div
                        className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {/* <div className="flex items-center text-xs text-gray-400">
                    <div>{tasksInfo.completed}/{tasksInfo.total} tasks hoàn thành</div>
                </div> */}
            </div>

            <div className="border-l border-gray-600 h-10 mx-4"></div>

            <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">{tasksInfo.total - tasksInfo.completed}</span>
                <span className="text-sm ml-1">
                    open
                    <br />
                    tasks
                </span>
            </div>

            <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">{tasksInfo.completed}</span>
                <span className="text-sm ml-1">
                    closed
                    <br />
                    tasks
                </span>
            </div>
        </div>
    );
};

export default SprintProgressBar; 