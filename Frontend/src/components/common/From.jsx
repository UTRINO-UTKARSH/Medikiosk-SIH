/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

const From = () => {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const data = await fetch("http://localhost:3001/api/users/profile", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, age, gender, password })
            });

            const response = await data.json();
            if (!data.ok) {
                throw new Error(response.message || "Failed to save profile");
            }

            toast.success("Profile setup complete!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.message || "An unexpected error occurred");
        }
    };

    return (
        <div className='flex items-center justify-center px-4'>
            <div className='w-full max-w-xl bg-white rounded-2xl shadow-sm p-4'>
                <span className='block text-blue-950 font-bold text-3xl mb-6'>Create Your Profile</span>

                <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-900 mb-3'>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className='w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-950/10 focus:border-blue-950'
                        />
                    </div>

                    <div className='flex gap-4'>
                        <div className='w-1/3'>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>Age</label>
                            <input
                                type="number"
                                required
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Years"
                                className='w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-950/10 focus:border-blue-950'
                            />
                        </div>

                        <div className='w-2/3'>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>Gender</label>
                            <div className='flex rounded-md border border-gray-300 overflow-hidden'>
                                {["Male", "Female", "Other"].map((option, i) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setGender(option)}
                                        className={`flex-1 py-3 text-sm font-semibold transition
                                            ${i !== 0 ? "border-l border-gray-300" : ""}
                                            ${gender === option
                                                ? "bg-blue-950 text-white"
                                                : "bg-white text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Passwords */}
                    <div className='flex gap-4'>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>Create Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-950/10 focus:border-blue-950'
                            />
                        </div>
                        <div className='w-1/2'>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>Re-enter Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-950/10 focus:border-blue-950'
                            />
                        </div>
                    </div>

                    <div className='flex justify-end mt-2'>
                        <button
                            type="submit"
                            className='bg-blue-950 text-white font-semibold px-10 py-3 rounded-md hover:bg-blue-900 transition'
                        >
                            Next
                        </button>
                    </div>

                    <div className='text-center mt-2'>
                        <a href="/login" className='text-blue-950 font-semibold underline'>
                            Already have a profile? Log In
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default From;