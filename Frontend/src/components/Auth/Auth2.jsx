/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "../common/Toast";
import { useTranslation } from "react-i18next";
import bgImage from "../../assets/bg.jpeg";

const Auth2 = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [otp ,setotp] = useState(false)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await fetch("http://localhost:3001/api/users/send-otp", {
                method: "POST",
                credentials: "include",
                headers: { "Content-type": "application/json" },
                body:JSON.stringify({
                    email:email
                })  
            })
            const response = await data.json()
            if(!data.ok){
                throw new Error(response.message || 'Login failed');
            }
            setotp(true)
            toast.success("OTP Send Successfully");
            
        } catch (err) {
            setotp(false)
            toast.error("Email doesn't exist")
            console.log(err)
        }
    }
    return (
        <div className="bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="flex flex-col md:flex-row items-start gap-6 w-full max-w-4xl">

                {/* Left — form card */}
                <div className="w-full md:w-3/5 h-110 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                            {t("authPage2.title")}
                        </h1>
                        <p className="mt-3 text-gray-500">
                            {t("authPage2.subtitle")}
                        </p>

                        <label className="block mt-6 text-sm font-medium text-gray-700">
                            {t("authPage2.emailLable")}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                        />
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <button className="text-gray-700 font-medium hover:text-gray-900">
                            {t("authPage2.back")}
                        </button>
                        <button
                            disabled={!email}
                            className="inline-flex cursor-pointer items-center gap-2 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-lg hover:bg-gray-800 transition"
                        >
                            {t("authPage2.continue")}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div className=" md:w-3/5 md:block overflow-hidden mt-10 h-85 shadow-lg relative rounded-2xl ">
                    <img
                        src={bgImage}
                        alt=""
                        className="absolute inset-0 w-full h-full "
                    />
                </div>

            </div>
        </div>
    );
};

export default Auth2;