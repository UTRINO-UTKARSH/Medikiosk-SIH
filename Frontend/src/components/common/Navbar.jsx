/* eslint-disable no-unused-vars */
import React from "react";
import LoadingBar from "./LoadingBar";
import { CircleQuestionMark } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="w-full h-[5%] flex justify-center relative">
      <CircleQuestionMark />
      <LoadingBar />
    </div>
  );
};

export default Navbar;
