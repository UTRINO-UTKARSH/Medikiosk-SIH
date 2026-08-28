import React from "react";
import {
  QrCode,
  Keyboard,
  UserRoundX,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const Auth = () => {
  return (
    <div>
      <div className="w-full max-h-full flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <h3 className="text-4xl md:text-6xl font-greet font-bold text-blue-950 mb-3 md:mb-4">
            Let's identify you
          </h3>
          <p className="flex flex-col items-center">
            <span className="text-xl md:text-3xl font-greet text-gray-500 mb-1">
              Please enter or scan your health ID
            </span>
            <span className="text-xl md:text-3xl font-greet text-gray-500">
              to proceed securely.
            </span>
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col sm:flex-row justify-center w-full max-w-3xl gap-6 md:gap-10 mb-8 px-4">
          {/* Scan Action */}
          <button className="h-48 w-full sm:w-48 md:h-56 md:w-56 bg-blue-950 hover:bg-blue-900 transition-colors flex flex-col items-center justify-center rounded-2xl group shadow-sm">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-blue-900 group-hover:bg-blue-800 transition-colors flex items-center justify-center mb-3">
              <QrCode className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <span className="text-white text-xl md:text-2xl font-greet font-semibold">
              Scan
            </span>
            <span className="text-white text-xl md:text-2xl font-greet font-bold">
              TOKEN ID
            </span>
          </button>

          {/* Enter Action */}
          <button className="h-48 w-full sm:w-48 md:h-56 md:w-56 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 group shadow-sm">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors flex items-center justify-center mb-3">
              <Keyboard className="h-8 w-8 md:h-10 md:w-10 text-blue-950" />
            </div>
            <span className="text-blue-950 text-xl md:text-2xl font-greet font-semibold">
              Enter
            </span>
            <span className="text-blue-950 text-xl md:text-2xl font-greet font-bold">
              TOKEN ID
            </span>
          </button>
        </div>

        {/* Fallback Action */}
        <button className="h-14 w-full max-w-[320px] bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center rounded-2xl cursor-pointer">
          <div className="flex items-center gap-2">
            <UserRoundX className="text-gray-600 w-5 h-5" />
            <span className="font-greet text-base md:text-lg text-gray-600 font-bold">
              I don't have a TOKEN ID
            </span>
          </div>
        </button>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-100 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row justify-between items-center p-4 md:px-8 md:py-6 max-w-7xl mx-auto gap-2">
          {/* Back Button */}
          <button className="flex items-center justify-center h-12 w-24 md:h-16 md:w-40 border-2 border-blue-950 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-blue-950 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1 md:ml-2 font-bold font-greet text-sm md:text-xl text-blue-950">
              Back
            </span>
          </button>

          {/* Step Indicator */}
          <div className="flex flex-col justify-center items-center text-center">
            <span className="text-xs md:text-sm font-greet text-gray-500 font-bold tracking-wider">
              STEP 1 OF 5
            </span>
            <span className="text-base sm:text-lg md:text-3xl font-greet text-blue-950 font-bold">
              IDENTITY
            </span>
          </div>

          {/* Next Button */}
          <button className="flex items-center justify-center h-12 w-24 md:h-16 md:w-40 bg-blue-950 rounded-xl hover:bg-blue-900 transition-colors group cursor-pointer">
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

export default Auth;
