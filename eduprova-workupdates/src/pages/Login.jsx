import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, UserCircle, LogIn } from 'lucide-react';
import logoImg from '../assets/Eduprova logo 1.png';
import nameImg from '../assets/Eduprova (1).png';

const Login = () => {
    const [isEmployee, setIsEmployee] = useState(true);
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const role = isEmployee ? 'employee' : 'admin';
        const success = await login(id, password, role);

        if (success) {
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/employee');
            }
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center justify-center mb-6 space-y-4">
                        <img src={logoImg} alt="Eduprova Logo" className="h-16" />
                        <img src={nameImg} alt="Eduprova Name" className="h-10" />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8 shadow-inner">
                    <button
                        onClick={() => setIsEmployee(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex justify-center items-center ${isEmployee ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UserCircle className="w-4 h-4 mr-2" />
                        Employee Login
                    </button>
                    <button
                        onClick={() => setIsEmployee(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex justify-center items-center ${!isEmployee ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Admin Login
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isEmployee ? 'Employee ID' : 'Admin ID'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder={isEmployee ? 'e.g. E001' : 'e.g. admin'}
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center animate-pulse">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign in
                    </button>
                </form>

            </div>
        </div >
    );
};

export default Login;
