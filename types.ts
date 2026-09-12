export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCallLog[];
}

export interface ToolCallLog {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  timestamp: number;
}

export interface LeadQualification {
  callerName: string | null;
  phone: string | null;
  businessNeed: string | null;
  status: 'unqualified' | 'discovering' | 'qualifying' | 'qualified' | 'escalated';
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  datetime_iso: string;
  datetime_display: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  phone: string;
  customerName: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface KnowledgeBase {
  companyName: string;
  tagline: string;
  operatingHours: string;
  contactPhone: string;
  contactEmail: string;
  escalationManager: string;
  services: Array<{
    name: string;
    description: string;
    pricing: string;
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
}

export type CallStatus = 
  | 'idle' 
  | 'calling' 
  | 'connected' 
  | 'speaking' 
  | 'listening' 
  | 'processing' 
  | 'interrupted' 
  | 'transferred' 
  | 'ended';

export interface CallSession {
  id: string;
  status: CallStatus;
  duration: number;
  transferReason?: string;
  isMuted: boolean;
  activeVoiceMode: 'gemini_tts' | 'browser_speech';
}
