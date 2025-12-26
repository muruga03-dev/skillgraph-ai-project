
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onLogout, userName }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' },
    { id: 'analysis', label: 'Skill Analysis', icon: 'fa-chart-pie' },
    { id: 'study-plan', label: 'Study Plan', icon: 'fa-book-open' },
    { id: 'interview', label: 'Interview Prep', icon: 'fa-user-tie' },
    { id: 'assistant', label: 'Career Assistant', icon: 'fa-robot' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg"
      >
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-indigo-900 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <i className="fas fa-network-wired text-indigo-900 text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight">SkillGraph AI</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activePage === item.id 
                    ? 'bg-indigo-700 text-white shadow-lg' 
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} w-6`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="font-bold">{userName?.[0] || 'U'}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{userName || 'User'}</p>
                <p className="text-xs text-indigo-300">Free Tier</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-indigo-200 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <i className="fas fa-sign-out-alt w-6"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 lg:p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 capitalize">
            {activePage.replace('-', ' ')}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-600">
              <i className="fas fa-search mr-2 opacity-50"></i>
              <input type="text" placeholder="Search features..." className="bg-transparent outline-none w-32 focus:w-48 transition-all" />
            </div>
            <button className="relative text-gray-400 hover:text-indigo-600 transition-colors">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto flex-1 w-full">
          {children}
        </div>

        {/* Global Footer Section */}
        <footer className="w-full py-8 px-8 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-2 font-medium">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">PRO</span>
              <span>© 2025 <span className="text-indigo-600 font-bold">SkillGraph AI</span>. All Rights Reserved.</span>
            </div>
            <div className="text-center md:text-right font-medium">
              Designed by <span className="text-gray-900 font-bold border-b-2 border-indigo-500 pb-0.5">Murugaperumal</span> in mini project
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
