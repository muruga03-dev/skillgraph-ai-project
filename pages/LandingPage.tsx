
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-300 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-300 rounded-full blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <i className="fas fa-network-wired text-3xl text-indigo-600"></i>
          <span className="text-2xl font-black text-indigo-900 tracking-tighter">SkillGraph AI</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-500">
          <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Career Trends</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Resources</a>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-40 text-center relative z-10 flex-1">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-semibold text-sm mb-8 animate-bounce">
          <i className="fas fa-sparkles text-xs"></i>
          <span>AI-Powered Career Intelligence</span>
        </div>
        
        <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
          Master Your Career <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            With Graph-Based AI
          </span>
        </h1>
        
        <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
          Don't just apply. Analyze. Extract skills from your resume, predict high-growth roles, and build the exact roadmap you need to bridge your gaps.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={onGetStarted}
            className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            Launch Career Dashboard
          </button>
          <button className="bg-white border-2 border-gray-100 text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl hover:border-indigo-200 hover:text-indigo-600 transition-all">
            See How It Works
          </button>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900">50K+</span>
            <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Skills Indexed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900">1.2M</span>
            <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Job Matches</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900">98%</span>
            <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Prediction Accuracy</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-900">24/7</span>
            <span className="text-xs uppercase font-bold tracking-widest text-gray-500">AI Assistance</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-32 border-t border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Skill DNA Extraction', 
                icon: 'fa-fingerprint', 
                color: 'bg-indigo-500',
                desc: 'Our NLP engine parses your experience to identify hard, soft, and latent skills you didn\'t even know you had.' 
              },
              { 
                title: 'Role Prediction', 
                icon: 'fa-brain', 
                color: 'bg-purple-500',
                desc: 'Leverage the power of Gemini to find roles where your skills intersect with current market demand.' 
              },
              { 
                title: 'Gap Bridge Maps', 
                icon: 'fa-map-signs', 
                color: 'bg-pink-500',
                desc: 'Get an ordered, resource-rich learning path designed to move you from your current role to your target goal.' 
              }
            ].map((f, i) => (
              <div key={i} className="group p-2">
                <div className={`w-16 h-16 ${f.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:rotate-6 transition-transform`}>
                  <i className={`fas ${f.icon} text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Page Footer */}
      <footer className="w-full py-12 px-8 border-t border-gray-100 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center space-x-3 font-semibold">
            <i className="fas fa-network-wired text-indigo-600 text-xl"></i>
            <span>© 2025 <span className="text-indigo-600 font-bold">SkillGraph AI</span>. All Rights Reserved.</span>
          </div>
          <div className="text-center md:text-right font-medium text-gray-500">
            Designed by <span className="text-gray-900 font-bold border-b-2 border-indigo-500 pb-0.5">Murugaperumal</span> in mini project
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
