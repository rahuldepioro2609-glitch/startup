import React, { useState } from 'react';
import { MessageCircle, CheckCheck, Send, ShieldCheck, PhoneCall, Sparkles, Smartphone } from 'lucide-react';
import { WhatsAppMessage, KnowledgeBase } from '../types';

interface WhatsAppPreviewProps {
  messages: WhatsAppMessage[];
  setMessages: React.Dispatch<React.SetStateAction<WhatsAppMessage[]>>;
  knowledgeBase: KnowledgeBase;
  onSendManualMessage?: (phone: string, text: string) => void;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  messages,
  setMessages,
  knowledgeBase,
}) => {
  const [replyText, setReplyText] = useState('');
  const [activeRecipient, setActiveRecipient] = useState<string>(
    messages[0]?.phone || '+1 (555) 234-8901'
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: WhatsAppMessage = {
      id: `wa-user-${Date.now()}`,
      phone: activeRecipient,
      customerName: 'Client',
      message: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setMessages((prev) => [newMsg, ...prev]);
    setReplyText('');

    // Simulate Depioro instant auto-reply on WhatsApp
    setTimeout(() => {
      const autoReply: WhatsAppMessage = {
        id: `wa-auto-${Date.now()}`,
        phone: activeRecipient,
        customerName: 'Client',
        message: `Hello! Depioro received your message. Our operations team at ${knowledgeBase.companyName} has noted this. If urgent, feel free to call our main line at ${knowledgeBase.contactPhone}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };
      setMessages((prev) => [autoReply, ...prev]);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Integration Information & Webhook Activity (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">WhatsApp B2B Integration</h3>
              <p className="text-xs text-slate-500">Autonomous post-call notifications & summaries</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Depioro automatically triggers the <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">send_whatsapp_summary</code> tool
            upon booking confirmation to deliver appointment agendas, calendar invitations, and meeting locations directly to the caller's WhatsApp number.
          </p>

          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-2 text-teal-950">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>WhatsApp Business API Gateway Active</span>
            </div>
            <div className="text-[11px] text-teal-800 space-y-1">
              <div>• Sender: Verified Official Business Account</div>
              <div>• Automated Template: <span className="font-mono font-semibold">booking_confirmation_v2</span></div>
              <div>• Delivery SLA: &lt; 2 seconds post-call wrap-up</div>
            </div>
          </div>
        </div>

        {/* Recent Webhook Activity Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-1">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">Dispatch Log History</span>
            <span className="text-[10px] text-slate-400 font-mono">{messages.length} messages</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-900 mb-1">
                  <span>{m.customerName} ({m.phone})</span>
                  <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                  "{m.message}"
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-teal-700">
                  <span className="flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-teal-600" />
                    <span>Delivered via WhatsApp</span>
                  </span>
                  <span className="font-mono text-slate-400">ID: {m.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Authentic WhatsApp Phone Mockup (7 cols) */}
      <div className="lg:col-span-7 flex justify-center items-center">
        <div className="w-full max-w-md bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
          {/* Phone Shell & WhatsApp Screen */}
          <div className="bg-[#0b141a] rounded-[28px] overflow-hidden flex flex-col h-[600px] border border-slate-700/50">
            {/* WhatsApp Top Header Bar */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between text-white border-b border-[#2a3942]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-sm shadow">
                  D
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-[#e9edef]">
                    <span>Depioro AI</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-[#8696a0]">
                    {knowledgeBase.companyName} • Verified Account
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#aebac1]">
                <PhoneCall className="w-4 h-4" />
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Chat Messages Feed with WhatsApp Doodle Background */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95">
              {/* Security notice pill */}
              <div className="text-center my-2">
                <span className="text-[10px] px-3 py-1 rounded-lg bg-[#182229] text-[#ffd279] border border-[#222d34] shadow-sm">
                  🔒 Messages are end-to-end encrypted with Depioro B2B Gateway.
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="text-center text-[#8696a0] text-xs py-12">
                  No WhatsApp summaries dispatched yet. Book an appointment during a call to trigger an automated confirmation!
                </div>
              ) : (
                messages.slice().reverse().map((msg) => {
                  const isDepioro = !msg.id.includes('user');
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isDepioro ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm relative ${
                          isDepioro
                            ? 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]'
                            : 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                          <span>{msg.timestamp}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom WhatsApp Input Simulator */}
            <form
              onSubmit={handleSendReply}
              className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#2a3942]"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply as customer..."
                className="flex-1 bg-[#2a3942] text-[#d1d7db] text-xs rounded-lg px-3.5 py-2.5 focus:outline-none placeholder:text-[#8696a0]"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-40 text-white flex items-center justify-center transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
