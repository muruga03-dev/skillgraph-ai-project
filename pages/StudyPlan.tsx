
import React, { useState, useEffect } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { StudyPlanItem, SkillAnalysis } from '../types';

interface StudyPlanProps {
  analysis: SkillAnalysis | null;
  currentPlan: StudyPlanItem[] | null;
  onPlanGenerated: (plan: StudyPlanItem[]) => void;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ analysis, currentPlan, onPlanGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (analysis && !currentPlan && !isLoading) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis]);

  const handleGenerate = async () => {
    if (!analysis) return;
    setIsLoading(true);
    try {
      const plan = await generateStudyPlan(analysis.missingSkills || [], analysis.predictedRole || 'Target Role');
      onPlanGenerated(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 max-w-3xl mx-auto px-10">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
          <i className="fas fa-route"></i>
        </div>
        <h3 className="text-2xl font-black mb-4">No Analysis Data Found</h3>
        <p className="text-gray-500 mb-8">Please run a skill analysis first so we can determine what you need to learn.</p>
        <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-indigo-200">Go to Analysis</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black mb-2 text-gray-900">Your Learning Roadmap</h2>
          <p className="text-gray-500 font-medium">Personalized plan to become a proficient <span className="text-indigo-600 font-bold">{analysis.predictedRole || 'Professional'}</span></p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center shadow-lg hover:shadow-indigo-200"
        >
          <i className={`fas ${isLoading ? 'fa-spinner animate-spin' : 'fa-sync'} mr-2`}></i>
          {isLoading ? 'Regenerating...' : 'Refresh Plan'}
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 animate-pulse">
              <div className="h-8 bg-gray-100 rounded-full w-48 mb-6"></div>
              <div className="h-4 bg-gray-100 rounded-full w-full mb-4"></div>
              <div className="h-4 bg-gray-100 rounded-full w-2/3"></div>
            </div>
          ))
        ) : (
          (currentPlan || []).map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              {/* Difficulty Tag */}
              <div className="absolute top-0 right-0">
                <div className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-bl-3xl text-white ${
                  item.difficulty === 'Advanced' ? 'bg-red-500' : 
                  item.difficulty === 'Intermediate' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  {item.difficulty || 'Beginner'}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                      {idx + 1}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{item.skill || 'Untitled Skill'}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  <div className="flex items-center space-x-6 text-sm font-bold text-gray-400">
                    <div className="flex items-center">
                      <i className="far fa-clock mr-2 text-indigo-500"></i>
                      {item.estimatedTime || 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-layer-group mr-2 text-indigo-500"></i>
                      Step {idx + 1} of {(currentPlan || []).length}
                    </div>
                  </div>
                </div>

                <div className="lg:w-72 space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Recommended Resources</p>
                  <div className="space-y-3">
                    {(item.resources || []).map((res, ridx) => (
                      <a 
                        key={ridx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-indigo-500 hover:shadow-md transition-all"
                      >
                        <i className="fas fa-external-link-alt text-indigo-600 mr-4"></i>
                        <span className="text-sm font-bold text-gray-800 truncate">{res.title || 'Link'}</span>
                      </a>
                    ))}
                    {(!item.resources || item.resources.length === 0) && <p className="text-xs text-gray-400">No resources available.</p>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyPlan;
