/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import Navbar from "../components/common/Navbar";
import Auth from "../components/Auth/Auth";
import { ArrowLeft, ArrowRight, Form, Languages } from "lucide-react";
import { useToast } from "../components/common/Toast";
import Consent from "../components/Child Pages/Consent";
import { useTranslation } from "react-i18next";
import Auth2 from "../components/Auth/Auth2";
import From  from "../components/common/From";
const Verification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuth, setIsAuth] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const toast = useToast();

  const stepTitles = {
    1: "IDENTITY CONSENT",
    2: "SYMPTOMS & VITALS",
    3: "MEDICAL HISTORY",
    4: "REVIEW",
    5: "DONE"
  };


  const handleNext = () => {

    if (currentStep === 1 && !isAuth) {
      toast.info("Please enter details to authenticate first");
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/users/check-auth', {
          credentials: "include"
        });
        const data = await res.json();

        if (data.authenticated) {
          setIsAuth(true);
        }
      } catch (error) {
        console.log("No valid session found.");
      }
    };

    checkSession();
  }, []);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const { i18n, t } = useTranslation()
  
  const renderMiddleContent = () => {
    switch (currentStep) {
      case 1:

        // return <Auth setIsAuth={setIsAuth} isAuth={isAuth} />;
        return <Auth2 onVerified={(data) => {
          setIsAuth(true);
          setIsNewUser(Boolean(data.isNewUser));
          setCurrentStep(2);
        }} />;
      case 2:
        return isNewUser
          ? <From/>
          : <div className="flex items-center justify-center mt-3"><Consent /></div>;
      default:
        return <Auth setIsAuth={setIsAuth} />;
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar
        Logo={Logo}
        Language={"English"}
        showHelp={true}
        showLanguage={true}
        onLanguageClick={() =>i18n.changeLanguage({Languages})}
        showUser={true}
      />

      {/* 5. Render the dynamic middle content */}
      <main className="grow pt-20 md:pt-24 pb-32">
        {renderMiddleContent()}
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-100 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row justify-between items-center p-4 md:px-8 md:py-6 max-w-7xl mx-auto gap-2">

          <button
            onClick={handleBack}
            className={`flex items-center justify-center h-12 w-24 md:h-16 md:w-40 border-2 border-blue-950 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-blue-950 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1 md:ml-2 font-bold font-greet text-sm md:text-xl text-blue-950">
              Back
            </span>
          </button>

          <div className="flex flex-col justify-center items-center text-center">
            <span className="text-xs md:text-sm font-greet text-gray-500 font-bold tracking-wider">
              STEP {currentStep} OF 5
            </span>
            <span className="text-base sm:text-lg md:text-3xl font-greet text-blue-950 font-bold uppercase">
              {stepTitles[currentStep]}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center h-12 w-24 md:h-16 md:w-40 bg-blue-950 rounded-xl hover:bg-blue-900 transition-colors group cursor-pointer"
          >
            <span className="mr-1 md:mr-2 font-bold font-greet text-sm md:text-xl text-white">
              Next
            </span>
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Verification;