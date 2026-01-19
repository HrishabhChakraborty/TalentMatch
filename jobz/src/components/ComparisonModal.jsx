import React from 'react';
import { BarChart3, Brain, TrendingUp, Award, Zap, X } from 'lucide-react';

const ComparisonModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
    <div className="bg-gray-900 rounded-2xl border border-emerald-500/30 max-w-6xl w-full max-h-[90vh] overflow-auto">
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-emerald-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">AI Comparative Analysis</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 rounded-xl p-6 border border-emerald-500/30 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-white font-bold text-lg mb-2">AI Recommendation</h3>
              <p className="text-gray-300">
                Based on your role requirements and comprehensive analysis of experience quality, technical depth, and cultural fit:
              </p>
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-emerald-500/20">
            <p className="text-emerald-400 font-semibold mb-2">Top Pick: Sarah Chen</p>
            <p className="text-gray-300 text-sm">
              Sarah demonstrates the strongest combination of technical leadership, system design expertise, and proven
              ability to scale teams. Her experience leading 5 engineers and shipping 3 major products aligns perfectly
              with your need for a senior technical leader.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-gray-400 font-semibold">Criteria</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-4 border border-emerald-500/30">
            <p className="text-white font-bold">Sarah Chen</p>
            <p className="text-emerald-400 text-sm">95% Match</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-4 border border-emerald-500/20">
            <p className="text-white font-bold">James Rodriguez</p>
            <p className="text-emerald-400 text-sm">92% Match</p>
          </div>

          <div className="bg-gray-800/40 rounded-xl p-4">
            <p className="text-gray-300 font-semibold">Technical Skills</p>
          </div>
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-bold">9.5/10</span>
            </div>
            <p className="text-gray-400 text-sm">Expert in React, TypeScript, System Design. Advanced Node.js</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-white font-bold">8.8/10</span>
            </div>
            <p className="text-gray-400 text-sm">Strong React, Vue.js versatility. GraphQL expertise</p>
          </div>

          <div className="bg-gray-800/40 rounded-xl p-4">
            <p className="text-gray-300 font-semibold">Leadership</p>
          </div>
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-bold">9.2/10</span>
            </div>
            <p className="text-gray-400 text-sm">Led team of 5, mentored 8+ developers, drove architecture decisions</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-gray-400" />
              <span className="text-white font-bold">7.5/10</span>
            </div>
            <p className="text-gray-400 text-sm">Mentored juniors, collaborative contributor</p>
          </div>

          <div className="bg-gray-800/40 rounded-xl p-4">
            <p className="text-gray-300 font-semibold">Business Impact</p>
          </div>
          <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-bold">9.8/10</span>
            </div>
            <p className="text-gray-400 text-sm">3 successful launches, 40% performance improvement</p>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-gray-400" />
              <span className="text-white font-bold">8.5/10</span>
            </div>
            <p className="text-gray-400 text-sm">2 design systems, improved dev velocity</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Proceed with Sarah Chen
          </button>
          <button className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold transition-all border border-emerald-500/30">
            View All Details
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ComparisonModal;