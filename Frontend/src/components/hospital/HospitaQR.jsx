/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useHospitalScanner } from '../hooks/useHospitalScanner'; // Adjust path as needed
import { useNavigate } from 'react-router-dom'; // Changed from Link
import { useHospital } from '../context/HospitalContext'; // 1. Import your new Context Hook
import { useTranslation } from 'react-i18next';

const HospitalQR = ({ isOpen, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setHospitalName, setHospitalId } = useHospital(); // 2. Access the memory vault

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

    useEffect(() => {
        if (!isOpen) {
            resetScanner();
        }
    }, [isOpen, resetScanner]);

    if (!isOpen) return null;

    // 3. New function to handle the Continue action securely
    const onContinue = async () => {
        // Save the scanned details directly to global memory
        if (hospitalDetails) {
            setHospitalName(hospitalDetails.name);
            // Prefer the hospital's own canonical hospitalId; only fall back
            // to counterId/hipId if it's somehow missing from the payload.
            const hospitalId = hospitalDetails.hospitalId || hospitalDetails.counterId || hospitalDetails.hipId;
            setHospitalId(hospitalId);
            
            // Save hospital ID to database
            try {
                const response = await fetch(`${API_URL}/api/users/hospital`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ hospitalId: hospitalId })
                });

                if (!response.ok) {
                    console.error('Failed to save hospital ID to database');
                }
            } catch (error) {
                console.error('Error saving hospital:', error);
            }
        }

        // Fire your existing token generation logic
        await handleGetToken(); 
        
        // Navigate to the dashboard programmatically
        navigate('/user-dash');
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="p-10 text-center font-bold text-blue-950">{t('hospitalQR.fetchingHospital')}</div>;
        }

        if (hospitalDetails) {
            return (
                <div className="w-full">
                    <h2 className="text-xl font-bold text-blue-950 mb-4 border-b pb-2">{t('hospitalQR.shareProfile')}</h2>
                    
                    <div className="mb-6">
                        <p className="text-sm text-gray-500">{t('hospitalQR.sharingWith')}</p>
                        <p className="font-bold text-lg">{hospitalDetails.name}</p>
                        <p className="text-sm text-gray-700 mt-2">{hospitalDetails.address}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span>{t('hospitalQR.counterId')} {hospitalDetails.counterId}</span>
                            <span>{t('hospitalQR.hipId')} {hospitalDetails.hipId}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* 4. Swapped <Link> for a standard button onClick */}
                        <button 
                            onClick={onContinue}
                            className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition"
                        >
                            {t('hospitalQR.continue')}
                        </button>
                        <button 
                            onClick={resetScanner}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
                        >
                            {t('hospitalQR.cancel')}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full">
                <h2 className="text-xl font-bold text-center text-blue-950 mb-4">{t('hospitalQR.title')}</h2>
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
                    {t('hospitalQR.scanInstruction')}
                </p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200">
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