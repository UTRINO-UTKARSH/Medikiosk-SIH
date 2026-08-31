import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import React from "react";
import Navbar from "./components/common/Navbar";
import Home from "./Pages/Home";
import Verification from './Pages/Verification';
import Dashboard from './Pages/Dashboard';
import Consent from './components/Child Pages/Consent';
import From from './components/common/From';
import { useToast } from './components/common/Toast';
import HospitalQRGenerator from './components/hospital/HospitalQRGEN';
import AI from './Pages/AI'
const publicRoutes = ['/', '/auth', '/login'];

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

  if (isChecking || !isAuthenticated) return null;
  return children;
};

const App = () => { 
  const { pathname } = useLocation();
  const showNavbar = !publicRoutes.includes(pathname.toLowerCase());
  
  return (
    <div className="h-screen w-full bg-gray-100 ">
      {showNavbar && <Navbar showHelp={true} showLanguage={true} showUser={true} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Verification />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/qr" element={<HospitalQRGenerator/>}/>
        <Route path="/profile" element={<ProtectedRoute><From /></ProtectedRoute>} />
        <Route path="/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
        <Route path="/Consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;