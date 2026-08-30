/* eslint-disable no-unused-vars */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from "react";
import Navbar from "./components/common/Navbar";
import Bottom from "./components/hero/Bottom";
import Middle from "./components/hero/Middle";
import Home from "./Pages/Home";
import Verification from './Pages/Verification';
import Dashboard from './Pages/Dashboard';
import Consent from './components/Child Pages/Consent'
const AppRoutes = () => {
  return (
    <div className="h-screen w-full bg-gray-100 ">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/second" element={<Verification/>}/>
        <Route path="/dashboard" element ={<Dashboard/>}/>
        <Route path="/Consent" element ={<Consent/>}/>
      </Routes>
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
