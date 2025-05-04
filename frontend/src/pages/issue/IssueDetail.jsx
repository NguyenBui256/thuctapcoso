import { useNavigate, useParams } from "react-router-dom"
import { fetchWithAuth } from "../../utils/AuthUtils"
import { BASE_API_URL } from "../../common/constants"
import { useEffect, useState, useRef } from "react"
import { Avatar, Tag, Tooltip, Button, Divider } from "antd"
import { UserOutlined, EyeOutlined, PlusOutlined, LockOutlined, LinkOutlined, DeleteOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons'
import { updateIssue } from '../../api/issue'
import DropdownPortal from './DropdownPortal'
import { toast } from "react-toastify"

export default function IssueDetail(){

    const userId = localStorage.getItem('userId')
    const {projectId, issueId} = useParams()
    const navigate = useNavigate()
    const [issue, setIssue] = useState({})
    const [filters, setFilters] = useState({})
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [isEditingDes, setIsEditingDes] = useState(false)
    const [editDes, setEditDes] = useState('')

    const [isAddingTag, setIsAddingTag] = useState(false)
    const [tagInput, setTagInput] = useState('')

    const filteredTags = filters.tags?.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !issue.tags?.some(st => st.id === t.id));

    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const dueDateRef = useRef()

    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const statusRef = useRef();
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const typeRef = useRef();
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
    const severityRef = useRef();
    const [showPrioDropdown, setShowPrioDropdown] = useState(false);
    const prioRef = useRef();
    const [showAssignDropdown, setShowAssignDropdown] = useState(false)
    const assignRef = useRef()

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)

    useEffect(() => {
        function handleClickOutside(event) {
            if (showStatusDropdown && statusRef.current && !statusRef.current.contains(event.target)) {
                setShowStatusDropdown(false);
            }
            if (showTypeDropdown && typeRef.current && !typeRef.current.contains(event.target)) {
                setShowTypeDropdown(false);
            }
            if (showSeverityDropdown && severityRef.current && !severityRef.current.contains(event.target)) {
                setShowSeverityDropdown(false);
            }
            if (showPrioDropdown && prioRef.current && !prioRef.current.contains(event.target)) {
                setShowPrioDropdown(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showStatusDropdown, showTypeDropdown, showSeverityDropdown, showPrioDropdown]);

    const fetchIssue = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get?projectId=${projectId}&issueId=${issueId}`)
            .then(res => res.json())
            .then(res => {
                if(res.error)
                    navigate('/error?errorType=NOT_FOUND')
                else
                    setIssue(res.data)
            })
    }

    const fetchFilters = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/get-filters?projectId=${projectId}`)
            .then(res => res.json())
            .then(res => setFilters(res.data))
    }

    const handleTitleClick = () => {
        setEditTitle(issue.subject)
        setIsEditingTitle(true)
    }

    const handleTitleSave = async () => {
        if(!editTitle){
            toast.warn("Tiêu đề không được trống")
            return
        }
        try {
            const res = await updateIssue(issue.id, { subject: editTitle });
            if (res && !res.error) {
                setIssue(res.data)
                setIsEditingTitle(false)
            }
        } catch (e) {}
    }

    const handleDesUpdate = async () => {
        try {
            const res = await updateIssue(issue.id, { description: editDes });
            if (res && !res.error) {
                setIssue(res.data)
                setIsEditingDes(false)
            }
        } catch (e) {}
    }
     
    const handleUpdate = async (propName, value) => {
        const body = {
            [propName]: value
        }
        const res = await updateIssue(issue.id, body)
        if(res.error){
            toast.error("Error while updating")
        }
        else{
            setIssue(res.data)
            toast.success("Updated successfully")
        }
    }

    const handleDeleteIssue = () => {
        fetchWithAuth(`${BASE_API_URL}/v1/issue/${issueId}`, window.location, true, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(res => {
                if(res.error){
                    toast.error("Error while deleting, try again later")
                }
                else{
                    window.location.assign("../issues")
                }
            })
    }

    useEffect(() => {
        fetchIssue()
        fetchFilters()
    }, [])

    if(!issue) return (
        <></>
    )

    return (
        <div style={{ background: '#f7f7fa', minHeight: '100vh', width: '100%', padding: '10px 10px' }}>
            <div style={{ display: 'flex', width: '100%', gap: 24, alignItems: 'flex-start' }}>
                {/* Cột trái */}
                <div style={{ flex: 3, background: '#fff', borderRadius: 8, padding: 32 }}>
                    {/* Tiêu đề và tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#2b8be6', fontWeight: 700, fontSize: 32 }}>#{issue.position}</span>
                        {isEditingTitle ? (
                            <>
                                <textarea
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 500,
                                        height: 36,
                                        lineHeight: '36px',
                                        resize: 'none',
                                        width: 350,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        border: '1px solid #bfc6d1',
                                        fontFamily: 'inherit',
                                        verticalAlign: 'middle',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    autoFocus
                                />
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #5178d3', background: '#5178d3', color: '#fff', cursor: 'pointer' }}
                                    onClick={handleTitleSave}
                                >Lưu</button>
                                <button
                                    style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #bfc6d1', background: '#fff', color: '#5178d3', cursor: 'pointer' }}
                                    onClick={() => setIsEditingTitle(false)}
                                >Hủy</button>
                            </>
                        ) : (
                            <span
                                style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                                onClick={handleTitleClick}
                                title="Nhấn để chỉnh sửa tên issue"
                                className="editable-issue-title"
                            >
                                <span style={{ fontSize: 28, fontWeight: 500, cursor: 'pointer' }}>{issue.subject}</span>
                                {issue.dueDate && (
                                    <span
                                        className="ml-2 align-middle inline-block"
                                        title={new Date(issue.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    >
                                        <span className="text-yellow-500 text-base cursor-pointer">⏰</span>
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                    {/* Tag */}
                    <div style={{ margin: '12px 0' }}>
                        {issue.tags?.map((tag, idx) => (
                            <Tag key={idx} style={{background: tag.color}}>
                                {tag.name}
                                <span
                                    className="ml-2 font-bold text-[20px] rounded-full cursor-pointer"
                                    onClick={() => handleUpdate('tags', issue.tags.filter(t => t.id !== tag.id))}
                                >
                                    x
                                </span>
                            </Tag>
                        ))}
                        {isAddingTag ? (
                            <div
                                className="relative mb-2"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 mr-2"
                                    placeholder="Nhập tên tag hoặc chọn..."
                                />
                                {tagInput && filteredTags.length > 0 && (
                                    <div className="absolute w-fit left-0 right-0 bg-white border border-gray-200 rounded shadow z-10 mt-1 max-h-40 overflow-y-auto">
                                    {filteredTags.map(tag => (
                                        <div
                                            key={tag.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                            onClick={() => {
                                                handleUpdate('tags', [...issue.tags, tag])
                                                setIsAddingTag(false)
                                            }}
                                        >
                                            {tag.color && <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: tag.color}}></span>}
                                            {tag.name}
                                        </div>
                                    ))}
                                    </div>
                                )}

                                <Button
                                    className="bg-blue-300 mr-2"                                
                                >
                                    Thêm mới
                                </Button>
                                <Button 
                                    className="bg-red-100"
                                    onClick={() => setIsAddingTag(false)}  
                                >
                                    Hủy
                                </Button>
                                
                            </div>
                        ) : (
                            <Button 
                                color="#bfbfbf"
                                onClick={() => {
                                    setTagInput('')
                                    setIsAddingTag(true)
                                }}  
                            >
                                + Thêm thẻ
                            </Button>
                        )}
                        
                    </div>
                    {/* Description */}
                    <div 
                        style={{ fontStyle: 'italic', marginBottom: 16 }}
                        
                    >
                        {isEditingDes ? (
                            <>
                            <textarea
                                value={editDes}
                                onChange={e => setEditDes(e.target.value)}
                                style={{
                                    fontSize: 20,
                                    height: 100,
                                    lineHeight: '36px',
                                    resize: 'none',
                                    width: 350,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    border: '1px solid #bfc6d1',
                                    fontFamily: 'inherit',
                                    verticalAlign: 'middle',
                                    boxSizing: 'border-box',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                autoFocus
                            />
                            <button
                                style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #5178d3', background: '#5178d3', color: '#fff', cursor: 'pointer' }}
                                onClick={handleDesUpdate}
                            >Lưu</button>
                            <button
                                style={{ marginLeft: 8, padding: '4px 12px', fontSize: 16, borderRadius: 4, border: '1px solid #bfc6d1', background: '#fff', color: '#5178d3', cursor: 'pointer' }}
                                onClick={() => setIsEditingDes(false)}
                            >Hủy</button>
                            </>
                        ) : (
                            <>
                            {issue.description ? (
                                <span
                                    style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
                                    onClick={() => {
                                        setEditDes(issue.description)
                                        setIsEditingDes(true)
                                    }}
                                    title="Nhấn để chỉnh sửa mô tả"
                                >
                                    <span style={{ fontSize: 20, cursor: 'pointer' }}>{issue.description}</span>
                                </span>
                            ) : 'Empty space is so boring... go on, be descriptive...'}
                            </>
                        )}
                        
                    </div>
                    {/* Attachments */}
                    <div style={{ background: '#f3f5fa', border: '1px solid #e5e7ef', borderRadius: 6, padding: 16, marginBottom: 24 }}>
                        <b>0 Attachments</b>
                        <div style={{ border: '1px dashed #bfc6d1', borderRadius: 6, padding: 24, textAlign: 'center', marginTop: 8, color: '#5178d3', cursor: 'pointer' }}>
                            Drop attachments here!
                        </div>
                    </div>
                    {/* Tabs: Comments & Activities */}
                    <div style={{ background: '#f3f5fa', borderRadius: 6, padding: 16 }}>
                        <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #e5e7ef', marginBottom: 16 }}>
                            <b style={{ borderBottom: '2px solid #5178d3', paddingBottom: 4 }}>0 Comments</b>
                            <span style={{ color: '#5178d3', cursor: 'pointer' }}>1 Activities</span>
                        </div>
                        <textarea style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #bfc6d1', padding: 8 }} placeholder="Type a new comment here" />
                    </div>
                </div>
                {/* Cột phải */}
                <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24 }}>
                        <div ref={statusRef} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: 1 }}>{issue.status?.closed ? 'CLOSED' : 'OPEN'}</span>
                            <Tag 
                                color="#59597c" style={{ fontWeight: 500, marginLeft: 8 }}
                                onClick={() => {setShowStatusDropdown(v => !v)}}
                            >
                                {issue.status?.name}
                            </Tag>
                            <DropdownPortal anchorRef={statusRef} show={showStatusDropdown}>
                                <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                    {filters?.statuses?.map(st => (
                                        <div
                                            key={st.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                            onClick={() => {
                                                setShowStatusDropdown(false);
                                                handleUpdate('status', st);
                                            }}
                                        >
                                            {st.name}
                                        </div>
                                    ))}
                                </div>
                            </DropdownPortal>
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>type</span>
                            <div 
                                ref={typeRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowTypeDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.type?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.type?.name}</span>
                            </div>
                            <DropdownPortal anchorRef={typeRef} show={showTypeDropdown}>
                                <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                    {filters?.types?.map(st => (
                                        <div
                                            key={st.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                            onClick={() => {
                                                setShowTypeDropdown(false);
                                                handleUpdate('type', st);
                                            }}
                                        >
                                            {st.name}
                                        </div>
                                    ))}
                                </div>
                            </DropdownPortal>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>severity</span>
                            <div 
                                ref={severityRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowSeverityDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.severity?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.severity?.name}</span>
                                <DropdownPortal anchorRef={severityRef} show={showSeverityDropdown}>
                                    <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                        {filters?.severities?.map(st => (
                                            <div
                                                key={st.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                                onClick={() => {
                                                    setShowSeverityDropdown(false);
                                                    handleUpdate('severity', st);
                                                }}
                                            >
                                                {st.name}
                                            </div>
                                        ))}
                                    </div>
                                </DropdownPortal>
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <span style={{ color: '#888' }}>priority</span>
                            <div 
                                ref={prioRef}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => setShowPrioDropdown(v => !v)}
                            >
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: issue.priority?.color, display: 'inline-block' }}></span>
                                <span style={{ fontWeight: 500 }}>{issue.priority?.name}</span>
                                <DropdownPortal anchorRef={prioRef} show={showPrioDropdown}>
                                    <div className="bg-white border border-gray-200 rounded shadow z-30 w-40 max-h-60 overflow-y-auto min-w-[120px]">
                                        {filters?.priorities?.map(st => (
                                            <div
                                                key={st.id}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sky-500"
                                                onClick={() => {
                                                    setShowPrioDropdown(false);
                                                    handleUpdate('priority', st);
                                                }}
                                            >
                                                {st.name}
                                            </div>
                                        ))}
                                    </div>
                                </DropdownPortal>
                            </div>
                        </div>
                    </div>
                    {/* Assigned */}
                    <div 
                        style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}
                    >
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>ASSIGNED</div>
                        <Button 
                            ref={assignRef}
                            icon={<PlusOutlined />} size="small" style={{ marginRight: 8 }}
                            onClick={() => setShowAssignDropdown(v => !v)}
                        >
                            Change assigned
                        </Button>
                        {(issue.assignee === null || issue.assignee?.userId != userId) && (
                            <Button 
                                icon={<UserOutlined />} size="small"
                                onClick={() => handleUpdate('assignee', filters.assigns.find(v => v.userId == userId))}
                            >
                                Assign to me
                            </Button>
                        )}
                        <div style={{ marginTop: 12 }}>
                            {issue.assignee ? (
                                <Tooltip title={issue.assignee.fullName}>
                                    <Avatar src={issue.assignee.avatar} />
                                    <span style={{ marginLeft: 8 }}>{issue.assignee.fullName}</span>
                                </Tooltip>
                            ) : <span style={{ color: '#aaa' }}>Chưa có</span>}
                        </div>
                        <DropdownPortal anchorRef={assignRef} show={showAssignDropdown}>
                            <div className="bg-white border border-gray-200 rounded shadow z-30 w-48 max-h-60 overflow-y-auto min-w-[120px]">
                                <div
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setShowAssignDropdown(false);
                                        handleUpdate('assignee', {id: -1});
                                    }}
                                >
                                    Không phân công
                                </div>
                                {filters.assigns?.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setShowAssignDropdown(false);
                                            handleUpdate('assignee', user);
                                        }}
                                    >
                                        {user.avatar ? (
                                        <img src={user.avatar} alt={user.fullName} className="w-7 h-7 rounded-full object-cover" />
                                        ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                            {user.fullName?.charAt(0)?.toUpperCase()}
                                        </div>
                                        )}
                                        <span>{user.fullName}</span>
                                    </div>
                                ))}
                            </div>
                        </DropdownPortal>
                    </div>
                    {/* Watchers */}
                    <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>WATCHERS</div>
                        <Button icon={<PlusOutlined />} size="small" style={{ marginRight: 8 }}>Add watchers</Button>
                        <Button icon={<EyeOutlined />} size="small">Watch</Button>
                    </div>
                    {/* Các nút chức năng */}
                    <div 
                        style={{ background: '#fff', borderRadius: 8, padding: 16, display: 'flex', gap: 12, justifyContent: 'center' }}
                    >
                        <Button 
                            ref={dueDateRef}
                            icon={<ClockCircleOutlined />} shape="circle" 
                            className={`${issue.dueDate && 'bg-red-300'}`}
                            onClick={() => setShowDueDatePicker(v => !v)}
                        />
                        <Button 
                            icon={<DeleteOutlined />} 
                            shape="circle" 
                            danger 
                            onClick={() => setShowDeleteConfirmModal(true)}    
                        />

                        <DropdownPortal anchorRef={dueDateRef} show={showDueDatePicker}>
                            <div className="absolute right-0 bg-white border border-gray-200 rounded shadow-lg p-4 z-10">
                                <input
                                type="date"
                                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                                value={issue.dueDate}
                                onChange={(e) => {
                                    handleUpdate('dueDate', e.target.value);
                                    setShowDueDatePicker(false);
                                }}
                                />
                                <button
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowDueDatePicker(false)}
                                >
                                Hủy
                                </button>
                            </div>
                        </DropdownPortal>
                    </div>
                </div>
            </div>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-80">
                    <div className="bg-gray-300 rounded-xl p-10 flex flex-col items-center justify-center">
                        <p className="text-3xl font-semibold mb-10">
                            Xác nhận xóa ?
                        </p>
                        <div className="flex gap-5">
                            <Button
                                onClick={() => handleDeleteIssue()}
                                className="bg-red-300"
                            >
                                Xóa
                            </Button>

                            <Button
                                onClick={() => setShowDeleteConfirmModal(false)}
                                className="bg-blue-300"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}