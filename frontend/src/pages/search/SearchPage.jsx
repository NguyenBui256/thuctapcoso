import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { projectId } = useParams();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/projects/${projectId}/search/results?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col items-center justify-start p-8">
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleClose}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <FiX size={24} />
                </button>
            </div>

            <div className="max-w-2xl w-full mx-auto mt-32">
                <h1 className="text-3xl font-bold text-center mb-8">Search</h1>

                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 bottom-2 bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 uppercase text-sm font-medium"
                        >
                            SEARCH
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 