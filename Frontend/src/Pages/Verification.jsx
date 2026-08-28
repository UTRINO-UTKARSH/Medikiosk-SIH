/* eslint-disable no-unused-vars */
import React from "react";
import Buttons from "../components/common/Buttons";
import { CircleQuestionMark, CircleUser, Globe } from "lucide-react";

const Verification = () => {
  return (
    <div>
      <nav className="fixed h-15 w-full flex items-center justify-between px-4 md:px-10">
        <span className="text-2xl md:text-4xl font-greet font-bold text-blue-950">
          MediKiosk
        </span>
        <div className="flex max-w-full h-full gap-10 md:gap-20 bg-pink-400  items-center">
          <div className="flex">
            <Globe />
            English
          </div>
          <div className="flex">
            <CircleQuestionMark />
            Help
          </div>
          <CircleUser />
        </div>
      </nav>
    </div>
  );
};

export default Verification;
