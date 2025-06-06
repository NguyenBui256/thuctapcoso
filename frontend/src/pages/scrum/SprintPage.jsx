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
import SprintProgressBar from "../../components/sprint/SprintProgressBar"
import IssueSection from "../../components/sprint/IssueSection"

const filterss = ['statuses', 'assigns', 'createdBy', 'roles']
const filterNames = ['Trạng thái', 'Phân công', 'Tạo bởi', 'Vai trò']

export default function SprintPage() {
  const { projectId, sprintId } = useParams()
  const navigate = useNavigate()

  // Add proper initialization for sprintData
  const [sprintData, setSprintData] = useState({
    name: 'Sprint',
    startDate: '',
    endDate: ''
  });

  // Add completionPercentage state
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Danh sách trạng thái - initialize as empty array, will be filled from API
  const [statuses, setStatuses] = useState([])

  // Set default statuses as fallback
  const defaultStatuses = [
    { id: 1, name: 'NEW', color: '#3498db' },
    { id: 2, name: 'READY', color: '#9b59b6' },
    { id: 3, name: 'IN PROGRESS', color: '#f39c12' },
    { id: 4, name: 'READY FOR TEST', color: '#f1c40f' },
    { id: 5, name: 'DONE', color: '#2ecc71' },
    { id: 6, name: 'ARCHIVED', color: '#95a5a6' }
  ];

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

  // State cho keyword tìm kiếm
  const [keyword, setKeyword] = useState('')
  // State để lưu trữ danh sách tasks gốc (để phục vụ cho việc tìm kiếm)
  const [originalTasks, setOriginalTasks] = useState({})

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
    try {
      if (!projectId) {
        console.error("Project ID is required to fetch task statuses");
        setStatuses(defaultStatuses);
        return defaultStatuses;
      }

      console.log("Fetching task statuses for project:", projectId);
      const response = await fetchWithAuth(`${BASE_API_URL}/tasks/project/${projectId}/statuses`);

      if (!response.ok) {
        throw new Error(`Status error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Raw API response:", responseData);

      // Extract the data array from the response
      const data = responseData.data || [];
      console.log("Fetched task statuses data array:", data);

      if (data && Array.isArray(data) && data.length > 0) {
        // Transform the API status data to match the expected format
        const transformedStatuses = data.map(status => ({
          id: status.id,
          name: status.name.toUpperCase(), // Convert to uppercase for consistency
          color: status.color || '#cccccc',  // Keep as hex color for easier manipulation
          closed: status.closed || false
        }));
        console.log("Transformed statuses:", transformedStatuses);
        setStatuses(transformedStatuses);
        return transformedStatuses;
      } else {
        console.warn("Invalid response format or empty status data, using default values");
        setStatuses(defaultStatuses);
        return defaultStatuses;
      }
    } catch (error) {
      console.error('Error fetching task statuses:', error);
      console.warn("Using default statuses due to fetch error");
      setStatuses(defaultStatuses);
      return defaultStatuses;
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

  // Lấy tasks cho mỗi user story riêng lẻ
  const fetchTasksForUserStory = async (userStoryId) => {
    try {
      console.log('Fetching tasks for userStory ID:', userStoryId);
      const response = await fetchWithAuth(`${BASE_API_URL}/tasks/userstory/${userStoryId}`);

      if (!response.ok) {
        throw new Error(`Error fetching tasks: ${response.status}`);
      }

      const data = await response.json();
      console.log('Tasks data for userStory', userStoryId, ':', data);

      if (data.statusCode === 200 && data.data) {
        return data.data;
      } else if (data && Array.isArray(data)) {
        return data; // Handle case where API returns array directly
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
    // Use statuses from state directly, ensuring we have the latest values
    const currentStatuses = statuses.length > 0 ? statuses : defaultStatuses;

    console.log("Mapping task with statusId:", statusId, "statusName:", statusName);
    console.log("Available statuses:", currentStatuses);

    // First, try to find a direct ID match in our statuses array
    const directMatch = currentStatuses.find(s => s.id === statusId);
    if (directMatch) {
      console.log(`Task status ID ${statusId} directly matches status: ${directMatch.name}`);
      return statusId;
    }

    // If no direct match by ID, try to match by name
    if (statusName) {
      const nameToMatch = (statusName || "").toLowerCase();
      const matchedStatus = currentStatuses.find(s => {
        const statusLower = (s.name || "").toLowerCase();
        return statusLower === nameToMatch ||
          statusLower.includes(nameToMatch) ||
          nameToMatch.includes(statusLower);
      });

      if (matchedStatus) {
        console.log(`Mapped status name "${statusName}" to ID=${matchedStatus.id}, name=${matchedStatus.name}`);
        return matchedStatus.id;
      }
    }

    // If we still have no match but we have statuses, return the ID of the first status
    if (currentStatuses.length > 0) {
      console.log(`Using first available status (${currentStatuses[0].name}, ID=${currentStatuses[0].id}) as fallback`);
      return currentStatuses[0].id;
    }

    // If all else fails, return the first status ID as default
    console.warn("No valid status mapping found, defaulting to first status if available");
    if (currentStatuses.length > 0) {
      return currentStatuses[0].id;
    }
    return null;
  };

  const fetchUserStories = async (fetchedStatuses) => {
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
      console.log("Fetching user stories for project:", projectId, "sprint:", sprintId);
      const res = await fetchWithAuth(`${BASE_API_URL}/v1/user_story/get?projectId=${projectId}&sprintId=${sprintId}${keywordQuery}${filterQuery}`);

      if (!res.ok) {
        throw new Error(`Error fetching user stories: ${res.status}`);
      }

      const data = await res.json();
      console.log("User stories API response:", data);

      if (!data.data || !Array.isArray(data.data)) {
        console.warn("Invalid user stories data format:", data);
        setUserStories([]);
        setTasks({});
        return;
      }

      console.log("User stories data:", data.data);

      // Make sure we're using the correct statuses
      // Ensure we have statuses to work with - use fetchedStatuses if available, fall back to statuses state or defaults
      const currentStatuses = fetchedStatuses && fetchedStatuses.length > 0
        ? fetchedStatuses
        : (statuses.length > 0 ? statuses : defaultStatuses);

      console.log("Using statuses for story mapping:", currentStatuses);

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

        // Initialize all statuses with empty arrays
        if (currentStatuses && currentStatuses.length > 0) {
          currentStatuses.forEach(stat => {
            newTasks[story.id][stat.id] = [];
          });
        } else {
          console.warn("No statuses available for story", story.id);
          continue; // Skip this story if no statuses
        }

        const storyTasks = await fetchTasksForUserStory(story.id);

        if (!storyTasks || !Array.isArray(storyTasks)) {
          console.warn(`Invalid tasks data for story #${story.id}:`, storyTasks);
          continue;
        }

        // Phân loại tasks theo status
        console.log(`Phân loại ${storyTasks.length} tasks cho story #${story.id}`);

        storyTasks.forEach(task => {
          // Lấy statusId từ task và map về ID trong danh sách statuses
          const apiStatusId = task.statusId;
          const statusName = task.statusName || task.status;

          console.log(`Processing task #${task.id}, statusId=${apiStatusId}, statusName=${statusName}`);

          // Ánh xạ statusId từ API về ID trong danh sách statuses
          let mappedStatusId = null;

          // First, try to find a direct ID match in our statuses array
          const directMatch = currentStatuses.find(s => s.id === apiStatusId);
          if (directMatch) {
            console.log(`Task status ID ${apiStatusId} directly matches status: ${directMatch.name}`);
            mappedStatusId = apiStatusId;
          }
          // If no direct match by ID, try to match by name
          else if (statusName) {
            const nameToMatch = (statusName || "").toLowerCase();
            const matchedStatus = currentStatuses.find(s => {
              const statusLower = (s.name || "").toLowerCase();
              return statusLower === nameToMatch ||
                statusLower.includes(nameToMatch) ||
                nameToMatch.includes(statusLower);
            });

            if (matchedStatus) {
              console.log(`Mapped status name "${statusName}" to ID=${matchedStatus.id}, name=${matchedStatus.name}`);
              mappedStatusId = matchedStatus.id;
            }
          }

          // If we still have no match, use the first status as default
          if (!mappedStatusId && currentStatuses.length > 0) {
            mappedStatusId = currentStatuses[0].id;
            console.log(`Using first available status (${currentStatuses[0].name}, ID=${currentStatuses[0].id}) as fallback`);
          } else if (!mappedStatusId) {
            console.warn("Cannot map status for task:", task);
            return;
          }

          if (!newTasks[story.id][mappedStatusId]) {
            console.log(`Creating new array for mappedStatusId=${mappedStatusId} of story #${story.id}`);
            newTasks[story.id][mappedStatusId] = [];
          }

          console.log(`Adding task #${task.id} to column status=${mappedStatusId} of story #${story.id}`);
          newTasks[story.id][mappedStatusId].push(task);
        });
      }

      console.log("Organized tasks for all stories:", newTasks);

      // Lưu trữ bản sao gốc của tasks để phục vụ cho việc tìm kiếm
      setOriginalTasks(JSON.parse(JSON.stringify(newTasks)));

      // Filter tasks theo keyword hiện tại (nếu có)
      if (keyword.trim()) {
        const filteredTasks = filterTasksByKeyword(newTasks, keyword);
        setTasks(filteredTasks);
      } else {
        setTasks(newTasks);
      }

    } catch (error) {
      console.error("Error fetching user stories:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu user stories");
      setUserStories([]);
      setTasks({});
    }
  };

  // Fetch danh sách trạng thái khi component được mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log("Starting to load data for project:", projectId);

        // First, fetch task statuses
        console.log("Fetching task statuses first...");
        const fetchedStatuses = await fetchTaskStatuses();
        console.log("Fetched statuses:", fetchedStatuses);

        // Ensure statuses are set properly - this is critical
        if (!fetchedStatuses || fetchedStatuses.length === 0) {
          console.log("No statuses fetched, using defaults");
          await setStatuses(defaultStatuses);
        }

        // Then fetch user stories with the fetched statuses
        console.log("Now fetching user stories with statuses:", fetchedStatuses || defaultStatuses);
        await fetchUserStories(fetchedStatuses || defaultStatuses);

        // Also fetch sprint data if we have a sprint ID
        if (sprintId) {
          try {
            console.log(`Fetching sprint data for sprint ID ${sprintId}`);
            // Fix sprint API endpoint
            const sprintResponse = await fetchWithAuth(`${BASE_API_URL}/api/v1/sprint/${sprintId}`);

            if (!sprintResponse.ok) {
              console.error(`Error fetching sprint data: ${sprintResponse.status}`);
              setSprintData({
                name: `Sprint ${sprintId}`,
                startDate: '',
                endDate: ''
              });
              return;
            }

            const sprintData = await sprintResponse.json();
            console.log("Fetched sprint data:", sprintData);

            if (sprintData && sprintData.data) {
              setSprintData({
                name: sprintData.data.name || `Sprint ${sprintId}`,
                startDate: sprintData.data.startDate || '',
                endDate: sprintData.data.endDate || ''
              });
            } else {
              setSprintData({
                name: `Sprint ${sprintId}`,
                startDate: '',
                endDate: ''
              });
            }
          } catch (error) {
            console.error("Error fetching sprint data:", error);
            // Set default sprint data
            setSprintData({
              name: `Sprint ${sprintId}`,
              startDate: '',
              endDate: ''
            });
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadData();
    }
  }, [projectId, sprintId]);

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

  // Hàm filter tasks theo từ khóa tìm kiếm
  const filterTasksByKeyword = (tasksData, searchKeyword) => {
    if (!searchKeyword.trim()) {
      return tasksData; // Trả về danh sách tasks ban đầu nếu không có từ khóa
    }

    const lowercaseKeyword = searchKeyword.toLowerCase();
    const filteredTasks = {};

    // Duyệt qua từng user story
    Object.keys(tasksData).forEach(storyId => {
      filteredTasks[storyId] = {};

      // Duyệt qua từng status trong user story
      Object.keys(tasksData[storyId]).forEach(statusId => {
        // Lọc các tasks có tên chứa từ khóa tìm kiếm
        const matchingTasks = tasksData[storyId][statusId].filter(task =>
          task.subject && task.subject.toLowerCase().includes(lowercaseKeyword)
        );

        filteredTasks[storyId][statusId] = matchingTasks;
      });
    });

    return filteredTasks;
  };

  // Xử lý thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    const newKeyword = e.target.value;
    setKeyword(newKeyword);

    // Lọc tasks theo từ khóa mới
    if (Object.keys(originalTasks).length > 0) {
      const filteredTasks = filterTasksByKeyword(originalTasks, newKeyword);
      setTasks(filteredTasks);
    }
  };

  // Calculate completion percentage when tasks change
  useEffect(() => {
    if (Object.keys(tasks).length > 0) {
      const doneStatusIds = statuses
        .filter(s => s.closed === true)
        .map(s => s.id);

      let totalTasks = 0;
      let completedTasks = 0;

      Object.keys(tasks).forEach(storyId => {
        Object.keys(tasks[storyId]).forEach(statusId => {
          const tasksCount = tasks[storyId][statusId].length;
          totalTasks += tasksCount;

          if (doneStatusIds.includes(parseInt(statusId))) {
            completedTasks += tasksCount;
          }
        });
      });

      const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      setCompletionPercentage(percentage);
    }
  }, [tasks, statuses]);

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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="container mx-auto px-4 py-4 border-b border-teal-200 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <h1 className="text-2xl font-bold text-teal-500">{sprintData.name}</h1>
            <div className="text-sm text-gray-500">
              {sprintData.startDate} to {sprintData.endDate}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-2 py-1 rounded text-sm font-medium ${showFilters ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Filter className="h-3.5 w-3.5 mr-1" /> Filters
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-gray-700 font-semibold">
            <span className="text-teal-500">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="flex-grow mx-4 bg-gray-200 rounded-full h-2.5 overflow-hidden relative">
            <div
              className="bg-teal-500 h-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex space-x-6">
            <div className="text-gray-700">
              <span className="text-teal-500 font-semibold">{countOpenTasks()}</span> open
              tasks
            </div>
            <div className="text-gray-700">
              <span className="text-teal-500 font-semibold">{countClosedTasks()}</span> closed
              tasks
            </div>
          </div>
        </div>

        {/* Search and Filter Area */}
        <div className="container mx-auto px-4 py-3 border-b border-teal-200">
          <div className="flex w-full">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1 flex-grow">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm task..."
                className="bg-transparent focus:outline-none text-sm flex-grow"
                value={keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>

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
        </div>

        {/* Kanban Board */}
        <div className="flex-grow overflow-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${statuses.length}, 1fr)` }}>
              <div className="bg-gray-100 px-4 py-2 rounded-t font-bold text-gray-700">USER STORY</div>
              {statuses.map((status) => {
                // Handle both Tailwind class colors and hex colors for the header
                const headerStyle = {};
                if (status.color) {
                  if (status.color.startsWith('bg-')) {
                    // Extract color from Tailwind class if possible
                    const tailwindColor = status.color.replace('bg-', '');
                    headerStyle.backgroundColor = `var(--color-${tailwindColor}-100, #f3f4f6)`;
                    headerStyle.borderTop = `3px solid var(--color-${tailwindColor}-500, #6b7280)`;
                  } else {
                    // Use hex color directly
                    headerStyle.borderTop = `3px solid ${status.color}`;
                    // Create a lighter background color by adding transparency
                    headerStyle.backgroundColor = `${status.color}20`;
                  }
                }

                return (
                  <div
                    key={status.id}
                    style={headerStyle}
                    className="px-4 py-2 font-bold text-gray-700 mr-2"
                  >
                    {status.name}
                  </div>
                );
              })}
            </div>

            {/* User stories with tasks */}
            {userStories.map(story => (
              <div key={story.id} className="grid" style={{ gridTemplateColumns: `1fr repeat(${statuses.length}, 1fr)` }}>
                <div className="bg-white rounded shadow-sm">
                  <div
                    className="p-3 cursor-pointer"
                    onClick={(e) => handleUserStoryClick(story.id, e)}
                  >
                    <div className="flex items-center">
                      <button
                        className="mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStoryExpand(story.id);
                        }}
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
            ))}
          </div>
        </div>
      </div>

      {/* Thay thế phần Footer cũ bằng component IssueSection */}
      <IssueSection projectId={projectId} sprintId={sprintId} />

      {/* Add CreateTaskModal component at the end, before the closing DragDropContext tag */}
      <CreateTaskModal
        show={showCreateTaskModal}
        onHide={() => setShowCreateTaskModal(false)}
        projectId={projectId}
        userStoryId={selectedUserStory}
        initialStatusId={1}
        onTaskCreated={handleTaskCreated}
      />
      {/* </div> */}

      {/* Add CreateTaskModal component at the end, before the closing DragDropContext tag */}
      {/* <CreateTaskModal
        show={showCreateTaskModal}
        onHide={() => setShowCreateTaskModal(false)}
        projectId={projectId}
        userStoryId={selectedUserStory}
        initialStatusId={1}
        onTaskCreated={handleTaskCreated}
      /> */}
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

  // Handle both Tailwind class colors and hex colors
  const getColorStyle = () => {
    if (!color) return {};

    // If it's a Tailwind class (starts with 'bg-')
    if (color.startsWith('bg-')) {
      return { borderTop: '3px solid var(--color-primary)' }; // Use a CSS variable as fallback
    }

    // If it's a hex color
    return { borderTop: `3px solid ${color}` };
  };

  return (
    <div
      className="bg-white rounded shadow p-2 min-h-[60px]"
      style={getColorStyle()}
    >
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
