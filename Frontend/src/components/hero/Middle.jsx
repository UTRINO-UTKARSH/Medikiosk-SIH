/* eslint-disable no-unused-vars */
import React from "react";
import Content from "./Content";
import HeroImage from "./HeroImage";
import { MoveRight } from "lucide-react";
import { CircleQuestionMark } from 'lucide-react';

const Middle = () => {
  return (
    <div className="w-full h-[70%] flex-col justify-center justify-items-center p-4">
      <Content />
      <HeroImage />
      <div className="flex">
        <div className="h-18 w-60 bg-blue-950 rounded-lg justify-items-center content-center mt-6 mr-2">
          <div className="flex justify-between w-20 font-bold text-white font-robot text-xl items-center">
            Start
            <MoveRight />
          </div>
        </div>
        <div className="h-18 w-60 bg-gray-300 rounded-lg border-0.5 justify-items-center content-center mt-6 ml-2">
          <div className="flex justify-between w-20 font-bold text-black font-robot text-xl items-center">
            <CircleQuestionMark />
            Help
          </div>
        </div>
      </div>
    </div>
  );
};

export default Middle;
