import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

const filterTypes = ['statuses', 'assigns', 'createdBy', 'roles', 'tags', 'types', 'severities', 'priorities'];
const filterNames = ['Trạng thái', 'Phân công', 'Tạo bởi', 'Vai trò', 'Tags', 'Loại', 'Mức độ nghiêm trọng', 'Độ ưu tiên'];

export default function IssueFilter({ 
    filters, 
    selectedFilters, 
    onFilterChange,
    includeFilter,
    onIncludeFilterChange,
    showFilters,
    onShowFiltersChange 
}) {
    const [showDetailFilters, setShowDetailFilters] = useState({
        statuses: false,
        roles: false,
        assigns: false,
        createdBy: false,
        tags: false,
        types: false,
        severities: false,
        priorities: false
    });

    const handleShowDetailFilters = (filter) => {
        setShowDetailFilters(prev => ({
            ...prev,
            [filter]: !showDetailFilters[filter]
        }));
    };

    const handleFilterSelect = (filterType, item, filterKey) => {
        onFilterChange(prev => {
            const newFilters = { ...prev };
            const filterArray = newFilters[filterType];
            const filterIndex = filterArray.findIndex(f => f.key === filterKey && f.id === item.id);

            if (filterIndex === -1) {
                filterArray.push({
                    key: filterKey,
                    id: item.id,
                    name: item.name || item.fullName,
                    color: item.color,
                    avatar: item.avatar
                });
            } else {
                filterArray.splice(filterIndex, 1);
            }

            return newFilters;
        });
    };

    const removeFilter = (filterType, index) => {
        onFilterChange(prev => {
            const newFilters = { ...prev };
            newFilters[filterType].splice(index, 1);
            return newFilters;
        });
    };

    if (!showFilters) return null;

    return (
        <div className="w-64 bg-white border border-gray-200 rounded-l mr-4 flex-shrink-0">
            <div className="p-4 flex space-x-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="filterType"
                        checked={includeFilter}
                        onChange={() => onIncludeFilterChange(true)}
                        className="mr-2 text-blue-500"
                    />
                    <span>Bao gồm</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="filterType"
                        checked={!includeFilter}
                        onChange={() => onIncludeFilterChange(false)}
                        className="mr-2 text-blue-500"
                    />
                    <span>Loại trừ</span>
                </label>
            </div>

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
                {filterTypes.map((filter, idx) => (
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
                                                    {(filter === 'statuses' || filter === 'tags' || filter === 'types' || 
                                                      filter === 'severities' || filter === 'priorities') && item.color && (
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
    );
}