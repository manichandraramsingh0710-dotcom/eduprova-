import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskTable from '../components/TaskTable';
import ProgressCircle from '../components/ProgressCircle';
import { ArrowLeft, UserSquare2, CalendarDays, Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

const UserDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, employees } = useAuth();
    const [view, setView] = useState('weekly'); // 'weekly' or 'daily'

    const employee = useMemo(() => employees.find(e => e.id === id), [employees, id]);
    const employeeTasks = useMemo(() => tasks.filter(t => t.employeeId === id), [tasks, id]);

    const displayedTasks = useMemo(() => {
        if (view === 'weekly') return employeeTasks;
        // For dummy purposes, assuming today is 'Mon'
        const today = 'Mon';
        return employeeTasks.filter(t => t.day === today);
    }, [employeeTasks, view]);

    const progress = useMemo(() => {
        if (employeeTasks.length === 0) return 0;
        const completed = employeeTasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / employeeTasks.length) * 100);
    }, [employeeTasks]);

    if (!employee) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
                <p className="text-xl text-gray-600 mb-4">Employee not found.</p>
                <button
                    onClick={() => navigate('/admin')}
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    Return to Admin Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft size={16} className="mr-2" />
                Back to Admin Dashboard
            </button>

            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Welcome Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex items-center mb-4">
                        <div className="bg-white bg-opacity-20 p-3 rounded-xl mr-5 backdrop-blur-sm">
                            <UserSquare2 size={40} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight">
                                Viewing Employee: {employee.name}
                            </h2>
                            <p className="mt-2 text-blue-100 text-lg">
                                Employee ID: {employee.id}
                            </p>
                        </div>
                    </div>
                    <p className="text-blue-50 mt-4 max-w-lg leading-relaxed">
                        Here is the dashboard showing this employee's overall performance and assignments.
                    </p>
                </div>

                {/* Progress Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center transform transition hover:shadow-md duration-300">
                    <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">Overall Progress</h3>
                    <ProgressCircle progress={progress} />
                    <p className="mt-6 text-sm text-gray-500 text-center">
                        {employeeTasks.filter(t => t.status === 'completed').length} of {employeeTasks.length} tasks completed
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            {view === 'weekly' ? 'Weekly Outlook' : "Today's Agenda"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            A detailed view of all assigned tasks and their current status.
                        </p>
                    </div>

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

                <div className="p-0 border-t-0 border border-transparent rounded-b-xl overflow-hidden">
                    <TaskTable tasks={displayedTasks} isEditable={true} showEmployeeName={false} showProgress={true} isWeekly={view === 'weekly'} />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
