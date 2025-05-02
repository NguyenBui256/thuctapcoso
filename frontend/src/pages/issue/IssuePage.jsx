import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchWithAuth } from '../../utils/AuthUtils'
import { BASE_API_URL } from "../../common/constants"
import IssueFilter from './IssueFilter'
import IssueCreateModal from './IssueCreateModal'
import { FiFilter, FiSearch } from 'react-icons/fi'
import { toast } from "react-toastify"
import IssueRow from './IssueRow'

export default function IssuePage(){
    const {projectId} = useParams()
    const [issues, setIssues] = useState([])
    const [filters, setFilters] = useState({})
    const [selectedFilters, setSelectedFilters] = useState({
        include: [],
        exclude: []
    })
    const [includeFilter, setIncludeFilter] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [search, setSearch] = useState("")
    const [showTags, setShowTags] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [sort, setSort] = useState({ by: 'position', order: 'desc' })

    const fetchIssues = () => {
        const params = getFilterParams();
        const queryString = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                queryString.append(key, value.join(','));
            } else {
                queryString.append(key, value);
            }
        });
        let keywordQuery = '';
        if (search.trim() !== '') {
            keywordQuery = `&keyword=${encodeURIComponent(search.trim())}`;
        }
        const filterQuery = queryString.toString() ? `&${queryString.toString()}` : '';
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get?projectId=${projectId}${keywordQuery}${filterQuery}&sortBy=${sort.by}&order=${sort.order}`)
            .then(res => res.json())
            .then(res => setIssues(res.data))
    }

    const fetchFilters = () => {
        const params = getFilterParams();
        const queryString = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                queryString.append(key, value.join(','));
            } else {
                queryString.append(key, value);
            }
        });

        const filterQuery = queryString.toString() ? `&${queryString.toString()}` : '';
        
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get-filters?projectId=${projectId}${filterQuery}`)
            .then(res => res.json())
            .then(res => setFilters(res.data))
    }

    const getFilterParams = () => {
        const params = {};
        
        selectedFilters.include.forEach(filter => {
            const key = filter.key;
            if (!params[key]) {
                params[key] = [];
            }
            params[key].push(filter.id);
        });

        selectedFilters.exclude.forEach(filter => {
            const excludeKey = `exclude${filter.key.charAt(0).toUpperCase()}${filter.key.slice(1)}`;
            if (!params[excludeKey]) {
                params[excludeKey] = [];
            }
            params[excludeKey].push(filter.id);
        });

        return params;
    }

    const handleCreateIssue = (data) => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/add?projectId=${projectId}`, window.location, true, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            if(res.error)
                toast.error(res.error)
            else {
                toast.success('Issue created successfully')
                fetchIssues()
            }
        })
    }

    const handleChangeStatus = (issue, newStatus) => {
        console.log('Đổi status:', issue, newStatus);
        // TODO: Gọi API cập nhật status ở đây
    };

    const handleChangeAssignee = (issue, newAssignee) => {
        console.log('Đổi assignee:', issue, newAssignee);
        // TODO: Gọi API cập nhật assignee ở đây
    };

    useEffect(() => {
        fetchIssues()
        fetchFilters()
    }, [selectedFilters])

    useEffect(() => {
        fetchIssues();
    }, [sort]);

    const sortFields = [
        { key: 'type', label: 'LOẠI' },
        { key: 'severity', label: 'MỨC ĐỘ' },
        { key: 'priority', label: 'ƯU TIÊN' },
        { key: 'position', label: 'VẤN ĐỀ' },
        { key: 'status', label: 'TRẠNG THÁI' },
        { key: 'updatedDate', label: 'CẬP NHẬT' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <div className="flex-1 p-8 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800">Vấn đề</h1>
                        <div className="flex items-center gap-3">
                            <button
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-150 text-base active:scale-95"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <span className="text-xl font-bold">+</span>
                                Thêm
                            </button>
                        </div>
                    </div>
                    {/* Thanh tìm kiếm và toggle tags */}
                    <div className="flex items-center gap-4 mb-4 max-w-7xl mx-auto">
                        <button
                            className={`flex items-center px-3 py-2 rounded border ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-blue-500'} transition`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter className="mr-2" /> {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </button>
                        <div className="relative w-80">
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full"
                                placeholder="Lọc theo tên"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') fetchIssues(); }}
                            />
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700">Tags</span>
                            <label className="inline-flex relative items-center cursor-pointer">
                                <input type="checkbox" checked={showTags} onChange={() => setShowTags(v => !v)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-400 transition"></div>
                                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-full transition"></div>
                            </label>
                        </div>
                    </div>
                    {/* Bảng và filter */}
                    <div className="flex">
                        {showFilters && (
                            <div className="w-72 border-r border-gray-200 min-h-full flex flex-col transition-all duration-300">
                                <IssueFilter
                                    filters={filters}
                                    selectedFilters={selectedFilters}
                                    onFilterChange={setSelectedFilters}
                                    includeFilter={includeFilter}
                                    onIncludeFilterChange={setIncludeFilter}
                                    showFilters={showFilters}
                                    onShowFiltersChange={setShowFilters}
                                />
                            </div>
                        )}
                        <div className={`${showFilters ? 'flex-1' : 'w-full'} `}>
                            <div className={`${showFilters ? 'max-w-7xl' : 'w-full'} mx-auto`}>
                                <div className="bg-white rounded shadow overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {sortFields.map((col, idx) => (
                                                    <th
                                                        key={col.key}
                                                        className={
                                                            idx === 3
                                                                ? 'px-4 py-3 w-[30%] font-semibold text-gray-500 cursor-pointer select-none'
                                                                : idx === 4 || idx === 5
                                                                ? 'px-2 py-3 w-32 font-semibold text-gray-500 cursor-pointer select-none'
                                                                : 'px-2 py-3 w-12 font-semibold text-gray-500 cursor-pointer select-none'
                                                        }
                                                        onClick={() => {
                                                            if (sort.by === col.key) {
                                                                setSort(s => ({ ...s, order: s.order === 'asc' ? 'desc' : 'asc' }));
                                                            } else {
                                                                setSort({ by: col.key, order: 'asc' });
                                                            }
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            {col.label}
                                                            <span className="flex flex-col text-xs ml-1">
                                                                <span className={sort.by === col.key && sort.order === 'asc' ? 'text-blue-500 font-bold' : 'text-gray-400'}>▲</span>
                                                                <span className={sort.by === col.key && sort.order === 'desc' ? 'text-blue-500 font-bold -mt-1' : 'text-gray-400 -mt-1'}>▼</span>
                                                            </span>
                                                        </span>
                                                    </th>
                                                ))}
                                                <th className="px-2 py-3 w-16 font-semibold text-gray-500">PHÂN CÔNG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {issues.map((issue, idx) => (
                                                <IssueRow
                                                    key={issue.id}
                                                    issue={issue}
                                                    index={idx}
                                                    statuses={filters.statuses || []}
                                                    assigns={filters.assigns || []}
                                                    onChangeStatus={handleChangeStatus}
                                                    onChangeAssignee={handleChangeAssignee}
                                                    showTags={showTags}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal tạo issue mới */}
            <IssueCreateModal
                open={showCreateModal}
                onCreate={handleCreateIssue}
                onClose={() => setShowCreateModal(false)}
                tags={filters.tags || []}
                statuses={filters.statuses || []}
                types={filters.types || []}
                severities={filters.severities || []}
                assigns={filters.assigns || []}
                priorities={filters.priorities || []}
            />
        </div>
    )
}