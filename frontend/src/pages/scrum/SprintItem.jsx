import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import { Link, useParams } from 'react-router-dom'
import UpdateSprintModal from './UpdateSprintModal'
import { Droppable } from 'react-beautiful-dnd';
import UserStoryCard from './UserStoryCard';

export default function SprintItem({ sprintInp, onDelete, onRefreshUserStories }) {

  const { projectId } = useParams()

  const [isDropZoneCollapsed, setIsDropZoneCollapsed] = React.useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false)

  const [sprint, setSprint] = useState(undefined)

  const toggleDropZone = () => {
    setIsDropZoneCollapsed(!isDropZoneCollapsed);
  };

  useEffect(() => {
    if (sprintInp) {
      setSprint(sprintInp)
    }
  }, [sprintInp])

  return (
    <>
      {!sprint || sprint === undefined ? (
        <>
        </>
      ) : (
        <div id={sprint.id} className="w-full border-b pb-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleDropZone}
                className="p-2 border border-cyan-300 text-cyan-500 rounded mr-2"
                aria-label="Toggle drop zone"
              >
                {isDropZoneCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              <h2 className="text-lg font-medium text-cyan-600">{sprint.name}</h2>
            </div>
            <div className="relative group cursor-pointer">
              {/* Text content that will fade out on hover */}
              <div className="text-xs text-right text-gray-800 transition-opacity duration-300 group-hover:opacity-30">
                <div>{sprint.closed} closed</div>
                <div>{sprint.total} total</div>
              </div>

              {/* PenLine icon that will appear on hover */}
              <div
                className="absolute inset-0 left-5 top-1 flex items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                onClick={() => setUpdateModalOpen(true)}
              >
                <PenLine size={16} />
              </div>
            </div>

          </div>

          <div className="text-sm text-gray-500 mb-2">{sprint.startDate} {'->'} {sprint.endDate}</div>

          <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
            {sprint.total > 0 ? (
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.round((sprint.closed / sprint.total) * 100)}%`
                }}
              />
            ) : null}
          </div>

          {!isDropZoneCollapsed && (
            <Droppable droppableId={`sprint-${sprint.id}`} type="USER_STORY">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`mb-4 ${snapshot.isDraggingOver ? 'bg-cyan-50' : ''}`}
                >
                  {sprint.userStories && sprint.userStories.length > 0 ? (
                    <>
                      {sprint.userStories.map((us, index) => (
                        <UserStoryCard
                          key={us.id}
                          userStory={us}
                          index={index}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="mb-4">
                      <div className="border-2 border-dashed border-cyan-300 rounded-lg p-2 text-center text-gray-600">
                        <p>Kéo Stories từ backlog vào đây để bắt đầu một sprint mới</p>
                      </div>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}

          <div
            className="bg-gray-200 text-center py-3 rounded font-medium text-gray-700 cursor-pointer hover:bg-gray-300 transition-colors"
          >
            <Link
              to={`../sprint/${sprint.id}`}
            >
              SPRINT TASKBOARD
            </Link>
          </div>

          <UpdateSprintModal
            projectId={projectId}
            sprint={sprint}
            setSprint={setSprint}
            isOpen={updateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            onDelete={onDelete}
          />
        </div>
      )}
    </>
  );
};