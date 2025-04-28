import React, { useEffect, useState } from 'react';
import { FiPlus, FiFilter, FiSearch, FiList, FiChevronRight } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import AddSprintModal from './AddSprintModal';
import { useParams } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';
import SprintItem from './SprintItem';
import { toast } from 'react-toastify';
import UserStoryCard from './UserStoryCard';
const filterss = ['statuses', 'assigns', 'createdBy', 'roles']
const filterNames = ['Trạng thái', 'Phân công', 'Tạo bởi', 'Vai trò']

export default function BacklogPage() {

    const { projectId } = useParams()
    const [userStories, setUserStories] = useState([]);
    const [sprints, setSprints] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [includeFilter, setIncludeFilter] = useState(true);
    const [isAddSprintModalOpen, setIsAddSprintModalOpen] = useState(false);
    const [filters, setFilters] = useState({})
    const [selectedFilters, setSelectedFilters] = useState({
        include: [],
        exclude: []
    })
    const [keyword, setKeyword] = useState('')

    const [showDetailFilters, setShowDetailFilters] = useState({
        statuses: false,
        roles: false,
        assigns: false,
        createdBy: false
    })
    
    const changeFilters = (data) => {
        setFilters({
            statuses: data.statuses,
            assigns: data.assignedTo,
            roles: data.roles,
            createdBy: data.createdBy
        })
    }

    const handleShowDetailFilters = (filter) => {
        setShowDetailFilters(prev => ({
            ...prev,
            [filter]: !showDetailFilters[filter]
        }))
    }

    const addUserStory = () => {
        // This would typically open a modal or form to add a user story
        console.log('Add user story clicked');
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleAddSprintSuccess = () => {
        fetchSprints(false)
        setIsAddSprintModalOpen(false)
    }

    const fetchUserStories = (sprintId) => {
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
        const sprintQuery = sprintId ? `&sprintId=${sprintId}` : '';
        const keywordQuery = keyword ? `&keyword=${keyword}` : '';

        fetchWithAuth(`${BASE_API_URL}/v1/user_story/get?projectId=${projectId}${keywordQuery}${sprintQuery}${filterQuery}`)
            .then(res => res.json())
            .then(res => {
                setUserStories(res.data)
            })
    }

    const fetchSprints = (close) => {
        fetchWithAuth(`${BASE_API_URL}/v1/sprint/get?projectId=${projectId}&close=${close}`)
            .then(res => res.json())
            .then(res => {
                setSprints(res.data.reverse())
            })
    }
 
    const fetchFiltersData = () => {
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
        fetchWithAuth(`${BASE_API_URL}/v1/user_story/get-filters?projectId=${projectId}${filterQuery}`)
            .then(res => res.json())
            .then(res => {
                changeFilters(res.data)
            })
    }

    useEffect(() => {
        fetchSprints(false)
        fetchFiltersData()
        fetchUserStories(null)
    }, [])

    useEffect(() => {
        fetchFiltersData();
        fetchUserStories(null)
    }, [selectedFilters])

    const getFilterParams = () => {
        const params = {};
        
        // Xử lý các filter include
        selectedFilters.include.forEach(filter => {
            const key = filter.key;
            if (!params[key]) {
                params[key] = [];
            }
            params[key].push(filter.id);
        });

        // Xử lý các filter exclude
        selectedFilters.exclude.forEach(filter => {
            const excludeKey = `exclude${filter.key.charAt(0).toUpperCase()}${filter.key.slice(1)}`;
            if (!params[excludeKey]) {
                params[excludeKey] = [];
            }
            params[excludeKey].push(filter.id);
        });

        return params;
    }

    const handleFilterSelect = (filterType, item, filterKey) => {
        setSelectedFilters(prev => {
            const newFilters = { ...prev };
            const filterArray = newFilters[filterType];
            const filterIndex = filterArray.findIndex(f => f.key === filterKey && f.id === item.id);

            if (filterIndex === -1) {
                // Nếu chưa có trong danh sách, thêm vào
                filterArray.push({
                    key: filterKey,
                    id: item.id,
                    name: item.name || item.fullName,
                    color: item.color,
                    avatar: item.avatar
                });
            } else {
                // Nếu đã có, xóa khỏi danh sách
                filterArray.splice(filterIndex, 1);
            }

            // Log ra params dạng query string với các giá trị được gộp
            const params = getFilterParams();
            const queryString = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    queryString.append(key, value.join(','));
                } else {
                    queryString.append(key, value);
                }
            });
            console.log('API Query String:', queryString.toString());
            return newFilters;
        });
    }

    const removeFilter = (filterType, index) => {
        setSelectedFilters(prev => {
            const newFilters = { ...prev };
            newFilters[filterType].splice(index, 1);
            return newFilters;
        });
    }

    return (
        <div className="min-h-screen bg-gray-100">
        <div className="flex">
            {/* Left Content - Backlog Page */}
            <div className="w-3/4 p-6">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-blue-500">Scrum</h1>
            </div>

            {/* Sprint Statistics */}
            <div className="bg-gray-700 text-white p-4 rounded mb-6">
                <div className="flex items-center gap-4">
                <div className="w-48 h-8 bg-white rounded"></div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl text-green-400">0%</span>
                    <div className="flex items-center gap-1">
                    <span className="text-2xl">0</span>
                    <span className="text-xs text-gray-300">defined<br />points</span>
                    </div>
                    <div className="flex items-center gap-1">
                    <span className="text-2xl">0</span>
                    <span className="text-xs text-gray-300">closed<br />points</span>
                    </div>
                    <div className="flex items-center gap-1">
                    <span className="text-2xl">0</span>
                    <span className="text-xs text-gray-300">points/<br />sprint</span>
                    </div>
                </div>
                </div>
            </div>

            {/* Customize Backlog Graph */}
            <div className="bg-white p-4 rounded mb-6 flex items-center">
                <div className="flex flex-col items-center mr-4">
                <div className="flex items-end h-16 gap-1">
                    <div className="bg-blue-500 w-2 h-4"></div>
                    <div className="bg-blue-500 w-2 h-8"></div>
                    <div className="bg-blue-500 w-2 h-12"></div>
                    <div className="bg-blue-500 w-2 h-16"></div>
                </div>
                </div>
                <div>
                <h3 className="text-lg font-medium text-blue-500">CUSTOMIZE YOUR BACKLOG GRAPH</h3>
                <p className="text-gray-800">
                    To have a nice graph that helps you follow the evolution of the project you have to set up the points and sprints through the <span className="text-blue-500">Admin</span>
                </p>
                </div>
            </div>

            {/* Backlog Section with Filters Sidebar */}
            <div className="flex">
                {/* Filters Sidebar */}
                {showFilters && (
                <div className="w-64 bg-white border border-gray-200 rounded-l mr-4 flex-shrink-0">
                    {/* <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-gray-700">Custom filters (0)</h3>
                        <button className="text-blue-500 hover:text-blue-600">add</button>
                    </div>
                    </div> */}
                    
                    <div className="p-4 flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="filterType"
                                checked={includeFilter}
                                onChange={() => setIncludeFilter(true)}
                                className="mr-2 text-blue-500"
                            />
                            <span>Bao gồm</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="filterType"
                                checked={!includeFilter}
                                onChange={() => setIncludeFilter(false)}
                                className="mr-2 text-blue-500"
                            />
                            <span>Loại trừ</span>
                        </label>
                    </div>
                    
                    {/* Selected Filters Display */}
                    <div className="p-2 border-t border-gray-200">
                        {selectedFilters.include.length > 0 && (
                            <div className="mb-2">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Bao gồm:</h3>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {selectedFilters.include.map((filter, index) => (
                                        <div 
                                            key={`include-${index}`}
                                            className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                                        >
                                            {filter.avatar ? (
                                                <img 
                                                    src={filter.avatar} 
                                                    alt={filter.name}
                                                    className="w-4 h-4 rounded-full mr-1"
                                                />
                                            ) : filter.color ? (
                                                <div 
                                                    className="w-3 h-3 rounded-full mr-1" 
                                                    style={{ backgroundColor: filter.color }}
                                                />
                                            ) : null}
                                            <span className="truncate max-w-[120px]">{filter.name}</span>
                                            <button 
                                                onClick={() => removeFilter('include', index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedFilters.exclude.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Loại trừ:</h3>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {selectedFilters.exclude.map((filter, index) => (
                                        <div 
                                            key={`exclude-${index}`}
                                            className="flex items-center bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm"
                                        >
                                            {filter.avatar ? (
                                                <img 
                                                    src={filter.avatar} 
                                                    alt={filter.name}
                                                    className="w-4 h-4 rounded-full mr-1"
                                                />
                                            ) : filter.color ? (
                                                <div 
                                                    className="w-3 h-3 rounded-full mr-1" 
                                                    style={{ backgroundColor: filter.color }}
                                                />
                                            ) : null}
                                            <span className="truncate max-w-[120px]">{filter.name}</span>
                                            <button 
                                                onClick={() => removeFilter('exclude', index)}
                                                className="ml-2 text-red-600 hover:text-red-800"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-200">
                        {filterss.map((filter, idx) => (
                            <div key={filter} className="relative">
                                <div 
                                    className="p-3 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleShowDetailFilters(filter)}    
                                >
                                    <span className="text-gray-700">{filterNames[idx]}</span>
                                    <FiChevronRight 
                                        className={`text-gray-500 transform transition-transform ${showDetailFilters[filter] ? 'rotate-90' : ''}`}
                                    />
                                </div>
                                {showDetailFilters[filter] && (
                                    <div className="bg-white border-t border-gray-200">
                                        {filters[filter]?.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const filterType = includeFilter ? 'include' : 'exclude';
                                                    handleFilterSelect(filterType, item, filter);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    {(filter === 'assigns' || filter === 'createdBy') ? (
                                                        <div className="flex items-center">
                                                            {item.avatar ? (
                                                                <img 
                                                                    src={item.avatar} 
                                                                    alt={item.fullName}
                                                                    className="w-6 h-6 rounded-full mr-2"
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                                                    <span className="text-xs text-gray-600">
                                                                        {item.fullName?.charAt(0)?.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span>{item.fullName}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            {filter === 'statuses' && item.color && (
                                                                <div 
                                                                    className="w-3 h-3 rounded-full mr-2" 
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                            )}
                                                            <span>{item.name || item}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Main Backlog Content */}
                <div className="flex-1">
                {/* Backlog Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                    <h2 className="text-2xl font-bold text-gray-800 mr-2">Backlog</h2>
                    <span className="text-gray-500">0 user stories</span>
                    </div>
                    <div className="flex gap-2">
                    <button className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center">
                        <FiPlus className="mr-2" /> USER STORY
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded">
                        <FiList />
                    </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex items-center mb-4">
                    <button 
                    className={`flex items-center ${showFilters ? 'text-blue-700' : 'text-blue-500'} mr-4`}
                    onClick={toggleFilters}
                    >
                    <FiFilter className="mr-1" /> {showFilters ? 'Hide filters' : 'Filters'}
                    </button>
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="Lọc theo tên"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded w-64"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                fetchUserStories(null)
                            }
                        }}
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>

                {userStories.map(us => (
                    <UserStoryCard
                        key={us.id}
                        userStory={us}
                    />
                ))}

                {/* Empty Backlog State */}
                {/* <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-gray-500 mb-6">The backlog is empty!</p>
                    <button className="bg-green-400 hover:bg-green-500 text-white px-6 py-3 rounded flex items-center mb-10">
                    <FiPlus className="mr-2" /> ADD A USER STORY
                    </button>
                    
                    <div className="w-full h-32 bg-yellow-100 rounded-full relative overflow-hidden">
                    <div className="absolute left-1/4 bottom-2">
                        <div className="text-green-600 text-4xl">
                        <FaLeaf />
                        </div>
                    </div>
                    <div className="absolute left-1/3 bottom-2">
                        <div className="text-green-600 text-5xl">
                        <FaLeaf />
                        </div>
                    </div>
                    <div className="absolute right-1/4 bottom-2">
                        <div className="text-green-600 text-4xl">
                        <FaLeaf />
                        </div>
                    </div>
                    <div className="absolute right-1/3 bottom-2">
                        <div className="text-green-600 text-5xl">
                        <FaLeaf />
                        </div>
                    </div>
                    </div>
                </div> */}
                </div>
            </div>
            </div>

            {/* Right Content - Sprints */}
            <div className="w-1/4 p-6 border-l border-gray-200">
                <div className="flex flex-col h-full">
                    <div className='flex justify-between'>
                        <h2 className="text-2xl font-bold text-gray-800 mb-5">SPRINTS</h2>
                        <button 
                            className="text-blue-500 flex items-top"
                            onClick={() => setIsAddSprintModalOpen(true)}
                        >
                           <FiPlus className="mr-1" /> Sprint 
                        </button>
                    </div>
                    
                    
                    <div className="flex-grow flex flex-col items-center">
                        {sprints.length > 0 ? (
                            <>
                                {sprints.map(sprint => (
                                    <SprintItem
                                        key={sprint.id}
                                        sprintInp={sprint}
                                        onDelete={() => {
                                            setSprints(prev => prev.filter(sp => sp.id !== sprint.id))
                                            toast.success("Xóa sprint thành công")
                                        }}
                                    />
                                ))}
                            </>
                        ) : (
                            <div className="relative mb-4">
                                <div className="text-orange-400 text-4xl transform rotate-45">
                                    <FaLeaf />
                                </div>
                                <div className="absolute -left-6 top-6">
                                    <svg width="50" height="30" viewBox="0 0 50 30" className="text-gray-300">
                                        <path
                                        d="M1,15 Q25,30 49,15"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeDasharray="2"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 mb-4">There are no sprints yet</p>
                                <button 
                                    className="text-blue-500 flex items-center"
                                    onClick={() => setIsAddSprintModalOpen(true)}
                                >
                                    Add a sprint <FiPlus className="ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <AddSprintModal
            projectId={projectId}
            isOpen={isAddSprintModalOpen}
            onClose={() => setIsAddSprintModalOpen(false)}
            setSuccess={() => handleAddSprintSuccess()}
        />
        </div>
  );
}