// src/components/Navigation.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, Bell } from 'lucide-react';

const Navigation = ({ userType, setUserType, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRecruiter = userType === 'recruiter';
  const currentPath = location.pathname;

  const handleLogout = () => {
    // Clear everything
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');

    // Call parent logout handler (resets state in App.jsx)
    if (onLogout) {
      onLogout();
    }

    // Redirect to login
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/60 backdrop-blur-md border-b border-emerald-500/20 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TalentMatch AI</span>
          </div>

          <div className="flex items-center gap-6">
            {isRecruiter ? (
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('/recruiter/search')}
                  className={`${currentPath === '/recruiter/search' ? 'text-emerald-400' : 'text-gray-400'} hover:text-emerald-400 transition-colors`}
                >
                  Search Talent
                </button>
                <button
                  onClick={() => navigate('/recruiter/saved')}
                  className={`${currentPath === '/recruiter/saved' ? 'text-emerald-400' : 'text-gray-400'} hover:text-emerald-400 transition-colors`}
                >
                  Saved
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => navigate('/candidate/profile')}
                  className={`${currentPath === '/candidate/profile' ? 'text-emerald-400' : 'text-gray-400'} hover:text-emerald-400 transition-colors`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => navigate('/candidate/visibility')}
                  className={`${currentPath === '/candidate/visibility' ? 'text-emerald-400' : 'text-gray-400'} hover:text-emerald-400 transition-colors`}
                >
                  Visibility
                </button>
              </div>
            )}

            {/* Role Switcher */}
            {/* <select
              value={userType}
              onChange={(e) => {
                const newType = e.target.value;
                setUserType(newType);
                navigate(newType === 'recruiter' ? '/recruiter/search' : '/candidate/profile');
              }}
              className="bg-gray-800/80 text-white px-4 py-2 rounded-lg border border-emerald-500/30 outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="recruiter">Recruiter View</option>
              <option value="candidate">Candidate View</option>
            </select> */}

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-emerald-500/10 transition-colors">
              <Bell className="w-6 h-6 text-emerald-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
            </button>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all border border-red-500/40 flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;