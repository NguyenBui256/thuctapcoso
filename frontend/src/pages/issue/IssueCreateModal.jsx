import React, { useState, useEffect } from 'react';

export default function IssueCreateModal({
  open,
  onClose,
  onCreate,
  onSuccess,
  tags = [],
  statuses = [],
  types = [],
  severities = [],
  assigns = [],
  priorities = []
}) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedType, setSelectedType] = useState(types[0]?.id || "");
  const [selectedSeverity, setSelectedSeverity] = useState(severities[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState(priorities[0]?.id || "");
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]?.id || "");
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const resetData = () => {
    setShowTagInput(false);
    setTagInput("");
    setSelectedTags([]);
    setSelectedType(types[0]?.id || "");
    setSelectedSeverity(severities[0]?.id || "");
    setSelectedPriority(priorities[0]?.id || "");
    setSelectedStatus(statuses[0]?.id || "");
    setSelectedAssign(null);
    setShowAssignDropdown(false);
    setSubject("");
    setDescription("");
    setDueDate("");
    setShowDueDatePicker(false);
  };

  useEffect(() => {
    if (open) {
      resetData();
    }
  }, [open]);

  useEffect(() => {
    if (types.length > 0 && !selectedType) setSelectedType(String(types[0].id));
  }, [types]);
  useEffect(() => {
    if (severities.length > 0 && !selectedSeverity) setSelectedSeverity(String(severities[0].id));
  }, [severities]);
  useEffect(() => {
    if (priorities.length > 0 && !selectedPriority) setSelectedPriority(String(priorities[0].id));
  }, [priorities]);
  useEffect(() => {
    if (statuses.length > 0 && !selectedStatus) setSelectedStatus(String(statuses[0].id));
  }, [statuses]);

  if (!open) return null;

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setShowTagInput(false);
    setTagInput("");
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.some(st => st.id === t.id));

  const handleAssignToMe = () => {
    const myId = localStorage.getItem('userId');
    console.log(myId)
    const me = assigns.find(u => String(u.userId) === String(myId));
    if (me) setSelectedAssign(me);
    setShowAssignDropdown(false);
  };

  const handleSelectAssign = (user) => {
    setSelectedAssign(user);
    setShowAssignDropdown(false);
  };

  const handleCreateIssue = async () => {
    // Validate required fields
    if (!subject.trim()) {
      alert('Vui lòng nhập subject');
      return;
    }

    if (!selectedType) {
      alert('Vui lòng chọn type');
      return;
    }

    if (!selectedSeverity) {
      alert('Vui lòng chọn severity');
      return;
    }

    if (!selectedPriority) {
      alert('Vui lòng chọn priority');
      return;
    }

    if (!selectedStatus) {
      alert('Vui lòng chọn status');
      return;
    }

    const issueData = {
      subject: subject.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      status: {
        id: selectedStatus
      },
      type: {
        id: selectedType
      },
      severity: {
        id: selectedSeverity
      },
      priority: {
        id: selectedPriority
      },
      tags: selectedTags.map(tag => ({
        id: tag.id
      })),
      assignee: selectedAssign ? {
        id: selectedAssign.id
      } : null
    };

    try {
      await onCreate(issueData);
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          ×
        </button>
        <h2 className="text-3xl font-semibold text-center mb-6">New issue</h2>
        <div className="flex gap-8">
          {/* Left form */}
          <div className="flex-1">
            {/* Subject */}
            <input 
              type="text" 
              placeholder="Subject" 
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {/* Add tag */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <span key={tag.id} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center">
                    {tag.color && <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: tag.color}}></span>}
                    {tag.name}
                    <button className="ml-2 text-blue-600 hover:text-blue-800" onClick={() => setSelectedTags(selectedTags.filter(t => t.id !== tag.id))}>×</button>
                  </span>
                ))}
              </div>
              {showTagInput ? (
                <div className="relative mb-2">
                  <input
                    autoFocus
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                    placeholder="Nhập tên tag hoặc chọn..."
                  />
                  {tagInput && filteredTags.length > 0 && (
                    <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded shadow z-10 mt-1 max-h-40 overflow-y-auto">
                      {filteredTags.map(tag => (
                        <div
                          key={tag.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                          onClick={() => handleAddTag(tag)}
                        >
                          {tag.color && <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: tag.color}}></span>}
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end mt-1">
                    <button className="text-sm text-gray-500 hover:text-gray-700 mr-2" onClick={() => setShowTagInput(false)}>Hủy</button>
                    <button className="text-sm text-mint-600 font-semibold" onClick={() => handleAddTag({id: tagInput, name: tagInput})}>Thêm mới</button>
                  </div>
                </div>
              ) : (
                <button className="text-mint-600 font-semibold flex items-center gap-1" onClick={() => setShowTagInput(true)}>
                  Add tag <span className="text-lg">+</span>
                </button>
              )}
            </div>
            {/* Description */}
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 min-h-[120px]" 
              placeholder="Please add descriptive text to help others better understand this issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {/* Due Date Picker */}
            {showDueDatePicker && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded shadow-lg p-4 z-10">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
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
            )}
            {/* Attachments */}
            <div className="mb-3">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t">
                <span className="font-semibold text-gray-600">0 Attachments</span>
                <button className="bg-mint-100 text-mint-700 px-2 py-1 rounded text-lg">+</button>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-b px-4 py-6 text-center text-gray-400">
                Drop attachments here!
              </div>
            </div>
            {/* Create button */}
            <button 
              className="w-full bg-mint-200 hover:bg-mint-300 text-gray-800 font-semibold py-3 rounded mt-2"
              onClick={handleCreateIssue}
            >
              CREATE
            </button>
          </div>
          {/* Right info */}
          <div className="w-64 flex flex-col gap-4">
            {/* Status select */}
            <select 
              className="w-full bg-gray-200 rounded px-3 py-2 font-semibold text-lg text-gray-700 mb-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
            {/* Assign avatar + assign to me */}
            <div className="flex items-center gap-3 mb-2 relative">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400 overflow-hidden">
                {selectedAssign && selectedAssign.avatar ? (
                  <img src={selectedAssign.avatar} alt={selectedAssign.fullName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>★</span>
                )}
              </div>
              <div className="flex flex-col">
                <button type="button" className="text-mint-600 font-semibold text-left" onClick={() => setShowAssignDropdown(v => !v)}>
                  {selectedAssign ? selectedAssign.fullName : 'Assign'}
                </button>
                <button type="button" className="text-mint-600 text-sm text-left" onClick={handleAssignToMe}>Assign to me</button>
              </div>
              {/* Dropdown danh sách assigns */}
              {showAssignDropdown && (
                <div className="absolute left-0 top-16 bg-white border border-gray-200 rounded shadow z-20 w-60 max-h-60 overflow-y-auto">
                  {assigns.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectAssign(user)}
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
              )}
            </div>
            {/* Type, severity, priority */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-400">type</span>
                <select className="flex-1 bg-gray-100 rounded px-2 py-1" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <span className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: (types.find(t => String(t.id) === String(selectedType))?.color) || '#eee', display: 'inline-block'}}></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-400">severity</span>
                <select className="flex-1 bg-gray-100 rounded px-2 py-1" value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value)}>
                  {severities.map(sev => (
                    <option key={sev.id} value={sev.id}>{sev.name}</option>
                  ))}
                </select>
                <span className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: (severities.find(s => String(s.id) === String(selectedSeverity))?.color) || '#eee', display: 'inline-block'}}></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-400">priority</span>
                <select className="flex-1 bg-gray-100 rounded px-2 py-1" value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}>
                  {priorities.map(pri => (
                    <option key={pri.id} value={pri.id}>{pri.name}</option>
                  ))}
                </select>
                <span className="w-4 h-4 rounded-full border border-gray-200" style={{backgroundColor: (priorities.find(p => String(p.id) === String(selectedPriority))?.color) || '#eee', display: 'inline-block'}}></span>
              </div>
            </div>
            {/* 2 icon button */}
            <div className="flex gap-2 mt-4">
              <button 
                className={`w-10 h-10 rounded flex items-center justify-center text-xl relative ${
                  dueDate ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
                }`}
                onClick={() => setShowDueDatePicker(!showDueDatePicker)}
              >
                ⏰
                {dueDate && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">🔒</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 