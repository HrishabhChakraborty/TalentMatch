import React, { useState } from 'react';
import { Brain } from 'lucide-react';

// Load from .env (Vite prefix)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Success: store token and role
      localStorage.setItem('token', data.access_token);

      // Use real role from backend (safer than frontend guess)
      const userRole = data.user?.role?.toLowerCase() || 'recruiter';
      localStorage.setItem('userRole', userRole);

      console.log('Login success:', data.user);

      // Trigger authenticated state in App
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
          <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-gray-400">Access your TalentMatch AI account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;