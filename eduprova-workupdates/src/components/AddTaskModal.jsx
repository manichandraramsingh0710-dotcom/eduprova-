import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose }) => {
    const { employees, addTask } = useAuth();

    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [day, setDay] = useState('Mon');
    const [status, setStatus] = useState('in-progress');
    const [viewType, setViewType] = useState('weekly');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (employeeId) {
            const emp = employees.find(e => e.id === employeeId);
            if (emp) setEmployeeName(emp.name);
        } else {
            setEmployeeName('');
        }
    }, [employeeId, employees]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const response = await addTask({
            employeeId,
            employeeName,
            title,
            description,
            day,
            status,
            viewType,
        });

        if (response && response.success) {
            // Reset and close
            setEmployeeId('');
            setTitle('');
            setDescription('');
            setDay('Mon');
            setStatus('in-progress');
            setViewType('weekly');
            setIsSubmitting(false);
            onClose();
        } else if (response && response.error) {
            setError(response.error);
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full z-10 overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {/* View Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button
                            type="button"
                            onClick={() => setViewType('weekly')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Weekly Task
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewType('daily')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${viewType === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Daily Task
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                            type="text"
                            required
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. E001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                        <input
                            type="text"
                            required
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            placeholder="Enter Employee Name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="E.g., Design UI"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                        <textarea
                            required
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Details about task"
                        />
                    </div>

                    <div className={viewType === 'daily' ? "grid grid-cols-2 gap-4" : ""}>
                        {viewType === 'daily' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 border focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!employeeName || isSubmitting}
                            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(!employeeName || isSubmitting) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
