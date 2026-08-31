/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const OtpModal = ({ isOpen, onClose, onSubmit, email }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
 
  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, e) => {
    const value = e.target.value;
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp]; 
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
 
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => { 
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
     
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const pastedArray = pastedData.split("");
    const newOtp = [...otp];
    
    pastedArray.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    
    setOtp(newOtp); 
    const focusIndex = pastedArray.length < 6 ? pastedArray.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === 6) {
      onSubmit(otpString);  
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('otpModal.title')}</h2>
          <p className="text-sm text-gray-500 mb-3">{t('otpModal.subtitle')}</p>
          <p className="text-lg font-semibold text-blue-950 break-all px-2">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6"> 
          <div className="flex gap-2 sm:gap-3 justify-center w-full" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-blue-950 border-2 border-gray-200 rounded-xl focus:border-blue-950 focus:ring-4 focus:ring-blue-950/10 transition-all outline-none"
              />
            ))}
          </div>
 
          <button
            type="submit"
            disabled={otp.join("").length !== 6}
            className="w-full py-3.5 mt-2 rounded-xl bg-blue-950 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-lg hover:bg-blue-900 transition-colors shadow-md"
          >
            {t('otpModal.verifyLogin')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;