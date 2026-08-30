/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";  
import { useToast } from "../common/Toast";
import { useTranslation } from "react-i18next";
import bgImage from "../../assets/bg.jpeg";
import OtpModal from "../common/OtpModal";

const Auth2 = ({ onVerified }) => {
    const { t } = useTranslation();
    const toast = useToast();
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
        <div className="bg-gray-50 flex items-center justify-center px-4 py-10 relative "> 
            
            <div className="flex flex-col md:flex-row items-start gap-6 w-full max-w-4xl">
                <div className="w-full md:w-3/5 h-110 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                {t("authPage2.title", "Welcome to MediKiosk")}
                            </h1>
                            <p className="mt-3 text-gray-500 mb-6">
                                {needsEmail 
                                    ? "Please provide an email address for your new account." 
                                    : "Enter your registered phone number to log in."}
                            </p>

                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={needsEmail || isLoading} 
                                placeholder="10-digit number"
                                maxLength="10"
                                className="mt-2 mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 disabled:bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                            />

                            {needsEmail && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading} 
                                        placeholder="you@example.com"
                                        required
                                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                            <button type="button" className="text-gray-700 cursor-pointer font-medium hover:text-gray-900">Back</button>
                            <button
                                type="submit" 
                                disabled={phoneNumber.length !== 10 || (needsEmail && !email) || isLoading}
                                className="inline-flex cursor-pointer items-center gap-2 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-lg hover:bg-gray-800 transition"
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

                <div className="md:w-3/5 md:block overflow-hidden mt-10 h-85 shadow-lg relative rounded-2xl">
                    <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
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