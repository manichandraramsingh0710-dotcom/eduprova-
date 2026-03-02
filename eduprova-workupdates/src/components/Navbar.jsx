import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';

import logoImg from '../assets/Eduprova logo 1.png';
import nameImg from '../assets/Eduprova (1).png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 z-50 sticky top-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <img src={logoImg} alt="Eduprova Logo" className="h-10" />
                            <img src={nameImg} alt="Eduprova Name" className="h-8 ml-2" />
                        </div>

                        {user && user.role === 'admin' && (
                            <div className="hidden md:flex ml-8">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search employees or tasks..."
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {user && (
                        <div className="flex items-center space-x-6">
                            <button className="text-gray-500 hover:text-gray-700 relative">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center space-x-3 focus:outline-none"
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Operations Manager' : 'Employee'}</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex flex-shrink-0 items-center justify-center text-orange-700 font-bold overflow-hidden border border-orange-200 shadow-sm">
                                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=c2410c&bold=true`} alt="avatar" />
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                                        <button
                                            onClick={handleLogout}
                                            className="flex text-left w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
