
import React, { useState, useEffect } from 'react';
import { getInterviewPrep } from '../services/geminiService';
import { InterviewQuestion, SkillAnalysis } from '../types';

interface InterviewPrepProps {
  analysis: SkillAnalysis | null;
  questions: InterviewQuestion[] | null;
  onQuestionsGenerated: (q: InterviewQuestion[]) => void;
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ analysis, questions, onQuestionsGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Technical', 'HR', 'Aptitude', 'Coding', 'System Design'];

  useEffect(() => {
    if (analysis && !questions && !isLoading) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis]);

  const handleGenerate = async () => {
    if (!analysis) return;
    setIsLoading(true);
    try {
      const result = await getInterviewPrep(analysis.predictedRole, analysis.detectedSkills);
      // Append new questions to maintain the sense of a massive library
      const newSet = questions ? [...result, ...questions] : result;
      // Deduplicate by question text if necessary, then take unique IDs
      const uniqueQuestions = Array.from(new Map(newSet.map(item => [item.question, item])).values());
      onQuestionsGenerated(uniqueQuestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = questions?.filter(q => selectedCategory === 'All' || q.category === selectedCategory) || [];

  if (!analysis) {
    return (
      <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 max-w-3xl mx-auto px-10">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-3xl">
          <i className="fas fa-user-tie"></i>
        </div>
        <h3 className="text-2xl font-black mb-4">Preparation Unavailable</h3>
        <p className="text-gray-500 mb-8">Analyze your skills first to get role-specific interview preparation.</p>
        <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-indigo-200">Start Profiling</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Massive Data Indicator */}
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-green-200 animate-pulse">
          1000+ Question Database Active
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black mb-2 text-gray-900">Ace Your Next Interview</h2>
            <p className="text-gray-500 font-medium">
              Drawing from <span className="text-indigo-600 font-bold">1000+ targeted drills</span> for {analysis.predictedRole}
            </p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all flex items-center shadow-lg group"
          >
            <i className={`fas ${isLoading ? 'fa-spinner animate-spin' : 'fa-layer-group'} mr-2 group-hover:scale-110 transition-transform`}></i>
            {isLoading ? 'Fetching Batch...' : 'Load New Batch'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat} {selectedCategory === cat && questions ? `(${filteredQuestions.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && filteredQuestions.length === 0 ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-24 rounded-3xl animate-pulse"></div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No questions found in this category. Load a new batch to explore more.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={`${q.id}-${idx}`} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md animate-slideUp">
              <button 
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full text-left p-6 flex justify-between items-center group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${
                    q.category === 'Technical' ? 'bg-indigo-500' :
                    q.category === 'HR' ? 'bg-pink-500' :
                    q.category === 'Coding' ? 'bg-green-500' : 'bg-orange-400'
                  }`}></div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">{q.category}</span>
                    <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{q.question}</h4>
                  </div>
                </div>
                <i className={`fas fa-chevron-down text-gray-300 transition-transform duration-300 ${expandedId === q.id ? 'rotate-180 text-indigo-600' : ''}`}></i>
              </button>

              {expandedId === q.id && (
                <div className="px-6 pb-8 space-y-6 animate-slideDown border-t border-gray-50 pt-6">
                  <div>
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                      <i className="fas fa-comment-dots mr-2"></i>
                      Model Answer
                    </h5>
                    <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed border border-gray-100">
                      {q.answer}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                      <i className="fas fa-lightbulb mr-2"></i>
                      Pro Preparation Tips
                    </h5>
                    <div className="bg-indigo-50 p-6 rounded-2xl text-indigo-900 leading-relaxed border border-indigo-100 italic">
                      {q.tips}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {filteredQuestions.length > 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400 mb-4 font-medium">Showing {filteredQuestions.length} unique drills from the 1000+ database</p>
          <button 
            onClick={handleGenerate}
            className="text-indigo-600 font-bold hover:underline"
          >
            Explore even more questions <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
