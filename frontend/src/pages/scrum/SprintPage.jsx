import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, resetServerContext } from "react-beautiful-dnd"
import {
  Search,
  Filter,
  ChevronDown,
  ArrowLeftRight,
  Pill,
  ChevronUp,
  MoreVertical,
  Plus,
  ChevronRight,
} from "lucide-react"
import {fetchWithAuth} from '../../utils/AuthUtils'
import { BASE_API_URL } from "../../common/constants"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"

const filterss = ['statuses', 'assigns', 'createdBy', 'roles']
const filterNames = ['Trạng thái', 'Phân công', 'Tạo bởi', 'Vai trò']

export default function SprintPage() {
    const {projectId, sprintId} = useParams()
  // Danh sách trạng thái
  const [statuses, setStatuses] = useState([])

  // Danh sách User Stories
  const [userStories, setUserStories] = useState([])

  // Danh sách tasks theo User Story và trạng thái
  const [tasks, setTasks] = useState({})

  // State cho việc loading
  const [loading, setLoading] = useState(true)

  // State cho việc hiển thị bảng điều khiển bộ lọc
  const [showFilters, setShowFilters] = useState(false)

  // State cho việc chọn loại bộ lọc (Include/Exclude)
  const [filterType, setFilterType] = useState("include")

  const [includeFilter, setIncludeFilter] = useState(true)
  const [filters, setFilters] = useState({})
  const [selectedFilters, setSelectedFilters] = useState({
    include: [],
    exclude: []
  })
  const [showDetailFilters, setShowDetailFilters] = useState({
    statuses: false,
    roles: false,
    assigns: false,
    createdBy: false
  })

  const [keyword, setKeyword] = useState('')

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

  const fetchTaskStatuses = async () => {
    const res = await fetchWithAuth(`${BASE_API_URL}/v1/projects/get-task-statuses?projectId=${projectId}`);
    const data = await res.json();
    if (data.error) {
      toast.error("Có lỗi xảy ra");
      return null;
    } else {
      return data.data; // return data chứ không set luôn
    }
  };
  
  const fetchFilters = async () => {
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

    try {
      const res = await fetchWithAuth(`${BASE_API_URL}/v1/task/get-filters?projectId=${projectId}&sprintId=${sprintId}${filterQuery}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.message);
        return;
      }
      changeFilters(data.data);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lấy dữ liệu bộ lọc");
    }
  };

  const fetchUserStories = (statuses) => {
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
    const keywordQuery = keyword ? `&keyword=${keyword}` : '';

    fetchWithAuth(`${BASE_API_URL}/v1/user_story/get?projectId=${projectId}&sprintId=${sprintId}${keywordQuery}${filterQuery}`)
      .then(res => res.json())
      .then(res => {
        setTasks(prev => {
          const newTasks = {};
  
          res.data.forEach(userStory => {
            newTasks[userStory.id] = {}; // phải init trước
            statuses.forEach(stat => newTasks[userStory.id][stat.id] = []);
            userStory.tasks.forEach(task => {
              const statusId = task.status.id;
              newTasks[userStory.id][statusId].push(task);
            });
          });
  
          return newTasks;
        });
        // Thêm property isExpanded vào mỗi userStory
        const userStoriesWithExpanded = res.data.map(story => ({
          ...story,
          isExpanded: true // Mặc định là mở
        }));
        setUserStories(userStoriesWithExpanded);
      })
  };

  const fetchTasks = () => {
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
    const keywordQuery = keyword ? `&keyword=${keyword}` : '';

    fetchWithAuth(`${BASE_API_URL}/v1/task/get_by_sprint?projectId=${projectId}&sprintId=${sprintId}${keywordQuery}${filterQuery}`)
      .then(res => res.json())
      .then(res => {
        setTasks(prev => {
          const newTasks = {};
          
          // Khởi tạo tất cả userStory với tất cả status là mảng rỗng
          userStories.forEach(story => {
            newTasks[story.id] = {};
            statuses.forEach(stat => {
              newTasks[story.id][stat.id] = [];
            });
          });

          // Thêm task vào đúng vị trí
          res.data.forEach(task => {
            const userStoryId = task.userStoryId;
            const statusId = task.status.id;
            if (newTasks[userStoryId] && newTasks[userStoryId][statusId]) {
              newTasks[userStoryId][statusId].push(task);
            }
          });

          console.log(newTasks)
          return newTasks;
        });
      })
  }
  
  // Fetch danh sách trạng thái khi component được mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const statusesData = await fetchTaskStatuses(); // lấy danh sách status
        if (statusesData) {
          setStatuses(statusesData); // update state
          fetchUserStories(statusesData); // truyền vào
        }
      } catch (error) {
        console.error("Error loading statuses:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData(); 
  }, []);

  // Gọi fetchTasks sau khi userStories đã được cập nhật
  useEffect(() => {
    if (userStories.length > 0) {
      fetchTasks();
      fetchFilters();
    }
  }, [userStories, selectedFilters, keyword]);
  
  const toggleStoryExpand = (storyId) => {
    setUserStories(
      userStories.map((story) => {
        if (story.id === storyId) {
          return { ...story, isExpanded: !story.isExpanded }
        }
        return story
      }),
    )
  }

  const onDragEnd = (result) => {
    const { source, destination } = result

    // Nếu không có điểm đến, không làm gì cả
    if (!destination) {
      return
    }

    // Phân tích ID để lấy thông tin về storyId và status
    const [sourceStoryId, sourceStatus] = source.droppableId.split(":")
    const [destStoryId, destStatus] = destination.droppableId.split(":")

    // Nếu vị trí nguồn và đích giống nhau, không làm gì cả
    if (sourceStoryId === destStoryId && sourceStatus === destStatus && source.index === destination.index) {
      return
    }

    // Tạo bản sao của state tasks
    const tasksCopy = JSON.parse(JSON.stringify(tasks))

    console.log(tasksCopy)

    // Lấy task từ nguồn
    const sourceColumn = tasksCopy[sourceStoryId][sourceStatus]
    const [movedTask] = sourceColumn.splice(source.index, 1)

    fetchWithAuth(`${BASE_API_URL}/v1/task/update_status/${movedTask.id}?userStoryId=${destStoryId}&statusId=${destStatus}`, window.location, true, {
      method: "POST"
    })
      .then(res => res.json())
      .then(res => {
        if(res.error) toast.error(res.message)
        else fetchUserStories(statuses)
      })
  }

  // Tính tổng số task đang mở
  const countOpenTasks = () => {
    if (!tasks || Object.keys(tasks).length === 0) return 0

    let count = 0
    Object.keys(tasks).forEach((storyId) => {
      Object.keys(tasks[storyId]).forEach((statusId) => {
        if (statusId !== "closed") {
          count += tasks[storyId][statusId].length
        }
      })
    })
    return count
  }

  // Tính tổng số task đã đóng
  const countClosedTasks = () => {
    if (!tasks || Object.keys(tasks).length === 0) return 0

    let count = 0
    Object.keys(tasks).forEach((storyId) => {
      if (tasks[storyId]["closed"]) {
        count += tasks[storyId]["closed"].length
      }
    })
    return count
  }

  // Toggle hiển thị bảng điều khiển bộ lọc
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

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

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-teal-500">ggg</h1>
              <span className="ml-4 text-gray-600">17 May 2025 to 17 May 2025</span>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-gray-800 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center flex-wrap">
              <div className="flex items-center mr-6">
                <input type="text" className="bg-white text-black h-8 px-2 w-56" />
                <div className="flex items-center ml-2">
                  <span className="text-teal-400 text-2xl font-bold">0%</span>
                  <ChevronDown className="h-5 w-5 ml-1" />
                </div>
              </div>

              <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm ml-1">
                  total
                  <br />
                  points
                </span>
              </div>

              <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm ml-1">
                  completed
                  <br />
                  points
                </span>
              </div>

              <div className="border-l border-gray-600 h-10 mx-4"></div>

              <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">{countOpenTasks()}</span>
                <span className="text-sm ml-1">
                  open
                  <br />
                  tasks
                </span>
              </div>

              <div className="flex items-center mr-6">
                <span className="text-2xl font-bold">{countClosedTasks()}</span>
                <span className="text-sm ml-1">
                  closed
                  <br />
                  tasks
                </span>
              </div>

              <div className="mx-4">
                <ArrowLeftRight className="h-6 w-6" />
              </div>

              <div className="flex items-center">
                <Pill className="h-6 w-6 mr-2" />
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm ml-1">
                  iocaine
                  <br />
                  doses
                </span>
              </div>

              <div className="ml-auto">
                <div className="flex items-center space-x-1">
                  <div className="h-4 w-1 bg-gray-400"></div>
                  <div className="h-4 w-1 bg-gray-400"></div>
                  <div className="h-4 w-1 bg-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  className={`flex items-center ${showFilters ? "bg-gray-200" : ""} px-3 py-1.5 rounded mr-4`}
                  onClick={toggleFilters}
                >
                  <Filter className="h-5 w-5 mr-1 text-teal-500" />
                  <span className="text-teal-500">{showFilters ? "Hide filters" : "Filters"}</span>
                </button>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="subject or reference"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchTasks();
                        fetchFilters();
                      }
                    }}
                    className="border border-gray-300 rounded pl-8 pr-2 py-1 w-64"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center">
                <span className="mr-2 text-gray-600">ZOOM:</span>
                <div className="flex items-center space-x-1">
                  <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                  <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                  <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs">Detailed</div>
                  <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Filter Panel */}
          {showFilters && (
            <div className="w-1/4 bg-gray-100 border-r border-gray-200">
              <div className="p-4">
                <div className="bg-white border border-gray-200 rounded shadow-sm">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-medium text-gray-700">Custom filters (0)</span>
                    <button className="text-teal-500 text-sm">add</button>
                  </div>

                  <div className="p-3 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filterType"
                        value="include"
                        checked={includeFilter}
                        onChange={() => setIncludeFilter(true)}
                        className="mr-2 accent-teal-500"
                      />
                      <span>Include</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filterType"
                        value="exclude"
                        checked={!includeFilter}
                        onChange={() => setIncludeFilter(false)}
                        className="mr-2"
                      />
                      <span>Exclude</span>
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
                          <ChevronRight 
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
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className={`${showFilters ? 'w-3/4' : 'w-full'} container mx-auto px-4 pb-6`}>
            {/* Column Headers */}
            <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${statuses.length}, 1fr)` }}>
              <div className="bg-gray-100 px-4 py-2 rounded-t font-bold text-gray-700">USER STORY</div>
              {statuses.map((status) => (
                <div
                  key={status.id}
                  style={{ borderColor: status.color }}
                  className={`px-4 py-2 border-b-2 font-bold text-gray-700 mr-2`}
                >
                  {status.name}
                </div>
              ))}
            </div>

            {/* Kanban Board */}
            {userStories.map((story) => (
              <div key={story.id} className="mb-4">
                <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${statuses.length}, 1fr)` }}>
                  {/* User Story Column */}
                  <div className="bg-white rounded shadow p-2">
                    <div className="flex items-center">
                      <button className="mr-2" onClick={() => toggleStoryExpand(story.id)}>
                        {story.isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`${story.number ? "ml-2" : ""} text-gray-700`}>{story.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button className="mr-1">
                          <Plus className="h-4 w-4 text-gray-500" />
                        </button>
                        <button>
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Columns */}
                  {statuses.map((status) => (
                    <StatusColumn
                      key={`${story.id}-${status.id}`}
                      storyId={story.id}
                      status={status.id}
                      color={status.color}
                      tasks={tasks[story.id]?.[status.id] || []}
                      isExpanded={story.isExpanded}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="container mx-auto px-4 py-4 mt-4 border-t border-teal-200">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-gray-600 font-medium">SPRINT ISSUES</span>

            <div className="ml-6 flex items-center">
              <div className="w-10 h-5 bg-teal-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full"></div>
              </div>
              <span className="ml-2 text-gray-600">Tags</span>
            </div>

            <div className="ml-auto flex items-center">
              <button className="mr-2">
                <Plus className="h-5 w-5 text-gray-500" />
              </button>
              <button>
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}

// Component cho các tùy chọn bộ lọc
function FilterOption({ label }) {
  return (
    <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
      <span className="text-gray-600">{label}</span>
      <ChevronRight className="h-4 w-4 text-teal-500" />
    </div>
  )
}

function StatusColumn({ storyId, status, color, tasks, isExpanded }) {
  const droppableId = `${storyId}:${status}`

  return (
    <div className="bg-white rounded shadow p-2 min-h-[60px]">
      <Droppable 
        ignoreContainerClipping={false}
        isDropDisabled={false} 
        droppableId={droppableId}
        isCombineEnabled={false}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[50px] ${snapshot.isDraggingOver ? "bg-gray-50 rounded" : ""}`}
          >
            {tasks && tasks.map((task, index) => (
              task.status.id === status && <Task key={task.id} task={task} index={index} isExpanded={isExpanded} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function Task({ task, index, isExpanded }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${isExpanded ? "p-3" : "p-1"} mb-2 bg-white border border-gray-200 rounded shadow-sm ${
            snapshot.isDragging ? "opacity-75 shadow-md" : ""
          }`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {isExpanded ? (
            // Hiển thị đầy đủ thông tin khi mở rộng
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 mr-2">
                    {task.assigned ? (
                      <img 
                        src={task.assigned.avatar || "https://ui-avatars.com/api/?name=?"} 
                        alt={task.assigned.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <img 
                        src="https://ui-avatars.com/api/?name=?" 
                        alt="Unassigned"
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-gray-700">{task.name}</span>
                </div>

                <button>
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {task.status === "N/E" && (
                <div className="mt-1 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 inline-block rounded">N/E</div>
              )}
            </>
          ) : (
            // Chỉ hiển thị avatar khi thu gọn
            <div className="flex justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                {task.assigned ? (
                  <img 
                    src={task.assigned.avatar || "https://ui-avatars.com/api/?name=?"} 
                    alt={task.assigned.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <img 
                    src="https://ui-avatars.com/api/?name=?" 
                    alt="Unassigned"
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
