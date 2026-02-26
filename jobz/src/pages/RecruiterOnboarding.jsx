import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const RecruiterOnboarding = () => {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industriesHiringFor, setIndustriesHiringFor] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Company name and job title are required.');
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/me/recruiter-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          ...(companySize.trim() && { companySize: companySize.trim() }),
          ...(industriesHiringFor.trim() && { industriesHiringFor: industriesHiringFor.trim() }),
        }),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      navigate('/recruiter/search', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Company & role</h1>
        <p className="text-gray-400 text-sm mb-8">Tell us a bit about your company and your role so we can personalize your experience.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 space-y-6">
          <div>
            <label className="text-gray-400 text-sm block mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Company name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Your job title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Technical Recruiter"
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Company size (optional)</label>
            <input
              type="text"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              placeholder="e.g. 50-200, Startup"
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Industries you hire for (optional)</label>
            <input
              type="text"
              value={industriesHiringFor}
              onChange={(e) => setIndustriesHiringFor(e.target.value)}
              placeholder="e.g. Tech, Healthcare"
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Continue to search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterOnboarding;
