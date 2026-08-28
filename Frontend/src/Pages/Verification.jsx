/* eslint-disable no-unused-vars */
import React from "react";
import { CircleQuestionMark, CircleUser, Globe } from "lucide-react";
import Logo from "../assets/Logo.png";

const Verification = ({Logo, Logotitle,Language,hidden}) => {
  return (
    <div>
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 shadow-sm z-50 bg-white">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-2 md:gap-4">
            <img
              src={Logo}
              className="block w-9 md:w-12 lg:w-14 h-9 md:h-12 lg:h-14 object-contain shrink-0"
              alt="MediKiosk Logo"
            />
            <span className="text-xl md:text-3xl lg:text-4xl font-greet font-bold text-blue-950 leading-none">
              {Logotitle}
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-8 lg:gap-10 text-sm md:text-base text-gray-700">

            <div className={`flex ${hidden} items-center gap-2 cursor-pointer hover:text-blue-950`}>
              <Globe className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <span className={`sm:block font-medium`}>{Language}</span>
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-950">
              <CircleQuestionMark className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <span className="hidden sm:block font-medium">Help</span>
            </div>

            <div className="cursor-pointer hover:text-blue-950">
              <CircleUser className="w-6 h-6 md:w-7 md:h-7" />
            </div>

          </div>
        </div>
      </nav>

      <main className="pt-20 md:pt-24 px-4 md:px-10">
       
      </main>
    </div>
  );
};

export default Verification;