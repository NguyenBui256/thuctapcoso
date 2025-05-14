import { useState, useEffect } from 'react';
import { Plus, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from "../../common/constants";
import IssueRow from './IssueRow';
import { toast } from 'react-toastify';
import AddIssueModal from './AddIssueModal';

const SORT_FIELDS = {
  issue: 'issue',
  status: 'status',
  modified: 'modified',
  assign: 'assign',
};

export default function IssueSection({ projectId, sprintId }) {
  const [issues, setIssues] = useState([]);
  const [sortField, setSortField] = useState(SORT_FIELDS.issue);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchIssues = async () => {
    const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/get-list?projectId=${projectId}&sprintId=${sprintId}&sortBy=position&order=desc`);
    const data = await res.json();
    setIssues(data.data);
  };

  const fetchFilters = async () => {
    const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/get-filters?projectId=${projectId}`);
    const data = await res.json();
    setFilters(data.data);
  };

  const handleUpdateIssue = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  const handleDeleteIssue = async (issueId) => {
    try {
      const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}`, window.location, true, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error("Lỗi khi xóa issue, vui lòng thử lại sau");
      } else {
        toast.success("Xóa issue thành công");
        setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
      }
    } catch (error) {
      toast.error("Lỗi khi xóa issue, vui lòng thử lại sau");
    }
  };

  const handleRemoveFromSprint = async (issueId) => {
    try {
      const res = await fetchWithAuth(`${BASE_API_URL}/v1/issue/detach/${issueId}?sprintId=${sprintId}`, window.location, true, {
        method: "POST"
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error("Lỗi khi tách issue khỏi sprint, vui lòng thử lại sau");
      } else {
        toast.success("Tách issue khỏi sprint thành công");
        setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));
      }
    } catch (error) {
      toast.error("Lỗi khi tách issue khỏi sprint, vui lòng thử lại sau");
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchFilters();
  }, [projectId, sprintId]);

  // Hàm sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Hàm so sánh cho sort
  const compare = (a, b) => {
    switch (sortField) {
      case SORT_FIELDS.issue:
        // Ưu tiên sort theo position (số), sau đó subject
        if (a.position !== b.position) return (a.position - b.position) * (sortOrder === 'asc' ? 1 : -1);
        return (a.subject || '').localeCompare(b.subject || '') * (sortOrder === 'asc' ? 1 : -1);
      case SORT_FIELDS.status:
        return ((a.status?.name || '').localeCompare(b.status?.name || '')) * (sortOrder === 'asc' ? 1 : -1);
      case SORT_FIELDS.modified:
        const aDate = new Date(a.updatedAt || a.dueDate || 0);
        const bDate = new Date(b.updatedAt || b.dueDate || 0);
        return (aDate - bDate) * (sortOrder === 'asc' ? 1 : -1);
      case SORT_FIELDS.assign:
        return ((a.assignee?.fullName || '').localeCompare(b.assignee?.fullName || '')) * (sortOrder === 'asc' ? 1 : -1);
      default:
        return 0;
    }
  };

  const sortedIssues = [...(issues || [])].sort(compare);

  return (
    <div className="container mx-auto px-4 py-4 mt-4 border-t border-teal-200">
      <div className="flex items-center mb-2">
        <span className="text-gray-600 font-medium">ISSUE</span>
        <div className="ml-auto flex items-center">
          <button 
            className="mr-2 hover:bg-gray-100 p-1 rounded"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* ISSUE */}
              <th className="w-1/2 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort(SORT_FIELDS.issue)}>
                Issue
                {sortField === SORT_FIELDS.issue ? (
                  sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                ) : (
                  <ChevronUp className="inline w-4 h-4 ml-1 opacity-30" />
                )}
              </th>
              {/* STATUS */}
              <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort(SORT_FIELDS.status)}>
                Status
                {sortField === SORT_FIELDS.status ? (
                  sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                ) : (
                  <ChevronUp className="inline w-4 h-4 ml-1 opacity-30" />
                )}
              </th>
              {/* MODIFIED */}
              <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort(SORT_FIELDS.modified)}>
                Modified
                {sortField === SORT_FIELDS.modified ? (
                  sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                ) : (
                  <ChevronUp className="inline w-4 h-4 ml-1 opacity-30" />
                )}
              </th>
              {/* ASSIGN */}
              <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort(SORT_FIELDS.assign)}>
                Assign
                {sortField === SORT_FIELDS.assign ? (
                  sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />
                ) : (
                  <ChevronUp className="inline w-4 h-4 ml-1 opacity-30" />
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedIssues && sortedIssues.length > 0 ? (
              sortedIssues.map(issue => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  filters={filters}
                  onUpdate={handleUpdateIssue}
                  onDelete={handleDeleteIssue}
                  onRemoveFromSprint={handleRemoveFromSprint}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-4">Không có issue nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddIssueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        sprintId={sprintId}
        onSuccess={fetchIssues}
        filters={filters}
      />
    </div>
  );
} 