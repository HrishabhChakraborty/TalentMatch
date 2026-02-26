import React, { useEffect, useState } from 'react';
import { BarChart3, Brain, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ComparisonModal = ({ onClose, selectedIds, candidates, roleDescription }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const runComparison = async () => {
      if (!token || !selectedIds?.length) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/candidates/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roleDescription: roleDescription || '',
            candidateIds: selectedIds,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to run AI comparison');
        }

        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to run AI comparison');
      } finally {
        setLoading(false);
      }
    };

    runComparison();
  }, [token, selectedIds, roleDescription]);

  const byId = new Map(candidates.map((c) => [c.id, c]));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 rounded-2xl border border-emerald-500/30 max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-emerald-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">AI Comparative Analysis</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-bold text-lg mb-1">AI Recommendation</h3>
                <p className="text-gray-300 text-sm">
                  The candidates below are ranked by your local AI model based on the role description and their
                  experience, skills, and location.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-400 text-sm">Running AI comparison...</div>
          ) : results.length === 0 ? (
            <div className="text-gray-400 text-sm">
              No comparison data available. Try selecting a few candidates and ensuring a clear role description.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res, index) => {
                const base = byId.get(res.id) || {};
                return (
                  <div
                    key={res.id}
                    className="bg-gray-900/70 rounded-xl border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-xs">{index + 1}.</span>
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {base.name || 'Candidate'} — {base.title}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">
                        {base.location} • {base.experience}
                      </p>
                      <p className="text-emerald-300 text-xs sm:text-sm">
                        {res.aiInsight || base.aiInsight || 'AI insight not available.'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                        <span className="text-emerald-400 text-sm font-semibold">
                          {Number(res.matchScore ?? res.score) || 0}% match
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;