import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaBell } from 'react-icons/fa';

const Header = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left side */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center">
                            <svg className="w-6 h-6 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z"></path>
                            </svg>
                            <span className="ml-2 text-xl font-medium text-gray-900">Taiga</span>
                        </Link>
                        <Link to="/projects" className="text-gray-600 hover:text-gray-900">
                            Projects
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100">
                            <FaQuestionCircle className="w-5 h-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 relative">
                            <FaBell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                1
                            </span>
                        </button>
                        <div className="relative">
                            <button
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white font-medium">
                                    UN
                                </div>
                            </button>

                            {/* User menu dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                                    <Link
                                        to="/account/settings"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Account Settings
                                    </Link>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // TODO: Handle logout
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;