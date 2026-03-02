import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, role: 'admin' | 'employee', name }
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Configure Axios
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Initial load check
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Load Data
    const loadData = async (currentUser) => {
        try {
            if (currentUser.role === 'admin') {
                const [empRes, taskRes] = await Promise.all([
                    api.get('/api/employees'),
                    api.get('/api/tasks')
                ]);
                setEmployees(empRes.data);
                setTasks(taskRes.data);
            } else if (currentUser.role === 'employee') {
                const taskRes = await api.get('/api/tasks/me');
                setTasks(taskRes.data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
            if (error.response?.status === 401) {
                logout(); // Automatically log out on token expiration
            }
        }
    };

    useEffect(() => {
        if (user) {
            loadData(user);
        } else {
            setEmployees([]);
            setTasks([]);
        }
    }, [user]);

    const login = async (id, password, role) => {
        try {
            const response = await api.post('/api/auth/login', {
                username: id,
                password
            });

            const data = response.data;

            // Verify correct role matched intended login
            if (data.user.role !== role) {
                return false;
            }

            localStorage.setItem('token', data.token);

            const userInfo = {
                id: data.user.employeeId,
                role: data.user.role,
                name: data.user.name
            };

            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            return true;

        } catch (error) {
            console.error('Login Error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const addTask = async (task) => {
        try {
            await api.post('/api/tasks', task);
            if (user) await loadData(user); // mandatory refresh
            return { success: true };
        } catch (error) {
            console.error('AddTask Error:', error);
            if (error.response?.status === 403) {
                return { success: false, error: 'Only admin can add task' };
            }
            return { success: false, error: error.response?.data?.detail || 'Failed to add task' };
        }
    };

    const updateTaskStatus = async (taskId, updates) => {
        try {
            await api.put(`/api/tasks/${taskId}/status`, updates);
            if (user) await loadData(user); // Refresh tasks
        } catch (error) {
            console.error('UpdateStatus Error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, tasks, employees, addTask, updateTaskStatus, loadData }}>
            {children}
        </AuthContext.Provider>
    );
};
