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
import { fetchWithAuth } from '../../utils/AuthUtils'
import { BASE_API_URL } from "../../common/constants"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import CreateTaskModal from "../../components/kanban/CreateTaskModal"

const filterss = ['statuses', 'assigns', 'createdBy', 'roles']
const filterNames = ['Trạng thái', 'Phân công', 'Tạo bởi', 'Vai trò']

export default function SprintPage() {
  const { projectId, sprintId } = useParams()
  const navigate = useNavigate()
  // Danh sách trạng thái
  const [statuses, setStatuses] = useState([
    { id: 1, name: 'NEW', color: 'bg-blue-400' },
    { id: 2, name: 'READY', color: 'bg-red-500' },
    { id: 3, name: 'IN PROGRESS', color: 'bg-orange-400' },
    { id: 4, name: 'READY FOR TEST', color: 'bg-yellow-400' },
    { id: 5, name: 'DONE', color: 'bg-green-500' },
    { id: 6, name: 'ARCHIVED', color: 'bg-gray-400' }
  ])

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

  // Thêm state để theo dõi task đang được kéo
  const [draggingItemId, setDraggingItemId] = useState(null)

  // Add state for task creation modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedUserStory, setSelectedUserStory] = useState(null);

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
    return statuses;
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

  // Lấy tasks cho mỗi user story riêng lẻ
  const fetchTasksForUserStory = async (userStoryId) => {
    try {
      console.log('Fetching tasks for userStory ID:', userStoryId);
      const response = await fetchWithAuth(`${BASE_API_URL}/tasks/userstory/${userStoryId}`);
      const data = await response.json();
      console.log('Tasks data for userStory', userStoryId, ':', data);

      if (data.statusCode === 200 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tasks for userStory', userStoryId, ':', error);
      toast.error(`Lỗi khi tải tasks cho user story #${userStoryId}`);
      return []; // Trả về mảng rỗng khi có lỗi
    }
  };

  // Thêm hàm helper để ánh xạ statusId từ API response
  const mapStatusIdToLocal = (statusId, statusName) => {
    // If statusId is between 1-6, use it directly
    if (statusId && statusId >= 1 && statusId <= 6) {
      return statusId;
    }

    // Otherwise, try to match by name
    if (statusName) {
      const matchedStatus = statuses.find(s =>
        s.name.toLowerCase() === statusName.toLowerCase() ||
        s.name.toLowerCase().includes(statusName.toLowerCase()) ||
        statusName.toLowerCase().includes(s.name.toLowerCase())
      );

      if (matchedStatus) {
        console.log(`Đã ánh xạ statusName "${statusName}" sang ID=${matchedStatus.id}`);
        return matchedStatus.id;
      }
    }

    // Default to first status (NEW) if no match
    return 1;
  };

  const fetchUserStories = async (statuses) => {
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

    try {
      const res = await fetchWithAuth(`${BASE_API_URL}/v1/user_story/get?projectId=${projectId}&sprintId=${sprintId}${keywordQuery}${filterQuery}`);
      const data = await res.json();
      console.log("User stories data:", data.data);

      // Thêm property isExpanded vào mỗi userStory
      const userStoriesWithExpanded = data.data.map(story => ({
        ...story,
        isExpanded: true // Mặc định là mở
      }));

      setUserStories(userStoriesWithExpanded);

      // Tạo đối tượng mới để lưu tasks
      const newTasks = {};

      // Lấy tasks cho từng user story
      for (const story of data.data) {
        newTasks[story.id] = {};
        statuses.forEach(stat => newTasks[story.id][stat.id] = []);

        const storyTasks = await fetchTasksForUserStory(story.id);

        // Phân loại tasks theo status
        if (storyTasks && Array.isArray(storyTasks)) {
          console.log(`Phân loại ${storyTasks.length} tasks cho story #${story.id}`);
          storyTasks.forEach(task => {
            // Lấy statusId từ task và map về ID trong danh sách statuses
            const apiStatusId = task.statusId;
            const statusName = task.statusName || task.status;

            // Ánh xạ statusId từ API về ID trong danh sách statuses
            const mappedStatusId = mapStatusIdToLocal(apiStatusId, statusName);

            if (!mappedStatusId) {
              console.warn("Không thể ánh xạ status cho task:", task);
              return;
            }

            console.log(`Task #${task.id} có statusId=${apiStatusId}, statusName=${statusName}, mappedStatusId=${mappedStatusId}`);

            if (!newTasks[story.id][mappedStatusId]) {
              console.log(`Tạo mảng mới cho mappedStatusId=${mappedStatusId} của story #${story.id}`);
              newTasks[story.id][mappedStatusId] = [];
            }

            console.log(`Thêm task #${task.id} vào cột status=${mappedStatusId} của story #${story.id}`);
            newTasks[story.id][mappedStatusId].push(task);
          });
        }
      }

      console.log("Organized tasks for all stories:", newTasks);
      setTasks(newTasks);

    } catch (error) {
      console.error("Error fetching user stories:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu user stories");
    }
  };

  // Fetch danh sách trạng thái khi component được mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use hardcoded statuses directly
        fetchUserStories(statuses);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cập nhật useEffect để không gọi fetchTasks nữa
  useEffect(() => {
    if (userStories.length > 0 && statuses.length > 0) {
      // fetchTasks(); // Không cần gọi nữa
      fetchFilters();
    }
  }, [userStories, selectedFilters, keyword]);

  // Thêm hàm log debug trước hàm onDragEnd
  const logStatusInfo = () => {
    console.log("Danh sách statuses trong hệ thống:", statuses);
  };

  useEffect(() => {
    if (statuses.length > 0) {
      logStatusInfo();
    }
  }, [statuses]);

  // Thêm hàm onDragStart
  const onDragStart = (start) => {
    const id = start.draggableId;
    setDraggingItemId(id);
    document.body.classList.add('is-dragging');
  };

  const onDragEnd = (result) => {
    // Đặt lại state khi kết thúc kéo
    setDraggingItemId(null);
    document.body.classList.remove('is-dragging');

    const { source, destination } = result;

    // Nếu không có điểm đến, không làm gì cả
    if (!destination) {
      return;
    }

    // Phân tích ID để lấy thông tin về storyId và status
    const [sourceStoryId, sourceStatusId] = source.droppableId.split(":");
    const [destStoryId, destStatusId] = destination.droppableId.split(":");

    console.log("DEBUG - Kéo từ column:", sourceStatusId, "đến column:", destStatusId);

    // Lấy đối tượng status từ ID của column
    const targetStatus = statuses.find(s => s.id.toString() === destStatusId);

    if (!targetStatus) {
      console.error("Không tìm thấy status với ID:", destStatusId);
      toast.error("Lỗi: Không tìm thấy trạng thái đích");
      return;
    }

    console.log("Target status:", targetStatus);

    // Nếu vị trí nguồn và đích giống nhau, không làm gì cả
    if (sourceStoryId === destStoryId && sourceStatusId === destStatusId && source.index === destination.index) {
      return;
    }

    try {
      // Tạo bản sao của state tasks
      const tasksCopy = JSON.parse(JSON.stringify(tasks));

      // Lấy task từ nguồn
      const sourceColumn = tasksCopy[sourceStoryId][sourceStatusId];
      const [movedTask] = sourceColumn.splice(source.index, 1);

      // Lưu giữ thông tin task gốc để rollback nếu cần
      const originalTask = { ...movedTask };

      // Cập nhật UI trước khi gọi API (optimistic update)
      if (!tasksCopy[destStoryId]) {
        tasksCopy[destStoryId] = {};
      }

      if (!tasksCopy[destStoryId][destStatusId]) {
        tasksCopy[destStoryId][destStatusId] = [];
      }

      // Cập nhật status của task trước khi thêm vào cột đích
      movedTask.statusId = targetStatus.id;
      movedTask.status = targetStatus.name;

      // Thêm task vào vị trí mới
      tasksCopy[destStoryId][destStatusId].splice(destination.index, 0, movedTask);
      setTasks(tasksCopy);

      // Gọi API để cập nhật vị trí mới của task
      console.log(`Gửi request update task #${movedTask.id} đến status ID: ${targetStatus.id}`);

      fetchWithAuth(`${BASE_API_URL}/v1/task/update_status/${movedTask.id}?userStoryId=${destStoryId}&statusId=${targetStatus.id}`, window.location, true, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          statusId: targetStatus.id,
          userStoryId: parseInt(destStoryId),
          order: destination.index
        })
      })
        .then(res => res.json())
        .then(res => {
          console.log("API response:", res);
          if (res.error) {
            toast.error(res.message);
            // Nếu có lỗi, rollback lại UI
            const rollbackTasks = JSON.parse(JSON.stringify(tasks));
            rollbackTasks[sourceStoryId][sourceStatusId].splice(source.index, 0, originalTask);
            if (rollbackTasks[destStoryId] && rollbackTasks[destStoryId][destStatusId]) {
              const targetIdx = rollbackTasks[destStoryId][destStatusId].findIndex(t => t.id === movedTask.id);
              if (targetIdx >= 0) {
                rollbackTasks[destStoryId][destStatusId].splice(targetIdx, 1);
              }
            }
            setTasks(rollbackTasks);
          } else {
            toast.success("Cập nhật trạng thái task thành công");
            // Nếu thành công, chỉ refresh để đảm bảo dữ liệu đồng bộ
            fetchUserStories(statuses);
          }
        })
        .catch(error => {
          console.error("Lỗi khi cập nhật task:", error);
          toast.error("Có lỗi xảy ra khi cập nhật task");
          // Nếu có lỗi, rollback lại UI
          const rollbackTasks = JSON.parse(JSON.stringify(tasks));
          rollbackTasks[sourceStoryId][sourceStatusId].splice(source.index, 0, originalTask);
          if (rollbackTasks[destStoryId] && rollbackTasks[destStoryId][destStatusId]) {
            const targetIdx = rollbackTasks[destStoryId][destStatusId].findIndex(t => t.id === movedTask.id);
            if (targetIdx >= 0) {
              rollbackTasks[destStoryId][destStatusId].splice(targetIdx, 1);
            }
          }
          setTasks(rollbackTasks);
        });
    } catch (error) {
      console.error("Lỗi khi xử lý kéo thả:", error);
      toast.error("Có lỗi xảy ra khi di chuyển task");
    }
  };

  // Thêm CSS cho hiệu ứng kéo thả
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .task-card-dragging {
        opacity: 0.9 !important;
        transform: rotate(1deg);
        box-shadow: 0 5px 10px rgba(0,0,0,0.2) !important;
      }
      .column-drop-target-active {
        background-color: rgba(59, 130, 246, 0.1) !important;
        transition: background-color 0.2s ease;
      }
      .react-beautiful-dnd-placeholder {
        background-color: rgba(203, 213, 225, 0.4) !important;
        border: 2px dashed #64748b !important;
        margin-bottom: 8px !important;
        border-radius: 0.25rem !important;
      }
      .is-dragging * {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    }
  }, []);

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
      assigns: data.assigns,
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

  const toggleStoryExpand = (storyId) => {
    setUserStories(
      userStories.map((story) => {
        if (story.id === storyId) {
          return { ...story, isExpanded: !story.isExpanded }
        }
        return story
      })
    )
  }

  // Hàm xử lý khi click vào user story
  const handleUserStoryClick = (storyId, event) => {
    // Chỉ xử lý khi click không phải vào nút toggle
    if (!event.target.closest('button.toggle-button')) {
      navigate(`/projects/${projectId}/userstory/${storyId}`);
    }
  };

  // Hàm xử lý khi click vào task
  const handleTaskClick = (taskId, event) => {
    // Ngăn việc kích hoạt sự kiện kéo thả
    event.stopPropagation();
    navigate(`/projects/${projectId}/task/${taskId}`);
  };

  // Add function to handle task creation
  const handleCreateTask = (userStoryId) => {
    setSelectedUserStory(userStoryId);
    setShowCreateTaskModal(true);
  };

  const handleTaskCreated = async (newTask) => {
    // Refresh tasks for the user story that got a new task
    if (newTask && newTask.userStoryId) {
      // Refresh the board to show the new task
      toast.success(`Task #${newTask.id} created successfully`);
      fetchUserStories(statuses);
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
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
                        // Tải lại danh sách user stories khi tìm kiếm
                        const loadData = async () => {
                          try {
                            fetchUserStories(statuses);
                            fetchFilters();
                          } catch (error) {
                            console.error("Error reloading data:", error);
                          }
                        };
                        loadData();
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
                  <div
                    className="bg-white rounded shadow p-2 cursor-pointer hover:bg-gray-50"
                    onClick={(e) => handleUserStoryClick(story.id, e)}
                  >
                    <div className="flex items-center">
                      <button
                        className="mr-2 toggle-button"
                        onClick={() => toggleStoryExpand(story.id)}
                      >
                        {story.isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-teal-500 font-semibold">#{story.number}</span>
                          <span className={`${story.number ? "ml-2" : ""} text-gray-700`}>{story.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button
                          className="mr-1"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the story click handler
                            handleCreateTask(story.id);
                          }}
                        >
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
                      onTaskClick={handleTaskClick}
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

        {/* Add CreateTaskModal component at the end, before the closing DragDropContext tag */}
        <CreateTaskModal
          show={showCreateTaskModal}
          onHide={() => setShowCreateTaskModal(false)}
          projectId={projectId}
          userStoryId={selectedUserStory}
          initialStatusId={1}
          onTaskCreated={handleTaskCreated}
        />
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

function StatusColumn({ storyId, status, color, tasks, isExpanded, onTaskClick }) {
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
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Task
                  key={task.id}
                  task={task}
                  index={index}
                  isExpanded={isExpanded}
                  onClick={(e) => onTaskClick(task.id, e)}
                />
              ))
            ) : (
              <div className="h-[40px] flex items-center justify-center text-gray-400 text-sm">
                {isExpanded && <p>Không có task</p>}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

function Task({ task, index, isExpanded, onClick }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${isExpanded ? "p-3" : "p-1"} mb-2 bg-white border border-gray-200 rounded shadow-sm ${snapshot.isDragging ? "task-card-dragging" : ""
            } cursor-pointer hover:bg-gray-50`}
          style={{
            ...provided.draggableProps.style,
          }}
          onClick={onClick}
        >
          {isExpanded ? (
            // Hiển thị đầy đủ thông tin khi mở rộng
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 mr-2">
                    {task.assignees && task.assignees.length > 0 ? (
                      <span>{task.assignees[0].fullName.substring(0, 2).toUpperCase()}</span>
                    ) : (
                      <span>?</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">{task.subject}</span>
                    <div className="text-xs text-gray-500">#{task.id}</div>
                  </div>
                </div>

                <button onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {task.isBlocked && (
                <div className="mt-1">
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    Blocked
                  </span>
                </div>
              )}
            </>
          ) : (
            // Chỉ hiển thị avatar khi thu gọn
            <div className="flex justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                {task.assignees && task.assignees.length > 0 ? (
                  <span>{task.assignees[0].fullName.substring(0, 2).toUpperCase()}</span>
                ) : (
                  <span>?</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
