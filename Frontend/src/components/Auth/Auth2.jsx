/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";  
import { useToast } from "../common/Toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg.jpeg";
import OtpModal from "../common/OtpModal";

const Auth2 = ({ onVerified }) => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(""); 
    const [email, setEmail] = useState("");
    const [needsEmail, setNeedsEmail] = useState(false);  
    const [otpSent, setOtpSent] = useState(false);      
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);  
        try {
            const payload = { phoneNumber };
            if (needsEmail) payload.email = email;

            const response = await fetch("http://localhost:3001/api/users/send-otp", {
                method: "POST",
                credentials: "include",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(payload)  
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'Authentication failed');
            }
             
            if (response.status === 202 && responseData.requireEmail) {
                setNeedsEmail(true);
                toast.info("New patient detected. Please provide an email to continue.");
                return;  
            }
             
            setOtpSent(true);
            toast.success("OTP sent to your email!");
            
        } catch (err) {
            toast.error(err.message || "An unexpected error occurred");
            console.error("Auth Error:", err);
        } finally {
            setIsLoading(false); 
        }
    }
 
    const handleVerifyOTP = async (otpCode) => { 
        try {
         const response = await fetch("http://localhost:3001/api/users/verify-otp", {
                method: "POST",
                credentials: "include",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ phoneNumber, otp: otpCode })
            });
            const data = await response.json()
            if(!response.ok){
                 throw new Error(data.message || 'Wrong OTP');
                
            }

            setOtpSent(false);
            toast.success("Verification successful!");
            onVerified?.(data);
        } catch (err) {
            toast.error(err.message || "Try again")
        } 
    };

    return (
        <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
            <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl md:grid-cols-2">
                <div className="flex min-h-130 flex-col justify-between p-6 sm:p-10 lg:p-12">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
                        <div>
                            <div className="mb-8 h-1.5 w-12 rounded-full bg-blue-950" />
                            <h1 className="max-w-xs text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">
                                {t("authPage2.title", "Welcome to MediKiosk")}
                            </h1>
                            <p className="mt-4 max-w-sm text-base leading-7 text-gray-500">
                                {needsEmail 
                                    ? "Please provide an email address for your new account." 
                                    : "Enter your registered phone number to log in."}
                            </p>

                            <label className="mt-9 block text-sm font-semibold text-gray-800">Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={needsEmail || isLoading} 
                                placeholder="10-digit number"
                                maxLength="10"
                                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-950 focus:ring-4 focus:ring-blue-950/10 disabled:bg-gray-100"
                            />

                            {needsEmail && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="mt-5 block text-sm font-semibold text-gray-800">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading} 
                                        placeholder="you@example.com"
                                        required
                                        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-950 focus:ring-4 focus:ring-blue-950/10"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-5">
                            <button type="button" onClick={() => navigate("/")} className="cursor-pointer font-medium text-gray-600 transition hover:text-gray-950">Back</button>
                            <button
                                type="submit" 
                                disabled={phoneNumber.length !== 10 || (needsEmail && !email) || isLoading}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isLoading ? (
                                    <>
                                        Sending... <Loader2 size={18} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Continue <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="relative hidden min-h-130 overflow-hidden bg-blue-950 md:block">
                    <img src={bgImage} alt="MediKiosk care team" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-blue-950/15" />
                </div>
            </div>
 
            <OtpModal 
                isOpen={otpSent} 
                onClose={() => setOtpSent(false)} 
                onSubmit={handleVerifyOTP}
                phoneNumber={phoneNumber}
            />

        </div>
    );
};

export default Auth2;