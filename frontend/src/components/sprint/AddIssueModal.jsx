import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from "../../common/constants";
import { toast } from 'react-toastify';
import { Button } from 'antd';
import { Search } from 'lucide-react';
import IssueCreateModal from '../../pages/issue/IssueCreateModal';

export default function AddIssueModal({ isOpen, onClose, projectId, sprintId, onSuccess, filters = {} }) {
    const [issues, setIssues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('existing');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Hàm fetch chỉ lấy id, position, subject
    const fetchSimpleIssues = async () => {
        try {
            // Thay API endpoint phù hợp nếu cần
            const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/get-list?projectId=${projectId}&excludeSprint=true&sortBy=position&order=desc`);
            const data = await res.json();
            if (!data.error) {
                const simpleIssues = (data.data || []).map(issue => ({
                    id: issue.id,
                    position: issue.position,
                    subject: issue.subject
                }));
                setIssues(simpleIssues);
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách issues");
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'existing') {
            fetchSimpleIssues();
        }
    }, [isOpen, projectId, activeTab]);

    const handleAddToSprint = async () => {
        if (selectedIssues.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một issue");
            return;
        }

        setIsLoading(true);
        try {
            const promises = selectedIssues.map(issueId =>
                fetchWithAuth(`${BASE_API_URL}/v1/issue/attach/${issueId}?sprintId=${sprintId}`, window.location, true, {
                    method: "POST"
                })
            );

            await Promise.all(promises);
            toast.success("Thêm issues vào sprint thành công");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Lỗi khi thêm issues vào sprint");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredIssues = issues.filter(issue =>
        issue.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.position.toString().includes(searchTerm)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-80">
            <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col">
                <div className="flex border-b mb-4">
                    <button
                        className={`px-4 py-2 font-semibold border-b-2 transition-all ${activeTab === 'existing' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500'}`}
                        onClick={() => setActiveTab('existing')}
                    >
                        Existing issue
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold border-b-2 transition-all ${activeTab === 'new' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500'}`}
                        onClick={() => setActiveTab('new')}
                    >
                        New issue
                    </button>
                </div>
                {activeTab === 'existing' && (
                    <>
                        <div className="mb-2 font-medium">Which issue?</div>
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Filter issues"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg pl-10"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 overflow-y-auto mb-4">
                            {filteredIssues.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    Không tìm thấy issue nào
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredIssues.map(issue => (
                                        <div
                                            key={issue.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedIssues.includes(issue.id)
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                            onClick={() => {
                                                setSelectedIssues(prev =>
                                                    prev.includes(issue.id)
                                                        ? prev.filter(id => id !== issue.id)
                                                        : [...prev, issue.id]
                                                );
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-blue-600 font-medium">#{issue.position}</span>
                                                <span className="ml-2">{issue.subject}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                onClick={onClose}
                                className="bg-gray-100 hover:bg-gray-200"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddToSprint}
                                loading={isLoading}
                                disabled={selectedIssues.length === 0}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Thêm vào sprint
                            </Button>
                        </div>
                    </>
                )}
                {activeTab === 'new' && (
                    <div className="overflow-y-auto max-h-[70vh]">
                        <IssueCreateModal
                            onClose={() => onClose()}
                            onCreate={async (issueData) => {
                                try {
                                    const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/add?projectId=${projectId}&sprintId=${sprintId}`, window.location, true, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(issueData)
                                    });
                                    const created = await res.json();
                                    if (created.error) throw new Error(created.error);
                                    await fetchWithAuth(`${BASE_API_URL}/v1/issue/attach/${created.data.id}?sprintId=${sprintId}`, window.location, true, {
                                        method: 'POST'
                                    });
                                    toast.success('Tạo issue và thêm vào sprint thành công');
                                    onSuccess();
                                    setActiveTab('existing');
                                } catch (e) {
                                    toast.error('Lỗi khi tạo issue mới hoặc thêm vào sprint');
                                }
                            }}
                            onSuccess={() => {
                                onSuccess();
                                onClose();
                            }}
                            tags={filters.tags || []}
                            statuses={filters.statuses || []}
                            types={filters.types || []}
                            severities={filters.severities || []}
                            assigns={filters.assigns || []}
                            priorities={filters.priorities || []}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 