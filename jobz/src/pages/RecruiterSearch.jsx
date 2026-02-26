import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, User, Briefcase, MapPin, Star, Zap } from 'lucide-react';
import ComparisonModal from '../components/ComparisonModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const RecruiterSearch = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Any');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('Any');
  const [loadingInsightId, setLoadingInsightId] = useState(null);
  const [insightOverrides, setInsightOverrides] = useState({});

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const checkRecruiterProfile = async () => {
      if (!token) {
        setCheckingProfile(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/me/recruiter-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setCheckingProfile(false);
          return;
        }
        const data = await response.json();
        const missing = data == null || !(data.companyName && data.jobTitle);
        if (missing) navigate('/recruiter/onboarding', { replace: true });
      } catch {
        // allow search page to show on error; user can retry
      } finally {
        setCheckingProfile(false);
      }
    };
    checkRecruiterProfile();
  }, [token, navigate]);

  const fetchCandidates = async (body) => {
    setSearching(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Please log in again' : 'Failed to fetch candidates');
      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setCandidates([]);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates({
      roleDescription: roleDescription.trim(),
      experienceLevel: experienceLevel !== 'Any' ? experienceLevel : undefined,
      location: location.trim() || undefined,
    });
  };

  const fetchInsight = async (candidateId) => {
    if (!token) return;
    setLoadingInsightId(candidateId);
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateId,
          roleDescription: roleDescription.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to get AI insight');
      const data = await response.json();
      setInsightOverrides((prev) => ({
        ...prev,
        [candidateId]: {
          insight: data.insight ?? '',
          matchScore: data.matchScore ?? 0,
        },
      }));
    } catch (err) {
      setInsightOverrides((prev) => ({
        ...prev,
        [candidateId]: {
          insight: err.message || 'Could not load AI insight.',
          matchScore: 0,
        },
      }));
    } finally {
      setLoadingInsightId(null);
    }
  };

  return (
    <>
      {checkingProfile ? (
        <div className="pt-24 px-6 pb-12 text-center text-gray-400">Loading...</div>
      ) : (
      <>
      <div className="pt-20 px-4 pb-12 sm:pt-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">AI-Powered Talent Search</h1>
            </div>
            <p className="text-gray-400 text-base sm:text-lg mb-6">
              Describe the role you're hiring for and let AI find the best matches
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-center text-sm">
                {error}
              </div>
            )}

            {/* Search Form */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <form onSubmit={handleSearch} className="space-y-5">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Role Description</label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="e.g., Looking for a Senior Frontend Developer with 5+ years experience in React, TypeScript, and system design..."
                    className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Experience Level</label>
                    <div className="relative">
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 pr-10 text-white outline-none appearance-none text-sm sm:text-base"
                      >
                        <option>Any</option>
                        <option>Entry (0-2 years)</option>
                        <option>Mid (3-5 years)</option>
                        <option>Senior (5-8 years)</option>
                        <option>Lead (8+ years)</option>
                      </select>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Remote, Hybrid, or City"
                      className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Availability</label>
                    <div className="relative">
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 pr-10 text-white outline-none appearance-none text-sm sm:text-base"
                      >
                        <option>Any</option>
                        <option>Immediate</option>
                        <option>2 weeks notice</option>
                        <option>1 month notice</option>
                      </select>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Zap className="w-5 h-5" />
                  {searching ? 'Searching...' : 'Search with AI'}
                </button>
              </form>
            </div>
          </div>

          {/* Top Matches Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Top Matches</h2>
            <button
              onClick={() => setShowComparison(true)}
              disabled={selectedProfiles.length < 2}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                selectedProfiles.length >= 2
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-gray-800/40 text-gray-600 border border-gray-700/40 cursor-not-allowed'
              }`}
            >
              Compare Selected ({selectedProfiles.length})
            </button>
          </div>

          {/* Candidate Cards */}
          {searching ? (
            <div className="text-center py-12 text-gray-400">Searching...</div>
          ) : !hasSearched ? (
            <div className="text-center py-12 text-gray-400">
              Enter your criteria above and click <span className="text-emerald-400 font-semibold">Search with AI</span> to find candidates.
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No candidates match your search. Try different keywords or filters.</div>
          ) : (
          <div className="space-y-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedProfiles.includes(candidate.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProfiles([...selectedProfiles, candidate.id]);
                      } else {
                        setSelectedProfiles(selectedProfiles.filter((id) => id !== candidate.id));
                      }
                    }}
                    className="w-5 h-5 mt-1 cursor-pointer accent-emerald-500"
                  />

                  {/* Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                      <div className="text-center sm:text-left">
                        <h3 className="text-white font-bold text-lg sm:text-xl mb-1">{candidate.name}</h3>
                        <p className="text-gray-400 text-sm sm:text-base mb-2">{candidate.title}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {candidate.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {candidate.location}
                          </span>
                        </div>
                      </div>

                      {/* Match Score - show percentage only after AI insight is fetched */}
                      <div className="flex flex-col items-center sm:items-end gap-2 mx-auto sm:mx-0">
                        <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40">
                          <Brain className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold text-lg sm:text-xl">
                            {insightOverrides[candidate.id] != null
                              ? `${insightOverrides[candidate.id].matchScore}%`
                              : '—'}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-400">AI Match</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                      {(candidate.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs sm:text-sm border border-emerald-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* AI Insight - only show insight text after user clicks "Get AI Insight" */}
                    <div className="bg-black/40 rounded-xl p-4 mb-4 border border-emerald-500/20">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          {insightOverrides[candidate.id] == null ? (
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => fetchInsight(candidate.id)}
                                disabled={loadingInsightId === candidate.id}
                                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                              >
                                {loadingInsightId === candidate.id ? 'Loading...' : 'Get AI Insight'}
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                <p className="text-emerald-400 font-semibold text-sm">AI Insight</p>
                                <button
                                  type="button"
                                  onClick={() => fetchInsight(candidate.id)}
                                  disabled={loadingInsightId === candidate.id}
                                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                >
                                  {loadingInsightId === candidate.id ? 'Loading...' : 'Refresh'}
                                </button>
                              </div>
                              <p className="text-gray-300 text-xs sm:text-sm">
                                {insightOverrides[candidate.id].insight}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 text-center sm:text-left">Key Highlights:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(candidate.highlights || []).map((highlight) => (
                          <div key={highlight} className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                            <Star className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base"
                      >
                        View Full Profile
                      </button>
                      <button className="flex-1 px-4 py-2 sm:py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold transition-all border border-emerald-500/30 text-sm sm:text-base">
                        Save
                      </button>
                      <button className="flex-1 px-4 py-2 sm:py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold transition-all border border-emerald-500/30 text-sm sm:text-base">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
      </>
      )}

      {showComparison && (
        <ComparisonModal
          onClose={() => setShowComparison(false)}
          selectedIds={selectedProfiles}
          candidates={candidates}
          roleDescription={roleDescription}
        />
      )}
    </>
  );
};

export default RecruiterSearch;