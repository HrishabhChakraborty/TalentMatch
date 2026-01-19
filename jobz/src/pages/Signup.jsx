// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Brain } from 'lucide-react';

// Load API base URL from .env (Vite)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Signup = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('recruiter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic frontend validation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role.toUpperCase(), // backend expects 'RECRUITER' or 'CANDIDATE'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.');
      }

      // Success: store token and role
      localStorage.setItem('token', data.access_token);
      const userRole = data.user?.role?.toLowerCase() || role;
      localStorage.setItem('userRole', userRole);

      console.log('Signup success:', data.user);

      // Switch to authenticated view
      onLogin(userRole);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join TalentMatch AI today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">I want to</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2310b981' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="recruiter">Hire talent (Recruiter)</option>
              <option value="candidate">Find opportunities (Candidate)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;