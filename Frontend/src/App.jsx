/* eslint-disable no-unused-vars */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from "react";
import Navbar from "./components/common/Navbar";
import Bottom from "./components/hero/Bottom";
import Middle from "./components/hero/Middle";
import Home from "./Pages/Home";
import Verification from './Pages/Verification';
const AppRoutes = () => {
  return (
    <div className="h-screen w-full bg-gray-100 ">
<<<<<<< HEAD
      <Home/>
      
=======
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/second" element={<Verification/>}/>
      </Routes>
>>>>>>> 612716726fd647e47a8e2364819c69b68ea0723b
    </div>
  )
}
const App = () => {
  return (
    <BrowserRouter>
        <AppRoutes/>
    </BrowserRouter>
  );
};

export default App;
