/* eslint-disable no-unused-vars */
import React from "react";
import Navbar from "./components/common/Navbar";
import Bottom from "./components/hero/Bottom";
import Middle from "./components/hero/Middle";

const App = () => {
  return (
    <div className="parent h-screen w-full bg-gray-100 content-">
      <Navbar />
      <Middle />
      <Bottom />
    </div>
  );
};

export default App;
