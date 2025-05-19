import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectProjectType = () => {
    const navigate = useNavigate();

    const projectTypes = [
        {
            id: 'scrum',
            name: 'SCRUM',
            description: 'Prioritize and solve your tasks in short time cycles.',
            icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 10V16L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            id: 'kanban',
            name: 'KANBAN',
            description: 'Keep a constant workflow on independent tasks',
            icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26 4H6C4.89543 4 4 4.89543 4 6V26C4 27.1046 4.89543 28 6 28H26C27.1046 28 28 27.1046 28 26V6C28 4.89543 27.1046 4 26 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 10H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 16H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 22H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            id: 'duplicate',
            name: 'DUPLICATE PROJECT',
            description: 'Start clean and keep your configuration',
            icon: (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 14V6C24 4.89543 23.1046 4 22 4H6C4.89543 4 4 4.89543 4 6V22C4 23.1046 4.89543 24 6 24H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 28H26C27.1046 28 28 27.1046 28 26V18C28 16.8954 27.1046 16 26 16H18C16.8954 16 16 16.8954 16 18V26C16 27.1046 16.8954 28 18 28Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
    ];

    const handleTypeSelect = (typeId) => {
        if (typeId === 'duplicate') {
            navigate('/projects/duplicate');
        } else {
            navigate(`/projects/create/${typeId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-teal-500 mb-2">Create Project</h1>
                    <p className="text-gray-600">Which template fits your project better?</p>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                    {projectTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className="flex items-start p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="mr-4 text-gray-800">
                                {type.icon}
                            </div>
                            <div className="flex-grow">
                                <h2 className="font-bold text-gray-800 mb-1">{type.name}</h2>
                                <p className="text-gray-600">{type.description}</p>
                            </div>
                            <div className="ml-4">
                                <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectProjectType; 