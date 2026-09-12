import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Info,
  Calendar,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Message, CallStatus, KnowledgeBase, LeadQualification } from '../types';
import { AudioWaveform } from './AudioWaveform';
import { ToolCallBadge } from './ToolCallBadge';
import { audioSpeech } from '../utils/audioSpeech';

interface CallConsoleProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  callStatus: CallStatus;
  setCallStatus: React.Dispatch<React.SetStateAction<CallStatus>>;
  knowledgeBase: KnowledgeBase;
  leadQualification: LeadQualification;
  setLeadQualification: React.Dispatch<React.SetStateAction<LeadQualification>>;
  onAppointmentBooked?: () => void;
  onWhatsAppSent?: () => void;
  onResetSession: () => void;
}

export const CallConsole: React.FC<CallConsoleProps> = ({
  messages,
  setMessages,
  callStatus,
  setCallStatus,
  knowledgeBase,
  leadQualification,
  setLeadQualification,
  onAppointmentBooked,
  onWhatsAppSent,
  onResetSession,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastConstraintCheck, setLastConstraintCheck] = useState<{
    wordCount: number;
    sentences: number;
    concisePass: boolean;
  } | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, callStatus]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (callStatus !== 'idle' && callStatus !== 'ended') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (callStatus === 'idle') {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleCallerSpeech(transcript);
          }
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Start Call Handler
  const handleStartCall = () => {
    audioSpeech.interrupt();
    setCallStatus('calling');
    setCallDuration(0);

    setTimeout(() => {
      setCallStatus('connected');
      // Depioro Greeting Workflow 1
      const greeting = `Namaste! Thanks for calling ${knowledgeBase.companyName}. Main Depioro AI bol raha hu. Bataiye main aapki kya help kar sakta hu?`;
      
      const greetingMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: Date.now(),
      };

      setMessages([greetingMessage]);
      speakAssistantTurn(greeting);
    }, 600);
  };

  // End Call Handler
  const handleEndCall = () => {
    audioSpeech.interrupt();
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
    }, 1200);
  };

  // Instant Interruption Action
  const handleInterrupt = () => {
    audioSpeech.interrupt();
    setCallStatus('interrupted');
    setTimeout(() => {
      setCallStatus('listening');
    }, 800);
  };

  // Text-To-Speech execution
  const speakAssistantTurn = (text: string) => {
    setCallStatus('speaking');
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    setLastConstraintCheck({
      wordCount: words,
      sentences: Math.max(1, sentences),
      concisePass: words <= 20,
    });

    audioSpeech.speak(
      text,
      () => setCallStatus('speaking'),
      () => setCallStatus('listening')
    );
  };

  // Caller speech / text submission
  const handleCallerSpeech = async (text: string) => {
    if (!text.trim()) return;

    // Instant interruption if Depioro was speaking!
    if (audioSpeech.isSpeaking() || callStatus === 'speaking') {
      audioSpeech.interrupt();
    }

    const callerMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, callerMsg];
    setMessages(newHistory);
    setInputText('');
    setCallStatus('processing');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          knowledgeBase,
          leadInfo: leadQualification,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const assistantText = data.text || "I'm ready to assist with your cloud and DevOps needs.";
      
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update lead qualification
      if (data.leadQualification) {
        setLeadQualification(data.leadQualification);
      }

      // Check if human transfer tool was called
      const hasTransfer = data.toolCalls?.some((t: any) => t.name === 'transfer_to_human');
      if (hasTransfer) {
        setCallStatus('transferred');
        audioSpeech.speak(assistantText);
        return;
      }

      if (data.toolCalls?.some((t: any) => t.name === 'book_appointment') && onAppointmentBooked) {
        onAppointmentBooked();
      }
      if (data.toolCalls?.some((t: any) => t.name === 'send_whatsapp_summary') && onWhatsAppSent) {
        onWhatsAppSent();
      }

      // Play audio response
      speakAssistantTurn(assistantText);
    } catch (err) {
      console.error('Error processing turn:', err);
      const fallbackReply = "I can check with our human operations team for you. What is the best number to reach you at?";
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-fallback`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: Date.now(),
        },
      ]);
      speakAssistantTurn(fallbackReply);
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      // Fallback: prompt text or simulate
      handleCallerSpeech("Hello Depioro, can you check your availability for tomorrow afternoon?");
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsRecording(false);
    } else {
      // Interrupt speaking first
      if (audioSpeech.isSpeaking()) {
        audioSpeech.interrupt();
      }
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setCallStatus('listening');
      } catch (e) {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      }
    }
  };

  const statusLabel = () => {
    switch (callStatus) {
      case 'idle':
        return { label: 'Inactive / Idle', color: 'bg-slate-200 text-slate-700' };
      case 'calling':
        return { label: 'Connecting Inbound Call...', color: 'bg-amber-100 text-amber-800 animate-pulse' };
      case 'connected':
        return { label: 'Call Connected', color: 'bg-emerald-100 text-emerald-800' };
      case 'speaking':
        return { label: 'Depioro Speaking (Spoken Audio)', color: 'bg-emerald-500 text-white font-semibold animate-pulse' };
      case 'listening':
        return { label: 'Listening to Caller...', color: 'bg-blue-500 text-white font-semibold' };
      case 'processing':
        return { label: 'Processing Intent & Tools...', color: 'bg-slate-700 text-white animate-pulse' };
      case 'interrupted':
        return { label: 'Interrupted! Halting audio...', color: 'bg-amber-500 text-white font-bold' };
      case 'transferred':
        return { label: 'Transferred to Human Team', color: 'bg-purple-600 text-white font-semibold' };
      case 'ended':
        return { label: 'Call Disconnected', color: 'bg-slate-300 text-slate-800' };
    }
  };

  const isCallActive = callStatus !== 'idle' && callStatus !== 'ended';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Phone Console HUD & Audio Controller (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Call Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Depioro Voice Console</h3>
                <p className="text-xs text-slate-500">{knowledgeBase.companyName}</p>
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 ${statusLabel().color}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{statusLabel().label}</span>
            </div>
          </div>

          {/* Caller Screen Simulation */}
          <div className="bg-slate-950 rounded-xl p-4 text-white text-center relative mb-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              {isCallActive ? 'Inbound Voice Call' : 'Line Ready'}
            </div>
            <div className="text-lg font-bold text-slate-100 mb-1">
              {leadQualification.callerName ? `${leadQualification.callerName} (Caller)` : '+1 (555) 382-9000 Inbound Line'}
            </div>
            <div className="text-xs font-mono text-emerald-400">
              {isCallActive ? `Duration: ${formatDuration(callDuration)}` : '00:00 • Standby'}
            </div>

            {/* Audio Waveform */}
            <div className="mt-3">
              <AudioWaveform status={callStatus} isMuted={isMuted} />
            </div>

            {/* Interruption Notification Banner */}
            {callStatus === 'interrupted' && (
              <div className="mt-2 text-xs py-1 px-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Instant Interruption Triggered • Speech Cancelled</span>
              </div>
            )}
          </div>

          {/* Call Action Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isCallActive ? (
              <button
                onClick={handleStartCall}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                <Phone className="w-4 h-4" />
                <span>Start Inbound Call Simulation</span>
              </button>
            ) : (
              <>
                {/* Instant Interrupt Button */}
                <button
                  onClick={handleInterrupt}
                  title="Interrupt Depioro while speaking"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition-all shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  <span>Interrupt</span>
                </button>

                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMuted ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Hang up */}
                <button
                  onClick={handleEndCall}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-all shadow-sm"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Spoken Constraints & Rules Inspector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Audio Constraints Guardrails</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Real-Time Monitor</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Response Length</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-800">1-2 Sentences</span>
                <span className="text-[10px] font-medium text-emerald-600">Under 20 words</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Last Output Metric</div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-800">
                  {lastConstraintCheck ? `${lastConstraintCheck.wordCount} words` : 'Waiting'}
                </span>
                {lastConstraintCheck && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${lastConstraintCheck.concisePass ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {lastConstraintCheck.concisePass ? 'Passed (<20)' : 'Long'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Language: Hinglish (Hindi + English) & English Adaptability</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Spoken Indian currency amounts (e.g., "Paintis hazar rupaye")</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Cultural etiquette: "Namaste" greeting & "Ji" honorifics</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Natural spoken time formatting (e.g., "Kal dopahar 3 baje")</span>
            </div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>Instant interruption: caller voice stops AI speaking instantly</span>
            </div>
          </div>
        </div>

        {/* Quick Simulation Phrases */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-900">Quick Test Scenarios (Caller Inputs)</span>
            <span className="text-[10px] text-slate-400">Click to speak</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Namaste! Aap kaun bol rahe hain aur kya services provide karte hain?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 transition-colors"
            >
              1. 🇮🇳 <strong>Hinglish Greeting:</strong> "Namaste! Aap kaun bol rahe hain aur kya services dete hain?"
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Kya aap sach me AI bot ho ya real person bol rahe ho?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 transition-colors"
            >
              2. 🤖 <strong>AI Transparency:</strong> "Kya aap sach me AI bot ho ya real person?"
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Cloud migration aur 24/7 DevOps ka pricing kya hai?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 transition-colors"
            >
              3. 💼 <strong>Discovery & Pricing:</strong> "Cloud migration aur DevOps ka pricing kya hai?"
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Mujhe appointment schedule karni hai. Kal dopahar ka time milega?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 transition-colors"
            >
              4. 📅 <strong>Check Availability:</strong> "Mujhe appointment schedule karni hai, kal time milega?"
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Mera naam Rahul Verma hai, number 9876543210 hai. Kal 3 baje confirm kardo."), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200/80 transition-colors"
            >
              5. 📲 <strong>Book & WhatsApp:</strong> "Mera naam Rahul Verma hai, 9876543210. Kal 3 baje book kardo."
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Kya aap office me onsite consultation me chai aur lunch serve karte hain?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-900 border border-slate-200/80 transition-colors"
            >
              6. 🍵 <strong>Missing Info Guardrail:</strong> "Kya aap meeting me chai serve karte hain?" (Triggers fallback)
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Mujhe turant aapke manager se baat karni hai, transfer kijiye!"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-colors"
            >
              7. 🚨 <strong>Human Escalation:</strong> "Mujhe turant aapke manager se baat karni hai, transfer kijiye!"
            </button>

            <button
              onClick={() => {
                if (!isCallActive) handleStartCall();
                setTimeout(() => handleCallerSpeech("Hi Depioro! Can we book a consultation for cloud architecture tomorrow?"), 800);
              }}
              className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200/80 transition-colors"
            >
              8. 🇺🇸 <strong>English Mode Call:</strong> "Hi Depioro! Can we book a consultation for tomorrow?"
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Transcript Stream & Caller Mic Input (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[680px]">
        {/* Transcript Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 text-sm">Real-Time Spoken Audio Transcript</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetSession}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Session</span>
            </button>
          </div>
        </div>

        {/* Scrolling Transcript Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-700 text-sm mb-1">No Active Conversation</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Click "Start Inbound Call Simulation" or pick one of the test scenarios on the left to begin speaking with Depioro.
              </p>
              <button
                onClick={handleStartCall}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Initiate Greeting Call
              </button>
            </div>
          ) : (
            messages.map((msg) => {
              const isDepioro = msg.role === 'assistant';
              const words = msg.content.trim().split(/\s+/).length;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isDepioro ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      {isDepioro ? 'Depioro (AI Employee)' : 'Caller'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {isDepioro && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {words} words
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                      isDepioro
                        ? 'bg-slate-900 text-white rounded-tl-sm'
                        : 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-tr-sm'
                    }`}
                  >
                    <p>{msg.content}</p>

                    {/* Tool Call Cards */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-700/60 pt-2">
                        {msg.toolCalls.map((tool) => (
                          <ToolCallBadge key={tool.id} tool={tool} />
                        ))}
                      </div>
                    )}
                  </div>

                  {isDepioro && (
                    <button
                      onClick={() => audioSpeech.speak(msg.content)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-600 mt-1 px-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Replay audio</span>
                    </button>
                  )}
                </div>
              );
            })
          )}

          {callStatus === 'processing' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Depioro is processing intent and checking tools...</span>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Input Bar: Spoken Audio (Mic) + Text Fallback */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                handleCallerSpeech(inputText);
              }
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title={isRecording ? 'Listening (Click to stop)' : 'Click to Speak via Microphone'}
            >
              {isRecording ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? 'Listening to your speech...' : 'Type caller speech or use microphone...'}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              {speechSupported ? '🎙️ Web Speech API active • Microphone enabled' : '⌨️ Text mode fallback active'}
            </span>
            <span>Instant interrupt: speaking immediately halts playback</span>
          </div>
        </div>
      </div>
    </div>
  );
};
