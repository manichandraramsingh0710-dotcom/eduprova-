import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TaskTable = ({ tasks = [], showEmployeeName = false, isEditable = false, showProgress = true, isWeekly = true }) => {
    const { updateTaskStatus } = useAuth();
    const navigate = useNavigate();

    const handleEmployeeClick = (employeeId) => {
        navigate(`/user/${employeeId}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {showEmployeeName && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                            )}
                            {isWeekly && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Day
                                </th>
                            )}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Task
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            {showProgress && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Progress
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                {showEmployeeName && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEmployeeClick(task.employeeId)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-900 cursor-pointer"
                                        >
                                            {task.employeeName}
                                        </button>
                                        <div className="text-xs text-gray-500">{task.employeeId}</div>
                                    </td>
                                )}
                                {isWeekly && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {task.day}
                                        </span>
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {isEditable ? (
                                        <select
                                            value={task.status}
                                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                            className={`text-xs font-medium rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer border ${task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}
                                        >
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {task.status === 'completed' ? 'Completed' : 'In Progress'}
                                        </span>
                                    )}
                                </td>
                                {showProgress && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center w-full max-w-xs">
                                            <span className="text-sm text-gray-500 w-8">{task.progress}%</span>
                                            <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${task.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={showEmployeeName ? (showProgress ? 5 : 4) : (showProgress ? (isWeekly ? 4 : 3) : 3)} className="px-6 py-8 text-center text-sm text-gray-500">
                                    No tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskTable;
