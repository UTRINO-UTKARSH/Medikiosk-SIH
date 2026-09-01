/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useToast } from '../common/Toast';

export const useHospitalScanner = (onTokenSuccess) => {
    const toast = useToast();

    const [isScanning, setIsScanning] = useState(true);
    const [hospitalDetails, setHospitalDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    // 1. Handle Camera Scan
    const handleScan = (result) => {
        if (result && result.length > 0) {
            setIsScanning(false);
            const scannedId = result[0].rawValue;
            fetchHospitalDetails(scannedId);
        }
    };

    // 2. Fetch API
    const fetchHospitalDetails = async (hospitalId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${hospitalId}`, {
                method: "GET"
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Hospital not found");

            setHospitalDetails(data.hospital);
            toast.success("Hospital found!");
        } catch (error) {
            toast.error(error.message);
            setIsScanning(true);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Submit Token
    const handleGetToken = async () => {
        try {
            // Future POST request goes here
            toast.success("Token generated! Session started.");

            // Execute callback if provided (e.g., to navigate pages)
            if (onTokenSuccess) onTokenSuccess();
        } catch (error) {
            toast.error("Failed to generate token");
        }
    };

    // 4. Reset function for the Cancel button
    const resetScanner = () => {
        setHospitalDetails(null);
        setIsScanning(true);
    };

    return {
        isScanning,
        isLoading,
        hospitalDetails,
        handleScan,
        handleGetToken,
        resetScanner
    };
};