/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { QrCode, Keyboard, UserRoundX,X } from "lucide-react";
import FormModal from "../common/OtpModal";
import { useToast } from "../common/Toast";
import { useTranslation } from "react-i18next";
import {Scanner} from "@yudiel/react-qr-scanner"

const Auth = ({ setIsAuth,isAuth }) => {
  const { t } = useTranslation();
  const [ModelOpen, setModelOpen] = useState(false);
  const toast = useToast();
  const [isScanning, setisScanning] = useState(false)
  const Fields = [
    { name: "Full Name", label: "Full Name", required: true },
    { name: "Email Id", label: "Email Id", required: true },
    { name: "Date of birth", label: "DOB", required: true, type: 'date' },
    { name: "Phone Number", label: "Phone Number", required: true, type: 'number' }
  ];

  const handleFormSubmit = async (data) => {
    try {
      const tokenid = data["Token Id"];
      const entered_name = data["Full Name"];
      const entered_dob = data["Date of birth"];
      const res = await fetch('http://localhost:3001/api/users/login', {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          accessCode: tokenid,
          name: entered_name,
          dob: entered_dob,
        })
      });

      const respose = await res.json();
      if (!res.ok) {
        throw new Error(respose.message || t('authPage.loginFailed'));
      }

      setIsAuth(true);
      toast.success(t('authPage.patientLoggedIn'));
      setisScanning(false)
      setModelOpen(false);
    } catch (error) {
      setIsAuth(false);
      console.log("No user found: ", error);
      toast.error(error.message || t('authPage.pleaseEnterCorrectDetails'));
    }
  };
  const handelScan = (text) =>{
    try {
      if(text){
        const scannedData = JSON.parse(text)
        handleFormSubmit(scannedData)
      }
      
    } catch (error) {
       toast.error(t('authPage.invalidQRCode'))
       setisScanning
    }
    
  }
  
  return (
    <div className="w-full max-h-full flex flex-col items-center justify-center px-4">

      <div className="flex flex-col items-center text-center mb-8">
        <h3 className="text-4xl md:text-6xl font-greet font-bold text-blue-950 mb-3 md:mb-4">
          {t('authPage.title')}
        </h3>
        <p className="flex flex-col items-center">
          <span className="text-xl md:text-3xl font-greet text-gray-500 mb-1">
            {t('authPage.subtitle')}
          </span>
          <span className="text-xl md:text-3xl font-greet text-gray-500">
            {t('authPage.subtitle2')}
          </span>
        </p>
      </div>


     {isScanning ? (
        
        <div className="w-full max-w-md flex flex-col items-center mb-8">
          {/* The Camera Feed */}
          <div className="w-full rounded-2xl overflow-hidden border-4 border-blue-950 shadow-lg relative bg-black">
            <Scanner 
              onResult={(text) => handelScan(text)} 
              onError={(error) => console.log(error?.message)}
            />
          </div>
          
          {/* Cancel Button */}
          <button 
            onClick={() => setisScanning(false)}
            className="mt-6 flex items-center gap-2 text-red-600 font-bold hover:text-red-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" /> Cancel Scanning
          </button>
        </div>

      ) : (

        <div className="flex flex-col sm:flex-row justify-center w-full max-w-3xl gap-6 md:gap-10 mb-8">
          {/* Scan Action */}
          <button 
            onClick={() => setisScanning(true)} 
            className="h-48 cursor-pointer w-full sm:w-48 md:h-56 md:w-56 bg-blue-950 hover:bg-blue-900 transition-colors flex flex-col items-center justify-center rounded-2xl group shadow-sm"
          >
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-blue-900 group-hover:bg-blue-800 transition-colors flex items-center justify-center mb-3">
              <QrCode className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <span className="text-white text-xl md:text-2xl font-greet font-semibold">
              {t('authPage.scan')}
            </span>
            <span className="text-white text-xl md:text-2xl font-greet font-bold">
              {t('authPage.tokenid')}
            </span>
          </button>

          <button onClick={() => setModelOpen(true)} className="h-48 cursor-pointer w-full sm:w-48 md:h-56 md:w-56 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 group shadow-sm">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors flex items-center justify-center mb-3">
              <Keyboard className="h-8 w-8 md:h-10 md:w-10 text-blue-950" />
            </div>
            <span className="text-blue-950 text-xl md:text-2xl font-greet font-semibold">
              {t('authPage.enter')}
            </span>
            <span className="text-blue-950 text-xl md:text-2xl font-greet font-bold">
              {t('authPage.tokenid')}
            </span>
          </button>

          <FormModal
            isOpen={ModelOpen}
            onClose={() => setModelOpen(false)}
            onSubmit={handleFormSubmit}
            title={t('authPage.patientDetails')}
            fields={Fields}
          />
        </div>

      )}


      <button onClick={() => toast.error("Please go to the counter for your token")} className="h-14 w-full max-w-[320px] bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center rounded-2xl cursor-pointer">
        <div className="flex items-center gap-2">
          <UserRoundX className="text-gray-600 w-5 h-5" />
          <span className="font-greet text-base md:text-lg text-gray-600 font-bold">
            {t('authPage.noToken')}
          </span>
        </div>
      </button>


    </div>
  );
};

export default Auth;