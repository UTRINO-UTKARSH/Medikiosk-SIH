/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Eye, EyeOff, Lock, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '../common/Toast';

const Login = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Password states
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for API call

    // Phone number visibility toggle state
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/users/check-auth', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (response.ok && data.userId) {
                    setUserInfo(data);
                } else {
                    toast.error('Unable to fetch user information. Please try again.');
                    navigate('/auth', { replace: true });
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                toast.error('Error fetching user information');
                navigate('/auth', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate, toast]);

    const handleContinue = async (e) => {
        e?.preventDefault();
        if (!password.trim()) {
            toast.error('Please enter your password to continue.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send the password to your backend for verification
            const response = await fetch('http://localhost:3001/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Sends the JWT cookie
                body: JSON.stringify({
                    phoneNumber: userInfo?.phoneNumber,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Incorrect password. Please try again.');
            }

            // Once successfully verified, navigate to consent
            toast.success('Login successful!');
            navigate('/consent', { replace: true });

        } catch (error) {
            toast.error(error.message || 'An error occurred during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDisplayPhoneNumber = (phone) => {
        if (!phone) return '••••••••••';
        const phoneStr = String(phone);
        if (showPhone) return phoneStr;
        if (phoneStr.length < 4) return phoneStr;
        const last4 = phoneStr.slice(-4);
        return `••••••${last4}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-950 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-950/10 rounded-full flex items-center justify-center">
                        <User size={32} className="text-blue-950" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-blue-950 mb-2">Welcome Back</h1>
                <p className="text-center text-gray-600 mb-8">
                    Your identity has been verified via OTP. Please enter your password to complete your check-in.
                </p>

                {/* Toggleable Phone Number Box */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900 tracking-wider">
                            {getDisplayPhoneNumber(userInfo?.phoneNumber)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPhone(!showPhone)}
                        className="p-2 text-gray-500 hover:text-blue-950 transition-colors rounded-lg hover:bg-blue-100/50 cursor-pointer"
                        title={showPhone ? "Hide full number" : "Show full number"}
                    >
                        {showPhone ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Password Form */}
                <form onSubmit={handleContinue}>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                required
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-blue-950 px-6 py-3 font-semibold text-white transition hover:bg-blue-900 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>Verifying... <Loader2 size={18} className="animate-spin" /></>
                            ) : (
                                <>Proceed to Consent <ArrowRight size={18} /></>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/auth', { replace: true })}
                            disabled={isSubmitting}
                            className="w-full py-3 font-medium text-gray-600 transition hover:text-gray-900 cursor-pointer disabled:opacity-50"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;