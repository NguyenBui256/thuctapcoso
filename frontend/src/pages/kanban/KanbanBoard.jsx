import SprintProgressBar from '../../components/sprint/SprintProgressBar';

// Existing code...

// Somewhere in the component where sprint information is displayed
{
    activeSprint && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{activeSprint.name}</h3>
                <span className="text-sm text-gray-500">
                    {formatDate(activeSprint.startDate)} - {formatDate(activeSprint.endDate)}
                </span>
            </div>
            <SprintProgressBar sprintId={activeSprint.id} autoRefresh={true} />
        </div>
    )
} 