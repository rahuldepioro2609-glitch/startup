import React from 'react';
import { CreditCard, Check, Sparkles, Phone, ShieldCheck, Zap, ArrowUpRight, Clock, MessageSquare, Calendar } from 'lucide-react';

interface SubscriptionViewProps {
  connectedNumbers: Array<{ number: string; label: string; date: string }>;
  onOpenConnectModal: () => void;
}

export function SubscriptionView({ connectedNumbers, onOpenConnectModal }: SubscriptionViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-wood-300/30 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pb-6 border-b border-wood-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Subscription
            </div>
            <h3 className="text-2xl font-bold text-wood-900">Pro AI Agent Plan</h3>
            <p className="text-sm text-wood-600 mt-1">Autonomous 24/7 AI Receptionist & Instant WhatsApp Dispatch for India</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-wood-900">₹999 <span className="text-sm font-normal text-slate-500">/ month</span></div>
            <p className="text-xs text-wood-500 mt-1">Next renewal on Oct 10, 2026</p>
          </div>
        </div>

        {/* Quotas & Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-4 bg-warmWhite-100 rounded-xl border border-wood-200">
            <div className="flex justify-between items-center text-xs font-semibold text-wood-700 mb-2">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-wood-600" /> Voice Minutes</span>
              <span>142 / 300 mins (47%)</span>
            </div>
            <div className="w-full bg-wood-200 h-2 rounded-full overflow-hidden">
              <div className="bg-wood-700 h-full rounded-full" style={{ width: '47.3%' }}></div>
            </div>
            <p className="text-[11px] text-wood-500 mt-2">158 mins remaining this cycle</p>
          </div>

          <div className="p-4 bg-warmWhite-100 rounded-xl border border-wood-200">
            <div className="flex justify-between items-center text-xs font-semibold text-wood-700 mb-2">
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-wood-600" /> WhatsApp Follow-ups</span>
              <span>489 / 1,000 sent</span>
            </div>
            <div className="w-full bg-wood-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '48.9%' }}></div>
            </div>
            <p className="text-[11px] text-wood-500 mt-2">Instant delivery via Meta WhatsApp Cloud API</p>
          </div>

          <div className="p-4 bg-warmWhite-100 rounded-xl border border-wood-200">
            <div className="flex justify-between items-center text-xs font-semibold text-wood-700 mb-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-wood-600" /> Calendar Appointments</span>
              <span>Unlimited (28 booked)</span>
            </div>
            <div className="w-full bg-wood-200 h-2 rounded-full overflow-hidden">
              <div className="bg-wood-800 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-[11px] text-wood-500 mt-2">Full Google Calendar 2-way sync</p>
          </div>
        </div>
      </div>

      {/* Connected Phone Numbers Section */}
      <div className="bg-white rounded-2xl border border-wood-300/30 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-wood-900">Connected Phone Lines</h3>
            <p className="text-sm text-wood-600">Indian phone numbers routed directly to Depioro AI Receptionist</p>
          </div>
          <button
            onClick={onOpenConnectModal}
            className="px-4 py-2 bg-wood-800 hover:bg-wood-900 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Phone className="w-4 h-4" /> + Connect Another Number
          </button>
        </div>

        <div className="divide-y divide-wood-200 border border-wood-200 rounded-xl overflow-hidden">
          {connectedNumbers.map((line, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between bg-warmWhite-100/50 hover:bg-warmWhite-100 transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-wood-100 border border-wood-300 flex items-center justify-center text-wood-700">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-wood-900">{line.number}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold">
                      Online & Listening
                    </span>
                  </div>
                  <p className="text-xs text-wood-600">{line.label} • Linked {line.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-wood-500 hidden sm:inline">IVR Mode: Direct AI</span>
                <span className="text-xs px-2.5 py-1 bg-wood-200 text-wood-800 rounded-md font-medium">
                  Hinglish / English
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-wood-300/30 p-6 shadow-sm">
          <h4 className="font-bold text-wood-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-wood-600" /> Plan Features Included
          </h4>
          <ul className="space-y-3 text-sm text-wood-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bilingual Conversational Hinglish & English voice engine</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-time interruption & barge-in detection</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Calendar availability check & instant appointment booking</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated WhatsApp confirmation summaries sent to callers</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Human manager transfer on critical escalation</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-wood-300/30 p-6 shadow-sm">
          <h4 className="font-bold text-wood-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-wood-600" /> Payment & Billing History
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-wood-100 text-wood-700">
              <div>
                <p className="font-medium text-wood-900">Sept 10, 2026</p>
                <p className="text-xs text-wood-500">Pro AI Agent - Monthly (₹999)</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                Paid (UPI AutoPay)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-wood-100 text-wood-700">
              <div>
                <p className="font-medium text-wood-900">Aug 10, 2026</p>
                <p className="text-xs text-wood-500">Pro AI Agent - Monthly (₹999)</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                Paid (UPI AutoPay)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
