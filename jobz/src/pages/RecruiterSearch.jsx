import React, { useState } from 'react';
import { Brain, User, Briefcase, MapPin, Star, Zap } from 'lucide-react';
import ComparisonModal from '../components/ComparisonModal';

const RecruiterSearch = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);

  const candidates = [
    {
      name: 'Sarah Chen',
      title: 'Senior Frontend Developer',
      experience: '7 years',
      location: 'Remote',
      matchScore: 95,
      skills: ['React', 'TypeScript', 'System Design', 'Node.js'],
      aiInsight:
        'Exceptional match: Strong system design background, leadership experience, and cutting-edge tech stack',
      highlights: ['Led team of 5', '3 successful product launches', 'Performance optimization expert'],
    },
    {
      name: 'James Rodriguez',
      title: 'Frontend Engineer',
      experience: '6 years',
      location: 'San Francisco, CA',
      matchScore: 92,
      skills: ['React', 'Vue.js', 'JavaScript', 'GraphQL'],
      aiInsight:
        'Great fit: Versatile with multiple frameworks, strong collaborative skills, proven track record',
      highlights: ['Built 2 design systems', 'Mentored juniors', 'Open source contributor'],
    },
    {
      name: 'Emily Watson',
      title: 'Full Stack Developer',
      experience: '5 years',
      location: 'New York, NY',
      matchScore: 88,
      skills: ['React', 'TypeScript', 'Python', 'AWS'],
      aiInsight: 'Strong candidate: Full-stack versatility adds value, rapid learner, startup experience',
      highlights: ['0-1 product builder', 'Scaled to 1M users', 'DevOps proficient'],
    },
  ];

  return (
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

            {/* Search Form */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <div className="space-y-5">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Role Description</label>
                  <textarea
                    placeholder="e.g., Looking for a Senior Frontend Developer with 5+ years experience in React, TypeScript, and system design..."
                    className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 transition-colors min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Experience Level</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 pr-10 text-white outline-none appearance-none text-sm sm:text-base">
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
                      placeholder="Remote, Hybrid, or City"
                      className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/60 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Availability</label>
                    <div className="relative">
                      <select className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 pr-10 text-white outline-none appearance-none text-sm sm:text-base">
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

                <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Zap className="w-5 h-5" />
                  Search with AI
                </button>
              </div>
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
          <div className="space-y-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.name}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedProfiles.includes(candidate.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProfiles([...selectedProfiles, candidate.name]);
                      } else {
                        setSelectedProfiles(selectedProfiles.filter((n) => n !== candidate.name));
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

                      {/* Match Score */}
                      <div className="flex flex-col items-center sm:items-end gap-2 mx-auto sm:mx-0">
                        <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40">
                          <Brain className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold text-lg sm:text-xl">{candidate.matchScore}%</span>
                        </div>
                        <span className="text-xs text-emerald-400">AI Match</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs sm:text-sm border border-emerald-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* AI Insight */}
                    <div className="bg-black/40 rounded-xl p-4 mb-4 border border-emerald-500/20">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-400 font-semibold text-sm mb-1">AI Insight</p>
                          <p className="text-gray-300 text-xs sm:text-sm">{candidate.aiInsight}</p>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-2 text-center sm:text-left">Key Highlights:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {candidate.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
                            <Star className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base">
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
        </div>
      </div>

      {showComparison && <ComparisonModal onClose={() => setShowComparison(false)} />}
    </>
  );
};

export default RecruiterSearch;