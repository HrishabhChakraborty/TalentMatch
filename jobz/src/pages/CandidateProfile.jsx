import React from 'react';
import { User, Brain } from 'lucide-react';

const CandidateProfile = () => (
  <div className="pt-24 px-6 pb-12">
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">John Doe</h2>
              <p className="text-gray-400 mb-4">Senior Full Stack Developer</p>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all">
                  Edit Profile
                </button>
                <button className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold transition-all border border-emerald-500/30">
                  Preview
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/20 px-6 py-3 rounded-xl border border-emerald-500/40">
            <p className="text-emerald-400 text-sm mb-1">Profile Strength</p>
            <p className="text-white text-2xl font-bold">78%</p>
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-start gap-2">
            <Brain className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold text-sm mb-1">AI Suggestions to Improve Profile</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Add quantifiable achievements (e.g., "Increased performance by 40%")</li>
                <li>• Include links to GitHub or portfolio</li>
                <li>• Add 3-5 more relevant skills</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-white font-semibold mb-4">Visibility Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
              <span className="text-gray-400">Profile Views (30 days)</span>
              <span className="text-white font-bold">124</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
              <span className="text-gray-400">Search Appearances</span>
              <span className="text-white font-bold">47</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl">
              <span className="text-gray-400">Recruiter Contacts</span>
              <span className="text-white font-bold">8</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="text-white font-semibold mb-4">Top Matching Roles</h3>
          <div className="space-y-3">
            {['Senior Frontend Developer', 'Full Stack Engineer', 'Tech Lead'].map((role, i) => (
              <div key={i} className="p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                <p className="text-white font-medium mb-1">{role}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div className="bg-emerald-500 rounded-full h-2" style={{ width: `${95 - i * 5}%` }}></div>
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold">{95 - i * 5}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CandidateProfile;