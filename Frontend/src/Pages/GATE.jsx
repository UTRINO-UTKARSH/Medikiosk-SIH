/* eslint-disable no-unused-vars */
import React from 'react';
import { QrCode, Bot } from 'lucide-react';
import HospitalQR from '../components/hospital/HospitaQR';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const GATE = () => {
  const [isScanning, setisScanning] = useState(false)
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-12 md:py-30 bg-white">

      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-16">
        <h3 className="text-3xl md:text-5xl text-blue-950 font-greet font-bold mb-3 md:mb-4">
          Welcome to Parchi
        </h3>
        <p className="text-lg md:text-xl text-gray-500 font-greet font-semibold max-w-md">
          Please select an option to begin your session
        </p>
      </div>
      <div className="flex flex-col md:flex-row w-full max-w-5xl justify-center gap-6 md:gap-10 px-4">
        <button onClick={() => {
          setisScanning(true)
        }} className="flex-1 flex flex-col items-center text-center bg-gray-50 border-2 border-gray-200 rounded-3xl p-8 md:p-12 hover:bg-white hover:border-blue-950 hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <div className="h-20 w-20 rounded-full bg-gray-200 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-6">
            <QrCode className="h-10 w-10 text-blue-950" />
          </div>
          <div>
            <h5 className="text-2xl text-blue-950 font-greet font-bold mb-3">
              Scan Hospital QR
            </h5>
            <p className="text-gray-500 font-greet font-medium leading-relaxed">
              Scan your hospital's QR code to link your records and begin your visit seamlessly.
            </p>
          </div>
        </button>
       
          <Link
          to="/ai"
          className="flex-1 flex flex-col items-center text-center bg-[#0F1B2D] border-2 border-blue-950 rounded-3xl p-8 md:p-12 hover:bg-blue-950 hover:border-blue-900 hover:shadow-xl transition-all duration-300 group cursor-pointer"
        >
          <div className="h-20 w-20 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center mb-6">
            <Bot className="h-10 w-10 text-blue-300" />
          </div>

          <div>
            <h5 className="text-2xl text-white font-greet font-bold mb-3">
              Instant AI Summary
            </h5>

            <p className="text-blue-100/80 font-greet font-medium leading-relaxed">
              Speak with our AI to get an immediate summary of your symptoms and suggested remedies.
            </p>
          </div>
        </Link>

      </div>
      <HospitalQR
        isOpen={isScanning}
        onClose={() => setisScanning(false)}
      />
    </div>
  );
};

export default GATE;