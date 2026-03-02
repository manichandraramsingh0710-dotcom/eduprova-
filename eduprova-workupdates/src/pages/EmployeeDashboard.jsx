import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskTable from '../components/TaskTable';
import { UserCircle, Calendar, CalendarDays } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user, tasks } = useAuth();
    const [view, setView] = useState('weekly'); // 'weekly' or 'daily'
    const [selectedDay, setSelectedDay] = useState('Mon'); // For daily view

    // API natively restricts these to ONLY personal tasks via /api/tasks/me route
    const myTasks = tasks;

    const displayedTasks = useMemo(() => {
        if (view === 'weekly') return myTasks.filter(t => (t.viewType || 'weekly') === 'weekly');

        return myTasks.filter(t => t.day === selectedDay && (t.viewType || 'weekly') === 'daily');
    }, [myTasks, view, selectedDay]);

    const currentUser = user;

    const overallWeeklyProgress = useMemo(() => {
        const weeklyTasks = tasks.filter(task =>
            task.employeeId === (currentUser.employeeId || currentUser.id) &&
            (task.viewType === "weekly" || !task.viewType)
        );

        if (weeklyTasks.length === 0) return 0;

        const total = weeklyTasks.reduce(
            (sum, task) => sum + Number(task.progress || 0),
            0
        );

        return Math.round(total / weeklyTasks.length);
    }, [tasks, currentUser]);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="bg-blue-100 p-4 rounded-full mr-6 shrink-0">
                        <UserCircle size={48} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                            Welcome back, <span className="text-blue-600">{user.name}</span> 👋
                        </h2>
                        <p className="mt-2 text-gray-600 text-sm">
                            Here's an overview of your tasks. Keep up the good work!
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                    <p className="text-sm font-medium text-gray-500 mb-2">Overall Weekly Progress</p>
                    <div className="flex items-end justify-between mb-4">
                        <h3 className="text-3xl font-bold text-gray-900">{overallWeeklyProgress}%</h3>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${overallWeeklyProgress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${overallWeeklyProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        {view === 'weekly' ? 'Weekly Outlook' : "Daily Agenda"}
                    </h3>

                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                        {view === 'daily' && (
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="border border-gray-300 rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[120px]"
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        )}
                        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                            <button
                                onClick={() => setView('weekly')}
                                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center ${view === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <CalendarDays size={16} className="mr-2" />
                                Weekly Monitoring
                            </button>
                            <button
                                onClick={() => setView('daily')}
                                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center ${view === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Calendar size={16} className="mr-2" />
                                Daily Monitoring
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-0 border-t-0 border border-transparent rounded-b-xl overflow-hidden">
                    <TaskTable tasks={displayedTasks} isEditable={true} showEmployeeName={false} showProgress={true} isWeekly={false} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
