/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useHospitalScanner } from '../hooks/useHospitalScanner'; // Adjust path as needed
import { Link } from 'react-router-dom';

const HospitalQR = ({ isOpen, onClose }) => {
    const { 
        isScanning, 
        isLoading, 
        hospitalDetails, 
        handleScan, 
        handleGetToken, 
        resetScanner 
    } = useHospitalScanner(() => {
        onClose();
    }); 

    // 2. Clean up the scanner state whenever the modal closes
    useEffect(() => {
        if (!isOpen) {
            resetScanner();
        }
    }, [isOpen,resetScanner]);

    // 3. The most important part: If it's not open, render absolutely nothing!
    if (!isOpen) return null;

    // Helper function to render the inner content based on state
    const renderContent = () => {
        if (isLoading) {
            return <div className="p-10 text-center font-bold text-blue-950">Fetching Hospital Details...</div>;
        }

        if (hospitalDetails) {
            return (
                <div className="w-full">
                    <h2 className="text-xl font-bold text-blue-950 mb-4 border-b pb-2">Share Profile</h2>
                    
                    <div className="mb-6">
                        <p className="text-sm text-gray-500">Sharing your details with:</p>
                        <p className="font-bold text-lg">{hospitalDetails.name}</p>
                        <p className="text-sm text-gray-700 mt-2">{hospitalDetails.address}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>Counter ID: {hospitalDetails.counterId}</span>
                            <span>HIP ID: {hospitalDetails.hipId}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/user-dash">
                        <button 
                            onClick={handleGetToken}
                            className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
                        >
                            Continue
                        </button></Link>
                        <button 
                            onClick={resetScanner}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full">
                <h2 className="text-xl font-bold text-center text-blue-950 mb-4">Scan Hospital QR</h2>
                <div className="rounded-2xl overflow-hidden border-4 border-blue-950 aspect-square">
                    {isScanning && (
                        <Scanner 
                            onScan={handleScan}
                            onError={(error) => console.log(error?.message)}
                            components={{ audio: false, finder: true }}
                        />
                    )}
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                    Point your camera at the hospital's QR code to link your records.
                </p>
            </div>
        );
    };

    // 4. Wrap everything in a Modal Backdrop
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Dark Backdrop that closes the modal when clicked */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose} 
            />

            {/* Modal Content Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10 text-xl font-bold"
                >
                    ✕
                </button>
                
                {renderContent()}
            </div>
        </div>
    );
};

export default HospitalQR;