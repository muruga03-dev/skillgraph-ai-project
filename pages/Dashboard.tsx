
import React from 'react';
import { AppState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  state: AppState;
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigate }) => {
  const { user, analysis, studyPlan } = state;

  const chartData = [
    { name: 'Matching', value: analysis?.matchingSkills?.length || 0, color: '#10b981' },
    { name: 'Missing', value: analysis?.missingSkills?.length || 0, color: '#f59e0b' },
    { name: 'Total Detected', value: analysis?.detectedSkills?.length || 0, color: '#6366f1' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-black mb-4">Hello, {user?.name?.split(' ')[0] || 'User'}!</h2>
          <p className="text-indigo-100 text-lg lg:text-xl opacity-90 leading-relaxed">
            {analysis 
              ? `You're currently a ${analysis.matchPercentage}% match for ${analysis.predictedRole}. Ready to level up your career?`
              : "Let's start by analyzing your skills. Upload your resume or enter them manually to see where you stand."
            }
          </p>
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => onNavigate('analysis')}
              className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
            >
              {analysis ? 'Re-analyze' : 'Start Analysis'}
            </button>
            {analysis && (
              <button 
                onClick={() => onNavigate('study-plan')}
                className="bg-indigo-500/30 backdrop-blur-md text-white border border-indigo-400/50 px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500/50 transition-all"
              >
                View Study Plan
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none hidden lg:block">
          <i className="fas fa-rocket text-[15rem] translate-x-12 translate-y-12 rotate-12"></i>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-gray-500 font-medium mb-2 uppercase text-xs tracking-widest">Skill Match Rating</h3>
            <div>
              <span className="text-5xl font-black text-indigo-600">{analysis?.matchPercentage || 0}%</span>
              <p className="text-gray-500 mt-2">Calculated for {analysis?.predictedRole || 'N/A'}</p>
            </div>
            <div className="mt-6 w-full bg-gray-100 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${analysis?.matchPercentage || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-gray-500 font-medium mb-6 uppercase text-xs tracking-widest">Skill Inventory Distribution</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm sm:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Recent Learning Milestones</h3>
              <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
            </div>
            {studyPlan && Array.isArray(studyPlan) && studyPlan.length > 0 ? (
              <div className="space-y-4">
                {studyPlan.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4">
                      <i className="fas fa-book text-indigo-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item?.skill || 'Untitled Skill'}</p>
                      <p className="text-sm text-gray-500">{item?.estimatedTime} • {item?.difficulty}</p>
                    </div>
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">In Progress</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <i className="fas fa-layer-group text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No active study plans found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Career Assistant Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[2rem] p-8 text-white h-full flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-robot text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">Career AI Assistant</h3>
              <p className="text-indigo-200 leading-relaxed mb-6">
                Have a question about your study plan or need interview tips? I'm here to help 24/7.
              </p>
              <div className="space-y-3">
                <div className="bg-white/10 p-3 rounded-xl text-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                  "How should I prepare for a React interview?"
                </div>
                <div className="bg-white/10 p-3 rounded-xl text-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                  "What's the demand for Cloud Architects?"
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('assistant')}
              className="mt-8 bg-indigo-500 text-white w-full py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
