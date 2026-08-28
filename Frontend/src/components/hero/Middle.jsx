/* eslint-disable no-unused-vars */
import React from "react";
import Content from "./Content";
import HeroImage from "./HeroImage";
import { MoveRight } from "lucide-react";
import { CircleQuestionMark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Middle = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full justify-items-center p-10 md:p-5">
      <Content />
      <HeroImage />
      <div className="flex">
        <Link to="/second">
          <div className="cursor-pointer h-18 w-40 md:w-60 bg-blue-950 rounded-lg flex justify-center items-center mt-6 mr-3">
            <div className="flex justify-between w-20 font-bold text-white font-robot text-xl md:text-2xl items-center">
              Start
              <MoveRight />
            </div>
          </div>
        </Link>

        <div className="cursor-pointer h-18 w-40 md:w-60 bg-gray-300 rounded-lg flex justify-center items-center mt-6 ml-3">
          <div className="flex justify-between w-20 font-bold text-black font-robot text-xl md:text-2xl items-center">
            <CircleQuestionMark />
            Help
          </div>
        </div>
      </div>
    </div>
  );
};

export default Middle;
