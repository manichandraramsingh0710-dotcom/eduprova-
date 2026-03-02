import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddTaskModal from '../components/AddTaskModal';
import { Users, ClipboardList, CheckCircle, Download, Plus, Filter, CalendarDays, Calendar, Pencil, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAvatarColor = (id) => {
    const colors = [
        'bg-blue-50 text-blue-600 border-blue-200',
        'bg-green-50 text-green-600 border-green-200',
        'bg-orange-50 text-orange-600 border-orange-200',
        'bg-purple-50 text-purple-600 border-purple-200',
        'bg-pink-50 text-pink-600 border-pink-200',
        'bg-teal-50 text-teal-600 border-teal-200'
    ];
    let hash = 0;
    if (!id) return colors[0];
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const AdminDashboard = () => {
    const { user, tasks, employees, updateTaskStatus, loadData } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'

    const [editEmployeeModalOpen, setEditEmployeeModalOpen] = useState(false);
    const [editEmployeeId, setEditEmployeeId] = useState('');
    const [editEmployeeName, setEditEmployeeName] = useState('');

    const [deleteEmployeeModalOpen, setDeleteEmployeeModalOpen] = useState(false);
    const [deleteEmployeeId, setDeleteEmployeeId] = useState('');

    // Task Modals State
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const [editTaskData, setEditTaskData] = useState({ id: '', title: '', description: '', day: '' });
    const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState('');

    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    const weekRange = useMemo(() => {
        const date = new Date(selectedDate);
        const day = date.getDay();
        const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(new Date(date).setDate(diffToMonday));
        const saturday = new Date(new Date(monday).setDate(monday.getDate() + 5));

        return {
            start: monday,
            end: saturday,
            startStr: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            endStr: saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    }, [selectedDate]);

    const filteredTasks = useMemo(() => {
        const start = new Date(weekRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(weekRange.end);
        end.setHours(23, 59, 59, 999);

        return tasks.filter(t => {
            if (!t.createdAt) return true;
            const taskDate = new Date(t.createdAt);
            return taskDate >= start && taskDate <= end;
        });
    }, [tasks, weekRange]);

    const handleEditTaskSave = async () => {
        try {
            await axios.put(`${API_URL}/api/tasks/${editTaskData.id}`, editTaskData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (user) await loadData(user);
            setEditTaskModalOpen(false);
        } catch (error) {
            console.error('Failed to edit task', error);
        }
    };

    const handleDeleteTaskConfirm = async () => {
        try {
            await axios.delete(`${API_URL}/api/tasks/${deleteTaskId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (user) await loadData(user);
            setDeleteTaskModalOpen(false);
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleEditEmployeeSave = async () => {
        try {
            await axios.put(`${API_URL}/api/employees/${editEmployeeId}`, { name: editEmployeeName }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (user) await loadData(user);
            setEditEmployeeModalOpen(false);
        } catch (error) {
            console.error('Failed to edit employee', error);
        }
    };

    const handleDeleteEmployeeConfirm = async () => {
        try {
            await axios.delete(`${API_URL}/api/employees/${deleteEmployeeId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (user) await loadData(user);
            setDeleteEmployeeModalOpen(false);
        } catch (error) {
            console.error('Failed to delete employee', error);
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
        const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
            employees: employees.length,
            tasksThisWeek: totalTasks,
            completionRate
        };
    }, [filteredTasks, employees]);

    const days = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

    const handleStatusChange = (taskId, updates) => {
        updateTaskStatus(taskId, updates);
    };

    const calculateWeeklyProgress = (employeeId) => {
        const weeklyTasks = filteredTasks.filter(task =>
            task.employeeId === employeeId && (task.viewType === "weekly" || task.viewType === undefined)
        );
        if (weeklyTasks.length === 0) return 0;
        return Math.round(weeklyTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / weeklyTasks.length);
    };

    const employeeGridData = useMemo(() => {
        const filteredEmployees = employees.filter(emp => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (emp.name?.toLowerCase().includes(query) || emp.id?.toLowerCase().includes(query));
        });

        return filteredEmployees.map(emp => {
            const empTasks = filteredTasks.filter(t => t.employeeId === emp.id && (t.viewType || 'weekly') === viewMode);
            const tasksByDay = {};
            days.forEach(day => {
                tasksByDay[day] = empTasks.filter(t => t.day === day);
            });
            const avgProgress = calculateWeeklyProgress(emp.id);
            return { ...emp, tasksByDay, totalTasks: empTasks.length, allTasks: empTasks, avgProgress };
        });
    }, [employees, filteredTasks, days, viewMode, searchQuery]);

    const handleExportCSV = () => {
        const headers = ['Task ID', 'Employee ID', 'Employee Name', 'Title', 'Description', 'Day', 'Status', 'Progress'];
        const csvContent = [
            headers.join(','),
            ...filteredTasks.map(t =>
                [t.id, t.employeeId, `"${t.employeeName}"`, `"${t.title}"`, `"${t.description}"`, t.day, t.status, `${t.progress}%`].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'task_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Component for task checkbox item
    const TaskCheckbox = ({ task }) => {
        const [localProgress, setLocalProgress] = useState(task.progress || 0);

        // Sync local state if parent changes
        useEffect(() => {
            setLocalProgress(task.progress || 0);
        }, [task.progress]);

        const handleProgressChange = (e) => {
            setLocalProgress(parseInt(e.target.value));
        };

        const handleProgressCommit = () => {
            if (localProgress !== task.progress) {
                handleStatusChange(task.id, { progress: localProgress });
            }
        };

        return (
            <div className={`flex flex-col p-3 mb-2 rounded-md border ${task.status === 'completed'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
                } transition-colors group relative`}>

                {/* Actions (visible on hover) */}
                {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-0.5 rounded shadow-sm">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditTaskData({ id: task.id, title: task.title, description: task.description, day: task.day });
                                setEditTaskModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit Task"
                        >
                            <Pencil size={13} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTaskId(task.id);
                                setDeleteTaskModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}

                <div className="flex items-start cursor-pointer w-[90%]" onClick={() => handleStatusChange(task.id, { status: task.status === 'completed' ? 'in-progress' : 'completed' })}>
                    <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        readOnly
                        className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer shrink-0"
                    />
                    <span className={`ml-2 text-sm font-medium ${task.status === 'completed' ? 'text-blue-800 line-through opacity-70' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                        {task.title}
                    </span>
                </div>

                <div className="ml-6 mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-gray-700">{localProgress}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={localProgress}
                        onChange={handleProgressChange}
                        onMouseUp={handleProgressCommit}
                        onTouchEnd={handleProgressCommit}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${task.status === 'completed' ? 'bg-green-200 accent-green-600' : 'bg-gray-200 accent-blue-600'}`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Employees</p>
                        <div className="flex items-baseline mt-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.employees}</h3>
                        </div>
                        <p className="text-xs text-green-600 mt-1 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +5% from last month
                        </p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 ring-4 ring-indigo-50/50">
                        <Users size={28} />
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Tasks This Week</p>
                        <div className="flex items-baseline mt-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.tasksThisWeek}</h3>
                        </div>
                        <p className="text-xs text-red-500 mt-1 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                            </svg>
                            -2% from last week
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-full text-blue-600 ring-4 ring-blue-50/50">
                        <ClipboardList size={28} />
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overall Completion %</p>
                        <div className="flex items-baseline mt-1">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.completionRate}%</h3>
                        </div>
                        <p className="text-xs text-green-600 mt-1 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            +12% spike
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-full text-blue-600 ring-4 ring-blue-50/50 relative">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 10% 0%)' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                {/* Table Header Controls */}
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
                    <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <CalendarDays size={16} className="mr-2" /> Weekly
                            </button>
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                <Calendar size={16} className="mr-2" /> Daily
                            </button>
                        </div>

                        <div className="flex items-center space-x-2 border border-gray-300 rounded-md bg-white px-2 py-1 focus-within:ring-1 focus-within:ring-blue-500 min-w-max">
                            <div className="text-sm font-medium text-gray-700 ml-2 hidden sm:block whitespace-nowrap">
                                {weekRange.startStr} – {weekRange.endStr}
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-sm border-none focus:ring-0 outline-none p-1 text-gray-600 bg-transparent block"
                            />
                        </div>

                        <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 w-full sm:w-64 transition-shadow">
                            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-sm border-none focus:ring-0 outline-none p-0 text-gray-700 bg-transparent w-full"
                            />
                        </div>

                        <button className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 bg-white">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                            onClick={handleExportCSV}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            <Download size={16} className="mr-2 text-gray-500" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Add New Task
                        </button>
                    </div>
                </div>

                {/* The Grid Table */}
                <div className="overflow-x-auto">
                    {viewMode === 'weekly' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 w-64 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                                        Employee Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900 border-r border-gray-200 bg-white">
                                        Weekly Tasks
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-gray-900 border-r border-gray-200 bg-white w-48">
                                        Overall Weekly Progress (%)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeeGridData.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 border-r border-gray-200 bg-white sticky left-0 z-10 align-top">
                                            <div className="flex items-center justify-between group">
                                                <div
                                                    className="flex items-center cursor-pointer"
                                                    onClick={() => navigate(`/user/${emp.id}`)}
                                                >
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${getAvatarColor(emp.id)}`}>
                                                        {(emp.name || emp.id || 'U').split(' ').map(n => n?.[0]).join('')}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{emp.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{emp.role}</div>
                                                    </div>
                                                </div>
                                                {user?.role === 'admin' && (
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditEmployeeId(emp.id);
                                                                setEditEmployeeName(emp.name);
                                                                setEditEmployeeModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                            title="Edit Employee"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteEmployeeId(emp.id);
                                                                setDeleteEmployeeModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Delete Employee"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-gray-200 align-top bg-white">
                                            {emp.allTasks.length > 0 ? (
                                                <div className="flex flex-col space-y-2">
                                                    {emp.allTasks.map(task => (
                                                        <div key={task.id} className="border border-gray-200 rounded p-2 bg-gray-50 flex flex-col relative group">
                                                            {user?.role === 'admin' && (
                                                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/90 rounded pl-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditTaskData({ id: task.id, title: task.title, description: task.description, day: task.day });
                                                                            setEditTaskModalOpen(true);
                                                                        }}
                                                                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Edit Task"
                                                                    >
                                                                        <Pencil size={13} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setDeleteTaskId(task.id);
                                                                            setDeleteTaskModalOpen(true);
                                                                        }}
                                                                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Delete Task"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <div className="text-sm font-medium text-gray-800 mb-1 truncate w-[85%]">{task.title}</div>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                    <div className={`h-1.5 rounded-full ${task.status === 'completed' || task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress || 0}%` }}></div>
                                                                </div>
                                                                <span className="text-xs text-gray-500 font-medium w-8 text-right">{task.progress || 0}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center py-4 opacity-50">
                                                    <span className="text-sm text-gray-500 font-medium">0 tasks</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 border-r border-gray-200 align-middle bg-white w-48">
                                            <div className="flex items-center space-x-2 w-full px-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                                    <div className={`h-2.5 rounded-full ${emp.avgProgress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${emp.avgProgress}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 w-10 text-right">{emp.avgProgress}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 w-64 border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                                        Employee Name
                                    </th>
                                    {days.map(day => (
                                        <th key={day} scope="col" className="px-4 py-4 text-center text-sm font-bold text-gray-900 border-r border-gray-200 min-w-[140px] bg-white">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employeeGridData.some(emp => days.some(d => emp.tasksByDay[d]?.length > 0)) ? (
                                    employeeGridData.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 border-r border-gray-200 bg-white sticky left-0 z-10 align-top">
                                                <div className="flex items-center justify-between group">
                                                    <div
                                                        className="flex items-center cursor-pointer"
                                                        onClick={() => navigate(`/user/${emp.id}`)}
                                                    >
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${getAvatarColor(emp.id)}`}>
                                                            {(emp.name || emp.id || 'U').split(' ').map(n => n?.[0]).join('')}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{emp.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{emp.role}</div>
                                                        </div>
                                                    </div>
                                                    {user?.role === 'admin' && (
                                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditEmployeeId(emp.id);
                                                                    setEditEmployeeName(emp.name);
                                                                    setEditEmployeeModalOpen(true);
                                                                }}
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                title="Edit Employee"
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteEmployeeId(emp.id);
                                                                    setDeleteEmployeeModalOpen(true);
                                                                }}
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Delete Employee"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {days.map(day => {
                                                const dayTasks = emp.tasksByDay[day] || [];
                                                return (
                                                    <td key={day} className="p-2 border-r border-gray-200 align-top bg-white min-w-[180px]">
                                                        {dayTasks.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {dayTasks.map(task => (
                                                                    <TaskCheckbox key={task.id} task={task} />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center py-6 opacity-30">
                                                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Off Day</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={days.length + 1} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                            No tasks scheduled for {selectedDay}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-white">
                    <div>Showing {employeeGridData.length} of {employees.length} employees</div>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-md cursor-not-allowed opacity-50 font-medium">Previous</button>
                        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors">Next</button>
                    </div>
                </div>
            </div>

            <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Edit Employee Modal */}
            {editEmployeeModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Edit Employee Name</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <input
                                type="text"
                                value={editEmployeeId}
                                disabled
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={editEmployeeName}
                                onChange={(e) => setEditEmployeeName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setEditEmployeeModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditEmployeeSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Employee Confirmation Modal */}
            {deleteEmployeeModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Delete Employee?</h3>
                        <p className="text-gray-600 mb-6 flex flex-col space-y-2">
                            <span>Are you sure you want to delete this employee?</span>
                            <span className="text-red-500 text-sm font-semibold">Action cannot be undone. All tasks for this employee will also be deleted.</span>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteEmployeeModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteEmployeeConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editTaskModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
                        <h3 className="text-lg font-bold mb-4">Edit Task</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTaskData.title}
                                    onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editTaskData.description}
                                    onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                <select
                                    value={editTaskData.day}
                                    onChange={(e) => setEditTaskData({ ...editTaskData, day: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setEditTaskModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditTaskSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Task Confirmation Modal */}
            {deleteTaskModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Delete Task?</h3>
                        <p className="text-gray-600 mb-6 flex flex-col space-y-2">
                            <span>Are you sure you want to delete this task?</span>
                            <span className="text-red-500 text-sm font-semibold">Action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteTaskModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTaskConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
