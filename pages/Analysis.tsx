
import React, { useState } from 'react';
import { extractAndAnalyzeSkills, extractTextFromPdf } from '../services/geminiService';
import { SkillAnalysis } from '../types';
import SkillCard from '../components/SkillCard';
import mammoth from 'mammoth';

interface AnalysisProps {
  onAnalysisComplete: (result: SkillAnalysis) => void;
  currentAnalysis: SkillAnalysis | null;
}

const Analysis: React.FC<AnalysisProps> = ({ onAnalysisComplete, currentAnalysis }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please provide some text or skills to analyze.');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    try {
      const result = await extractAndAnalyzeSkills(inputText);
      onAnalysisComplete(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setError('');

    try {
      if (file.type === 'application/pdf') {
        const base64 = await blobToBase64(file);
        const extractedText = await extractTextFromPdf(base64);
        setInputText(extractedText);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        setInputText(text);
      } else {
        setError('Unsupported file format. Please upload PDF, DOCX, or TXT.');
      }
    } catch (err) {
      console.error('File extraction error:', err);
      setError('Failed to extract text from file.');
    } finally {
      setIsExtracting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <h2 className="text-3xl font-black mb-8 text-gray-900">Skill Profiler</h2>
        
        <div className="space-y-6">
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your resume content or list your skills here..."
              className="w-full h-64 p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none text-gray-700 font-medium"
              disabled={isExtracting || isAnalyzing}
            ></textarea>
            
            {isExtracting && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center space-y-4">
                <i className="fas fa-spinner animate-spin text-4xl text-indigo-600"></i>
                <p className="font-bold text-indigo-900">Extracting content...</p>
              </div>
            )}

            <div className="absolute bottom-6 right-6 flex space-x-2">
              <label className={`bg-white border-2 border-gray-200 text-gray-600 px-6 py-2 rounded-2xl font-bold cursor-pointer hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center shadow-sm ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}>
                <i className="fas fa-file-upload mr-2"></i>
                Upload Resume
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.pdf,.docx" 
                  onChange={handleFileUpload} 
                  disabled={isExtracting || isAnalyzing}
                />
              </label>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isExtracting || !inputText.trim()}
                className={`bg-indigo-600 text-white px-8 py-2 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-200 flex items-center ${isAnalyzing || isExtracting || !inputText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
              >
                {isAnalyzing ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Analyze Now
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>
      </div>

      {currentAnalysis && (
        <div className="grid lg:grid-cols-2 gap-8 animate-slideUp">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6">Career Insights</h3>
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider mb-2">Predicted Job Role</p>
                <p className="text-3xl font-black text-indigo-900">{currentAnalysis.predictedRole || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Match Rate</p>
                  <p className="text-3xl font-black text-green-900">{currentAnalysis.matchPercentage || 0}%</p>
                </div>
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Skills Found</p>
                  <p className="text-3xl font-black text-orange-900">{currentAnalysis.detectedSkills?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6">Skill Breakdown</h3>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(currentAnalysis.matchingSkills || []).map((s, i) => (
                    <SkillCard key={i} name={s} type="matching" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Missing Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {(currentAnalysis.missingSkills || []).map((s, i) => (
                    <SkillCard key={i} name={s} type="missing" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
