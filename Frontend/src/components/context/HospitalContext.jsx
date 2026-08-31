/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// src/components/context/HospitalContext.jsx
import React, { createContext, useState, useContext } from 'react';

const HospitalContext = createContext();

// MUST have the 'export' keyword here
export const useHospital = () => {
    const context = useContext(HospitalContext);
    if (!context) {
        throw new Error("useHospital must be used within a HospitalProvider");
    }
    return context;
};

// MUST have the 'export' keyword here
export const HospitalProvider = ({ children }) => {
    const [hospitalName, setHospitalName] = useState("Loading...");
    const [hospitalId, setHospitalId] = useState(null);

    return (
        <HospitalContext.Provider value={{ 
            hospitalName, 
            setHospitalName, 
            hospitalId, 
            setHospitalId 
        }}>
            {children}
        </HospitalContext.Provider>
    );
};