// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RecruiterSearch from './pages/RecruiterSearch';
import SavedCandidates from './pages/SavedCandidates';
import CandidateProfile from './pages/CandidateProfile';
import Visibility from './pages/Visibility';

// Use .env variable (Vite prefix)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('recruiter');
  const [loadingAuth, setLoadingAuth] = useState(true); // Start as true to show loading

  // Check token validity on mount (page load / refresh)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      // No token → not authenticated
      if (!token) {
        setIsAuthenticated(false);
        setLoadingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Token validation failed: ${response.status}`);
        }

        const data = await response.json();

        // Success: update state with real data from backend
        setUserType(data.role?.toLowerCase() || 'recruiter');
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err.message);
        // Clear invalid token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        // Always finish loading
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, []); // Empty array: run ONLY once on mount/refresh

  // Handle successful login (called from Login/Signup pages)
  const handleLogin = (type) => {
    setIsAuthenticated(true);
    setUserType(type);
    // Optional: save role in localStorage for extra safety
    localStorage.setItem('userRole', type);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserType('recruiter');
    // Force reload to ensure clean state (optional but reliable)
    window.location.href = '/login';
  };

  // Show loading screen while checking auth (prevents flash of login page)
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-xl animate-pulse">
          Verifying session...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {isAuthenticated ? (
          <>
            <Navigation 
              userType={userType} 
              setUserType={setUserType} 
              onLogout={handleLogout} // Pass logout function
            />
            <Routes>
              <Route path="/recruiter/search" element={<RecruiterSearch />} />
              <Route path="/recruiter/saved" element={<SavedCandidates />} />
              <Route path="/candidate/profile" element={<CandidateProfile />} />
              <Route path="/candidate/visibility" element={<Visibility />} />
              <Route
                path="*"
                element={<Navigate to={userType === 'recruiter' ? '/recruiter/search' : '/candidate/profile'} replace />}
              />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;