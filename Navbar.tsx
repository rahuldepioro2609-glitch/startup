import React from 'react';
import { PhoneCall, MessageCircle, Users, BookOpen, Volume2, ShieldCheck, Sparkles, Building2, Server } from 'lucide-react';
import { CallStatus } from '../types';

interface NavbarProps {
  activeTab: 'call' | 'whatsapp' | 'leads' | 'knowledge' | 'backend';
  setActiveTab: (tab: 'call' | 'whatsapp' | 'leads' | 'knowledge' | 'backend') => void;
  companyName: string;
  callStatus: CallStatus;
  leadScore: string;
  unreadWhatsApp: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  companyName,
  callStatus,
  unreadWhatsApp,
}) => {
  const isCallActive = callStatus !== 'idle' && callStatus !== 'ended';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Depioro<span className="text-emerald-400">.ai</span></span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Employee
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300 font-medium truncate max-w-[160px] sm:max-w-[220px]">
                  {companyName}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('call')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'call'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Console</span>
              {isCallActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Integration</span>
              {unreadWhatsApp > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-teal-400 text-slate-950">
                  {unreadWhatsApp}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'leads'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lead Pipeline & Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base & Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('backend')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'backend'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Backend & LiveKit</span>
            </button>
          </nav>

          {/* Call Status Badge */}
          <div className="flex items-center gap-2">
            {isCallActive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase tracking-wide">Call In Progress</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ready to Accept Calls</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('call')}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              activeTab === 'call' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            Call
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              activeTab === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              activeTab === 'leads' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              activeTab === 'knowledge' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            Knowledge
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-3 py-1.5 rounded text-xs font-medium ${
              activeTab === 'backend' ? 'bg-emerald-600 text-white' : 'text-slate-300'
            }`}
          >
            Backend
          </button>
        </div>
      </div>
    </header>
  );
};
