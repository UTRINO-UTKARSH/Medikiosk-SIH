/* eslint-disable no-unused-vars */
import React from "react";
import Navbar from "../components/common/Navbar";
import Bottom from "../components/hero/Bottom";
import Middle from "../components/hero/Middle";

const Home = () => {
  return (
    <div className="h-full w-full bg-gray-100 ">
      <Middle />
      <Bottom />
    </div>
  );
};

export default Home;
