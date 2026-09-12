'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  MessageSquare,
  CreditCard,
  UploadCloud,
  Bot,
  Mic,
  Sliders,
  Terminal,
  CheckCircle2,
  FileText,
  Sparkles,
  Menu,
  X,
  Phone,
} from 'lucide-react';

import { CallConsole } from './components/CallConsole';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import { LeadPipeline } from './components/LeadPipeline';
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { BackendConsole } from './components/BackendConsole';
import { SubscriptionView } from './components/SubscriptionView';
import { ConnectNumberModal } from './components/ConnectNumberModal';
import { defaultKnowledge } from './data/defaultKnowledge';
import { Message, CallStatus, KnowledgeBase, LeadQualification, Appointment, WhatsAppMessage } from './types';
import { audioSpeech } from './utils/audioSpeech';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<'setup' | 'calls' | 'whatsapp' | 'subscription' | 'knowledge' | 'backend'>('setup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Core application state
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(defaultKnowledge);

  const [leadQualification, setLeadQualification] = useState<LeadQualification>({
    callerName: null,
    phone: null,
    businessNeed: null,
    status: 'unqualified',
  });

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt-101',
      name: 'Rahul Verma',
      phone: '+91 98765 43210',
      email: 'rahul@enterprise.in',
      datetime_iso: '2026-09-11T14:00:00Z',
      datetime_display: 'Friday at 2:00 PM IST',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'wa-1',
      phone: '+91 98765 43210',
      customerName: 'Rahul Verma',
      message: 'Namaste Rahul ji, Apex Cloud Solutions ke saath aapki 30-minute cloud consultation meeting Friday at 2:00 PM IST confirm ho gayi hai. Dhanyawad!',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    },
  ]);

  const [unreadWhatsApp, setUnreadWhatsApp] = useState(0);

  // Connected phone numbers
  const [connectedNumbers, setConnectedNumbers] = useState([
    { number: '+91 80 4725 9900', label: 'Bangalore Primary DID', date: 'Sept 01, 2026' },
    { number: '+91 98765 43210', label: 'Support & Inbound Inquiries', date: 'Aug 15, 2026' },
  ]);

  // Document Training State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const refreshState = () => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (data.appointments) setAppointments(data.appointments);
        if (data.whatsappMessages) setWhatsappMessages(data.whatsappMessages);
        if (data.leadQualification) setLeadQualification(data.leadQualification);
      })
      .catch((err) => console.log('Syncing state:', err));
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleResetSession = async () => {
    audioSpeech.interrupt();
    setMessages([]);
    setCallStatus('idle');
    setLeadQualification({
      callerName: null,
      phone: null,
      businessNeed: null,
      status: 'unqualified',
    });
    try {
      await fetch('/api/state/reset', { method: 'POST' });
    } catch (e) {}
  };

  const handleAppointmentBooked = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
      if (data.whatsappMessages) setWhatsappMessages(data.whatsappMessages);
    } catch (e) {}
  };

  const handleWhatsAppSent = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.whatsappMessages) {
        setWhatsappMessages(data.whatsappMessages);
        setUnreadWhatsApp((prev) => prev + 1);
      }
    } catch (e) {}
  };

  const handleConnectNumber = (num: string, label: string) => {
    setConnectedNumbers((prev) => [
      { number: num, label, date: 'Today' },
      ...prev,
    ]);
  };

  // Document Upload Processors
  const processUploadedDocument = (fileName: string, textSnippet?: string) => {
    setIsProcessingDoc(true);
    setTimeout(() => {
      setUploadedFile(fileName);
      setIsProcessingDoc(false);
      setUploadStatus(`Document "${fileName}" processed & trained into Depioro AI Knowledge Base!`);

      // Optionally enrich knowledge base
      if (fileName.toLowerCase().includes('clinic') || fileName.toLowerCase().includes('health')) {
        setKnowledgeBase((prev) => ({
          ...prev,
          services: [
            ...prev.services,
            {
              name: 'Specialist Health Consultation',
              description: 'Comprehensive health checkup and preventative screening.',
              pricing: '₹1,500 (Ek hazar paanch sau rupaye) per session',
            },
          ],
          faqs: [
            ...prev.faqs,
            {
              q: 'Kya weekend appointments available hain?',
              a: 'Haan ji, Saturday aur Sunday subah 10 baje se shaam 4 baje tak appointments available rehte hain.',
            },
          ],
        }));
      } else {
        setKnowledgeBase((prev) => ({
          ...prev,
          faqs: [
            ...prev.faqs,
            {
              q: `Document Reference: ${fileName}`,
              a: textSnippet || 'Document guidelines verified and indexed into Depioro AI India prompt context.',
            },
          ],
        }));
      }

      setTimeout(() => setUploadStatus(null), 5000);
    }, 900);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processUploadedDocument(file.name, content?.slice(0, 300));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedDocument(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-warmWhite-100 text-wood-900 font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-wood-800 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-wood-600 rounded-lg">
            <Bot className="w-5 h-5 text-warmWhite-100" />
          </div>
          <span className="font-bold text-lg">Depioro.ai</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-wood-700 text-white hover:bg-wood-600"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Wood Theme */}
      <aside
        className={`w-64 bg-wood-800 text-wood-50 p-6 flex flex-col justify-between shadow-xl shrink-0 ${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex`}
      >
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-wood-600 rounded-lg shadow-xs">
              <Bot className="w-6 h-6 text-warmWhite-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Depioro.ai</h1>
              <span className="text-[11px] text-wood-300 font-medium">India Voice & WhatsApp AI</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('setup');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-wood-600 text-white shadow-sm'
                  : 'text-wood-100 hover:bg-wood-700/60'
              }`}
            >
              <Bot className="w-5 h-5 shrink-0" />
              <span>AI Agent Setup</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('calls');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'calls'
                  ? 'bg-wood-600 text-white shadow-sm'
                  : 'text-wood-100 hover:bg-wood-700/60'
              }`}
            >
              <PhoneCall className="w-5 h-5 shrink-0" />
              <span>Call Logs</span>
              {leadQualification.status === 'qualified' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('whatsapp');
                setUnreadWhatsApp(0);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-wood-600 text-white shadow-sm'
                  : 'text-wood-100 hover:bg-wood-700/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>WhatsApp Chats</span>
              </div>
              {unreadWhatsApp > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadWhatsApp}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('subscription');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                activeTab === 'subscription'
                  ? 'bg-wood-600 text-white shadow-sm'
                  : 'text-wood-100 hover:bg-wood-700/60'
              }`}
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>Subscription</span>
            </button>

            <div className="pt-3 border-t border-wood-700/60 mt-3">
              <span className="px-4 text-[10px] font-semibold tracking-wider text-wood-400 uppercase">
                Configuration
              </span>

              <button
                onClick={() => {
                  setActiveTab('knowledge');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 mt-1 rounded-lg text-sm transition cursor-pointer ${
                  activeTab === 'knowledge'
                    ? 'bg-wood-600 text-white'
                    : 'text-wood-200 hover:bg-wood-700/60'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>Knowledge & Rules</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('backend');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  activeTab === 'backend'
                    ? 'bg-wood-600 text-white'
                    : 'text-wood-200 hover:bg-wood-700/60'
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>API & LiveKit State</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Plan card at sidebar bottom */}
        <div className="bg-wood-900/60 p-4 rounded-xl border border-wood-600/30 mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-wood-300">Active Plan</p>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5">Pro AI Agent (₹999/mo)</p>
          <p className="text-[11px] text-wood-400 mt-1">300 Mins Voice + WhatsApp API</p>
        </div>
      </aside>

      {/* Main Content Area - Warm White Base */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-wood-300/30 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-wood-900">
              {activeTab === 'setup' && 'AI Receptionist Control Panel'}
              {activeTab === 'calls' && 'Call Logs & Lead Pipeline'}
              {activeTab === 'whatsapp' && 'WhatsApp Follow-ups & Chats'}
              {activeTab === 'subscription' && 'Subscription & Connected Numbers'}
              {activeTab === 'knowledge' && 'Business Knowledge Base & Prompt Editor'}
              {activeTab === 'backend' && 'Backend Endpoints & LiveKit Engine'}
            </h2>
            <p className="text-sm text-wood-600">
              {activeTab === 'setup' && 'Manage your calling rules, knowledge base, and automated replies'}
              {activeTab === 'calls' && 'Real-time transcript logs, qualified leads, and booked consultations'}
              {activeTab === 'whatsapp' && 'Automated WhatsApp confirmations dispatched instantly after calls'}
              {activeTab === 'subscription' && 'Active monthly plan, voice minute allowance, and Indian phone numbers'}
              {activeTab === 'knowledge' && 'Train services, spoken pricing in Indian Rupees, FAQs, and escalation'}
              {activeTab === 'backend' && 'Inspect API turn payloads, tool invocations, and session reset tools'}
            </p>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-wood-800 hover:bg-wood-900 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>+ Connect New Phone Number</span>
          </button>
        </header>

        {/* TAB 1: AI AGENT SETUP */}
        {activeTab === 'setup' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-wood-300/30 shadow-sm">
                <span className="text-xs font-semibold text-wood-600 uppercase tracking-wider">
                  Voice Minutes Used
                </span>
                <div className="text-3xl font-extrabold text-wood-900 mt-2">
                  142 / 300 <span className="text-sm font-normal text-slate-500">mins</span>
                </div>
                <div className="w-full bg-wood-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-wood-700 h-full rounded-full" style={{ width: '47.3%' }}></div>
                </div>
                <p className="text-[11px] text-wood-500 mt-2">158 mins remaining in ₹999 plan</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-wood-300/30 shadow-sm">
                <span className="text-xs font-semibold text-wood-600 uppercase tracking-wider">
                  WhatsApp Follow-ups
                </span>
                <div className="text-3xl font-extrabold text-wood-900 mt-2">
                  {489 + whatsappMessages.length - 1} <span className="text-sm font-normal text-slate-500">sent</span>
                </div>
                <div className="w-full bg-wood-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '48.9%' }}></div>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-2">99.8% instant delivery via WhatsApp API</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-wood-300/30 shadow-sm">
                <span className="text-xs font-semibold text-wood-600 uppercase tracking-wider">
                  Appointments Booked
                </span>
                <div className="text-3xl font-extrabold text-wood-900 mt-2">
                  {28 + appointments.length - 1} <span className="text-sm font-normal text-slate-500">meetings</span>
                </div>
                <div className="w-full bg-wood-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-wood-800 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[11px] text-wood-600 mt-2">2-Way Google Calendar & Outlook sync</p>
              </div>
            </div>

            {/* Knowledge Upload Section */}
            <div className="bg-white p-8 rounded-2xl border border-wood-300/30 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-wood-900">Train Your AI Employee</h3>
                  <p className="text-sm text-wood-600">
                    Upload your pricing sheet, service catalog, or FAQ document (PDF/Word/TXT)
                  </p>
                </div>
                {uploadedFile && (
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5 self-start">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trained: {uploadedFile}
                  </span>
                )}
              </div>

              {uploadStatus && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-wood-300/60 rounded-xl p-8 text-center bg-warmWhite-100 hover:bg-warmWhite-200 cursor-pointer transition relative group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-wood-600 mx-auto mb-2 group-hover:scale-110 transition" />
                <p className="text-sm font-semibold text-wood-900">
                  {isProcessingDoc ? 'Processing & Indexing Document...' : 'Click or Drag to upload business documents'}
                </p>
                <p className="text-xs text-wood-600 mt-1">Supports PDF, DOCX, TXT up to 10MB</p>

                {/* Quick test templates */}
                <div className="mt-4 pt-3 border-t border-wood-200 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-wood-500 font-medium">Or quick-test with template:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      processUploadedDocument('Cloud_DevOps_Catalog_2026.pdf', 'Cloud migration ₹75,000, DevOps retainer ₹35,000 monthly.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-wood-100 border border-wood-300 rounded text-wood-800 font-medium cursor-pointer"
                  >
                    📄 Ingest Cloud DevOps PDF
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      processUploadedDocument('Dental_Clinic_Pricing_Guide.docx', 'Doctor consultation ₹1,500, Teeth cleaning ₹2,000.');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-wood-100 border border-wood-300 rounded text-wood-800 font-medium cursor-pointer"
                  >
                    📄 Ingest Healthcare Clinic DOCX
                  </button>
                </div>
              </div>
            </div>

            {/* AI Call Console Simulator (Spoken Voice + Hinglish/English) */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-wood-900">Interactive Call & Voice Simulator</h3>
                  <p className="text-xs text-wood-600">
                    Test incoming callers, spoken Hinglish audio, under-20-words constraint, and WhatsApp automation
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Depioro AI Engine Ready</span>
                </div>
              </div>

              <CallConsole
                messages={messages}
                setMessages={setMessages}
                callStatus={callStatus}
                setCallStatus={setCallStatus}
                knowledgeBase={knowledgeBase}
                leadQualification={leadQualification}
                setLeadQualification={setLeadQualification}
                onAppointmentBooked={handleAppointmentBooked}
                onWhatsAppSent={handleWhatsAppSent}
                onResetSession={handleResetSession}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CALL LOGS */}
        {activeTab === 'calls' && (
          <div className="animate-in fade-in duration-200">
            <LeadPipeline
              leadQualification={leadQualification}
              setLeadQualification={setLeadQualification}
              appointments={appointments}
              knowledgeBase={knowledgeBase}
            />
          </div>
        )}

        {/* TAB 3: WHATSAPP CHATS */}
        {activeTab === 'whatsapp' && (
          <div className="animate-in fade-in duration-200">
            <WhatsAppPreview
              messages={whatsappMessages}
              setMessages={setWhatsappMessages}
              knowledgeBase={knowledgeBase}
            />
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="animate-in fade-in duration-200">
            <SubscriptionView
              connectedNumbers={connectedNumbers}
              onOpenConnectModal={() => setShowConnectModal(true)}
            />
          </div>
        )}

        {/* TAB 5: KNOWLEDGE BASE */}
        {activeTab === 'knowledge' && (
          <div className="animate-in fade-in duration-200">
            <KnowledgeBaseEditor
              knowledgeBase={knowledgeBase}
              setKnowledgeBase={setKnowledgeBase}
            />
          </div>
        )}

        {/* TAB 6: BACKEND CONSOLE */}
        {activeTab === 'backend' && (
          <div className="animate-in fade-in duration-200">
            <BackendConsole onRefreshAppState={refreshState} />
          </div>
        )}
      </main>

      {/* Connect New Phone Number Modal */}
      <ConnectNumberModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnectNumber={handleConnectNumber}
      />
    </div>
  );
}
