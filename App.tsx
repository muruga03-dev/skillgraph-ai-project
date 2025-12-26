
import React, { useState, useEffect } from 'react';
import { AppState, User, SkillAnalysis, StudyPlanItem, InterviewQuestion } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import StudyPlan from './pages/StudyPlan';
import InterviewPrep from './pages/InterviewPrep';
import CareerAssistant from './pages/CareerAssistant';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import { syncAnalysis, syncStudyPlan, syncInterviewPrep, fetchAllUserData } from './services/dbService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [state, setState] = useState<AppState>({
    user: null,
    analysis: null,
    studyPlan: null,
    interviewPrep: null,
    history: []
  });

  // Load state from local storage and DB on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('skillgraph_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState(prev => ({ ...prev, user }));
        setCurrentPage('dashboard');

        // Fetch full data from Atlas
        fetchAllUserData(user.id).then(data => {
          if (data) {
            setState(prev => ({
              ...prev,
              analysis: data.analysis || null,
              studyPlan: data.studyPlan?.length ? data.studyPlan : null,
              interviewPrep: data.interviewPrep?.length ? data.interviewPrep : null,
              history: data.chatHistory || []
            }));
          }
        });
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem('skillgraph_user', JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
    setCurrentPage('dashboard');
    
    fetchAllUserData(user.id).then(data => {
      if (data) {
        setState(prev => ({
          ...prev,
          analysis: data.analysis || null,
          studyPlan: data.studyPlan?.length ? data.studyPlan : null,
          interviewPrep: data.interviewPrep?.length ? data.interviewPrep : null,
          history: data.chatHistory || []
        }));
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('skillgraph_user');
    setState({ user: null, analysis: null, studyPlan: null, interviewPrep: null, history: [] });
    setCurrentPage('landing');
  };

  const handleAnalysisComplete = async (result: SkillAnalysis) => {
    setState(prev => ({ 
      ...prev, 
      analysis: result, 
      studyPlan: null,
      interviewPrep: null 
    }));
    if (state.user) {
      await syncAnalysis(state.user.id, result);
    }
  };

  const handleStudyPlanGenerated = async (plan: StudyPlanItem[]) => {
    setState(prev => ({ ...prev, studyPlan: plan }));
    if (state.user) {
      await syncStudyPlan(state.user.id, plan);
    }
  };

  const handleInterviewGenerated = async (qs: InterviewQuestion[]) => {
    setState(prev => ({ ...prev, interviewPrep: qs }));
    if (state.user) {
      await syncInterviewPrep(state.user.id, qs);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={setCurrentPage} />;
      case 'analysis':
        return <Analysis onAnalysisComplete={handleAnalysisComplete} currentAnalysis={state.analysis} />;
      case 'study-plan':
        return (
          <StudyPlan 
            analysis={state.analysis} 
            currentPlan={state.studyPlan} 
            onPlanGenerated={handleStudyPlanGenerated} 
          />
        );
      case 'interview':
        return (
          <InterviewPrep 
            analysis={state.analysis} 
            questions={state.interviewPrep} 
            onQuestionsGenerated={handleInterviewGenerated} 
          />
        );
      case 'assistant':
        return <CareerAssistant analysis={state.analysis} user={state.user} />;
      default:
        return <Dashboard state={state} onNavigate={setCurrentPage} />;
    }
  };

  if (currentPage === 'landing' && !state.user) {
    return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
  }

  if (currentPage === 'auth' && !state.user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} onBack={() => setCurrentPage('landing')} />;
  }

  return (
    <Layout 
      activePage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
      userName={state.user?.name}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
