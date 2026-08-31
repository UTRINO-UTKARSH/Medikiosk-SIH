import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import React from "react";
import Navbar from "./components/common/Navbar";
import Home from "./Pages/Home";
import Verification from './Pages/Verification';
import GATE from './Pages/GATE';
import Consent from './components/Child Pages/Consent';
import From from './components/common/From';
import Login from './components/Auth/Login';
import { useToast } from './components/common/Toast';
import HospitalQRGenerator from './components/hospital/HospitalQRGEN';
import AI from './Pages/AI';
import UploadDocuments from './Pages/UploadDocuments';
import UserDash from './components/User-dash/UserDash';

const publicRoutes = ['/', '/auth', '/login','/user-dash'];

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users/check-auth', {
          credentials: 'include'
        });
        const data = await response.json();

        if (isMounted) {
          setIsAuthenticated(response.ok && data.authenticated);
          setIsChecking(false);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      toast.info('Please authenticate first to continue.');
      navigate('/auth', { replace: true });
    }
  }, [isChecking, isAuthenticated, navigate, toast]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return children;
};

const AppContent = () => { 
  const { pathname } = useLocation();
  const showNavbar = !publicRoutes.includes(pathname.toLowerCase());
  
  return (
    <div className="h-screen w-full bg-gray-100 ">
      {showNavbar && <Navbar showHelp={true} showLanguage={true} showUser={true} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Verification />} />
        
        <Route path="/login" element={<Login />} />

       
        <Route path="/profile" element={<ProtectedRoute><From /></ProtectedRoute>} />

        {/* Protected Routes - Common for Both Flows */}
        <Route path="/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><GATE /></ProtectedRoute>} />
        <Route path="/user-dash" element={<ProtectedRoute><UserDash /></ProtectedRoute>} />

        {/* Protected Routes - Other Features */}
        <Route path="/upload" element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute><HospitalQRGenerator /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;