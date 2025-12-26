
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AuthMode, User } from '../types';
import { saveUserToDB, loginUser, googleAuth } from '../services/dbService';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            use_fedcm_for_prompt: false,
          });
          
          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_blue",
              size: "large",
              width: "100%",
              shape: "rectangular",
              text: "continue_with",
            });
          }
          setGsiLoaded(true);
        } catch (e) {
          console.warn("GSI init failed.", e);
        }
      }
    };
    
    const timer = setTimeout(initGoogle, 1000);
    return () => clearTimeout(timer);
  }, [mode, gsiLoaded]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setError('');
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const decoded = JSON.parse(jsonPayload);
      const user = await googleAuth({ googleId: decoded.sub, email: decoded.email, name: decoded.name });
      setIsSuccess(true);
      setTimeout(() => onAuthSuccess(user), 1500);
    } catch (err: any) {
      setError("Google Authentication failed.");
      setIsLoading(false);
    }
  };

  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return setError('Please enter a valid email address.');
    setIsLoading(true);
    setError('');
    try {
      const user = mode === 'signup' 
        ? await saveUserToDB(name, email, password)
        : await loginUser(email, password);
      
      setIsSuccess(true);
      // Brief pause to show success state for better UX
      setTimeout(() => onAuthSuccess(user), 1200);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white p-6 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40 animate-bounce">
          <i className="fas fa-check text-4xl"></i>
        </div>
        <h2 className="text-4xl font-black mb-4">Welcome to SkillGraph</h2>
        <p className="text-indigo-200 text-xl max-w-md mx-auto">Initializing your AI career engine and syncing your roadmap...</p>
        <div className="mt-12 flex space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel: Brand & Motivation */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <button onClick={onBack} className="flex items-center text-indigo-300 hover:text-white transition-colors font-bold group mb-12">
            <i className="fas fa-arrow-left mr-3 group-hover:-translate-x-1 transition-transform"></i>
            Back to Home
          </button>
          
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-network-wired text-indigo-900 text-2xl"></i>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">SkillGraph AI</span>
          </div>

          <h2 className="text-5xl font-black text-white leading-tight mb-8">
            Your career isn't a ladder. <br />
            <span className="text-indigo-400">It's a data graph.</span>
          </h2>
          
          <div className="space-y-8 mt-12">
            {[
              { icon: 'fa-microscope', text: 'Granular skill extraction using proprietary LLM logic' },
              { icon: 'fa-bullseye', text: 'Hyper-accurate role matching based on live market trends' },
              { icon: 'fa-road', text: 'Step-by-step roadmaps that bridge the gap to your dream job' }
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-800 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-700">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <p className="text-indigo-100 text-lg font-medium max-w-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-indigo-800 pt-8 flex justify-between items-center text-indigo-400 text-sm font-bold">
          <span>SECURED BY GEMINI PRO</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50/30">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              {mode === 'signin' ? 'Welcome back' : 'Join SkillGraph'}
            </h1>
            <p className="text-gray-500 font-medium">
              {mode === 'signin' 
                ? 'Enter your details to pick up where you left off.' 
                : 'Start your data-driven career journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe" 
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300 font-medium shadow-sm" 
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john@company.com" 
                className={`w-full bg-white border-2 rounded-2xl py-4 px-6 text-gray-900 focus:ring-4 outline-none transition-all placeholder:text-gray-300 font-medium shadow-sm ${
                  email ? (isEmailValid ? 'border-green-100 focus:border-green-500 focus:ring-green-500/10' : 'border-red-100 focus:border-red-500 focus:ring-red-500/10') : 'border-gray-100 focus:border-indigo-500 focus:ring-indigo-500/10'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                {mode === 'signin' && (
                  <button type="button" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</button>
                )}
              </div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300 font-medium shadow-sm" 
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl text-sm font-bold bg-red-50 border border-red-100 text-red-600 flex items-center shadow-sm">
                <i className="fas fa-exclamation-triangle mr-3"></i> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-circle-notch animate-spin mr-3"></i> Processing...
                </span>
              ) : (mode === 'signin' ? 'Sign In' : 'Create Free Account')}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-10">
              <div className="border-t border-gray-100 w-full"></div>
              <span className="bg-white px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] absolute">Enterprise Auth</span>
            </div>

            <div className="space-y-4">
              <div ref={googleBtnRef} className="w-full flex justify-center overflow-hidden rounded-xl"></div>
              {!gsiLoaded && (
                 <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">Social connectors initializing...</p>
              )}
            </div>
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} 
              className="text-gray-600 font-bold transition-colors hover:text-indigo-600"
            >
              {mode === 'signin' ? "New to SkillGraph? " : "Already have an account? "}
              <span className="text-indigo-600 border-b-2 border-indigo-100 hover:border-indigo-600 pb-0.5 ml-1">
                {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
              </span>
            </button>
          </div>

          {/* Mobile Back Button */}
          <button onClick={onBack} className="mt-12 lg:hidden w-full flex items-center justify-center text-gray-400 font-bold hover:text-indigo-600 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back to Landing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
