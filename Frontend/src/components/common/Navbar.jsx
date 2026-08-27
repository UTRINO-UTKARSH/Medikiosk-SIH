/* eslint-disable no-unused-vars */
import React from "react";
import LoadingBar from "./LoadingBar";

const Navbar = () => {
  return (
    <div className="w-full h-[10%] flex justify-center sticky top-0 z-50">
      <LoadingBar />
    </div>
  );
};

export default Navbar;
