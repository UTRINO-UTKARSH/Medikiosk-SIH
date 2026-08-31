/* eslint-disable no-unused-vars */
import React from 'react';
import { Camera, ChevronRight, File } from 'lucide-react';

const UploadDocuments = () => {
  return (
    <div className="w-full min-h-full  flex flex-col items-center px-4 py-21 bg-white">
      
      {/* Header Section */}
      <div className="text-center w-full max-w-2xl mb-8 md:mb-12">
        <h3 className="text-3xl md:text-4xl text-blue-950 font-greet font-bold mb-3 md:mb-4">
          Do you have previous medical documents?
        </h3>
        <p className="text-lg md:text-xl text-gray-500 font-greet font-normal px-2">
          You can add prescriptions, reports, or discharge papers to help us understand your medical history better.
        </p>
      </div>
      <div className="flex flex-col w-full max-w-lg gap-4 md:gap-5">
        <button className="w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-2xl flex p-4 md:p-6 items-center justify-between group cursor-pointer text-left border-2 border-transparent focus:border-blue-950 focus:outline-none">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-950 flex items-center justify-center">
              <Camera className="text-white h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <h5 className="text-xl md:text-2xl font-bold text-blue-950 font-greet">
                Take a Photo
              </h5>
              <p className="font-normal text-sm md:text-base text-gray-600 font-greet mt-1">
                Use the Kiosk camera to scan
              </p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-blue-950 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Upload Option */}
        <button className="w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-2xl flex p-4 md:p-6 items-center justify-between group cursor-pointer text-left border-2 border-transparent focus:border-gray-400 focus:outline-none">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-full bg-gray-400 group-hover:bg-gray-500 transition-colors flex items-center justify-center">
              <File className="text-white h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <h5 className="text-xl md:text-2xl font-bold text-blue-950 font-greet">
                Upload Document
              </h5>
              <p className="font-normal text-sm md:text-base text-gray-600 font-greet mt-1">
                From a USB drive or a mobile device
              </p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-blue-950 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Skip Button */}
        <button className="w-full mt-2 h-14 md:h-16 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200">
          <span className="text-lg md:text-xl font-greet text-gray-700 font-bold">
            Skip for now
          </span>
        </button>
        
      </div>
    </div>
  );
};

export default UploadDocuments;