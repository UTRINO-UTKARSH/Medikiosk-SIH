/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import Auth2 from "../components/Auth/Auth2";

const Verification = () => {
  const navigate = useNavigate();

  const handleVerified = (data) => {
    if (data.isNewUser) { 
      navigate("/profile");
    } else { 
      navigate("/login");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center pt-10">
      <Auth2 onVerified={handleVerified} />
    </main>
  );
};

export default Verification;