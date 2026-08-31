/* eslint-disable no-unused-vars */
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const HospitalQRGenerator = () => {
    // Array holding your two demo hospitals
    const hospitals = [
        {
            id: "IN1010012761",
            name: "Indira Gandhi Institute",
            counter: "General OPD"
        },
        {
            id: "IN2020054321", // Make sure to add this ID to your backend database!
            name: "Apollo City Hospital",
            counter: "Emergency & Triage"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            
            <div className="text-center mt-12 mb-10">
                <h1 className="text-3xl font-bold text-blue-950">Demo Reception QR Codes</h1>
                <p className="text-gray-500 text-sm mt-2">Point the app scanner at these codes to test routing.</p>
            </div>

            {/* Flex container to hold the cards side-by-side */}
            <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-4xl">
                
                {hospitals.map((hospital) => (
                    <div key={hospital.id} className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-full border border-gray-100">
                        
                        <h2 className="text-2xl font-bold text-blue-950 mb-1">{hospital.name}</h2>
                        <p className="text-gray-500 text-center text-sm mb-8 font-medium">
                            {hospital.counter}
                        </p>

                        {/* The Actual QR Code */}
                        <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-gray-100 mb-6">
                            <QRCodeSVG 
                                value={hospital.id} // This is the payload the scanner reads!
                                size={200}
                                bgColor={"#ffffff"}
                                fgColor={"#172554"} // Matches your blue-950 theme
                                level={"H"} // High error correction (makes it look denser/cooler)
                                includeMargin={false}
                            />
                        </div>

                        {/* Kept your counter ID box so you know which ID is which during the demo */}
                        <div className="text-center w-full bg-gray-50 py-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Payload ID</p>
                            <p className="font-mono font-bold text-gray-800 tracking-widest">{hospital.id}</p>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    );
};

export default HospitalQRGenerator;