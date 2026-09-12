import React, { useState, useEffect } from 'react';
import { Server, Radio, Key, CheckCircle2, RefreshCw, Send, PhoneForwarded, Calendar, MessageSquare, Copy, Check, ShieldAlert, Cpu, Terminal, ArrowRight } from 'lucide-react';

interface BackendConsoleProps {
  onRefreshAppState?: () => void;
}

export const BackendConsole: React.FC<BackendConsoleProps> = ({ onRefreshAppState }) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // LiveKit Token Generator State
  const [roomName, setRoomName] = useState('depioro-call-room');
  const [participantName, setParticipantName] = useState('caller-operator');
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Tool Invoker State
  const [activeToolTab, setActiveToolTab] = useState<'availability' | 'book' | 'transfer' | 'whatsapp'>('availability');
  const [toolExecuting, setToolExecuting] = useState(false);
  const [toolResponse, setToolResponse] = useState<any>(null);

  // Form states for tools
  const [availDate, setAvailDate] = useState('tomorrow');
  const [availTime, setAvailTime] = useState('afternoon');

  const [bookName, setBookName] = useState('Marcus Aurelius');
  const [bookPhone, setBookPhone] = useState('+1 (555) 349-8812');
  const [bookEmail, setBookEmail] = useState('marcus@meditations.com');
  const [bookSlot, setBookSlot] = useState('Friday at 2:00 PM');

  const [transferReason, setTransferReason] = useState('Caller requests custom enterprise SLA agreement');

  const [waPhone, setWaPhone] = useState('+1 (555) 349-8812');
  const [waName, setWaName] = useState('Marcus Aurelius');
  const [waDetails, setWaDetails] = useState('30-Minute Architecture Discovery Consultation on Friday at 2:00 PM');

  // Webhook Simulator State
  const [webhookPhone, setWebhookPhone] = useState('+1 (555) 987-6543');
  const [webhookName, setWebhookName] = useState('Sarah Connor');
  const [webhookText, setWebhookText] = useState('Hi Depioro, please verify if Friday at 2 PM is still available?');
  const [webhookSending, setWebhookSending] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerateLiveKitToken = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName }),
      });
      const data = await res.json();
      setGeneratedToken(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleExecuteTool = async (endpoint: string, payload: any) => {
    setToolExecuting(true);
    const start = performance.now();
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setToolResponse({ ...data, _latencyMs: duration, _status: res.status });
      if (onRefreshAppState) onRefreshAppState();
    } catch (e: any) {
      setToolResponse({ error: e.message, _status: 500 });
    } finally {
      setToolExecuting(false);
    }
  };

  const handleSendWebhook = async () => {
    setWebhookSending(true);
    try {
      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: webhookPhone,
          name: webhookName,
          message: webhookText,
        }),
      });
      const data = await res.json();
      setWebhookResponse(data);
      if (onRefreshAppState) onRefreshAppState();
    } catch (e: any) {
      setWebhookResponse({ error: e.message });
    } finally {
      setWebhookSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Backend System Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-md">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backend & LiveKit Services Architecture</h2>
              <p className="text-xs text-slate-500">
                Full-stack Node.js / Express API gateway, LiveKit WebRTC token generator, and tool endpoints
              </p>
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {/* 4 Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Card 1: Gemini Engine */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Gemini API Backend</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-mono font-semibold text-emerald-700">
              {systemStatus?.gemini?.model || 'gemini-3.8-flash'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Mode: <span className="font-semibold text-slate-700">{systemStatus?.gemini?.mode || 'gemini_cloud_live'}</span>
            </div>
          </div>

          {/* Card 2: LiveKit WebRTC */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Radio className="w-4 h-4 text-teal-600" />
                <span>LiveKit WebRTC</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-teal-500" />
            </div>
            <div className="text-xs font-mono font-semibold text-teal-800 truncate">
              {systemStatus?.livekit?.serverUrl || 'wss://depioro.livekit.cloud'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              SDK: <span className="font-semibold text-slate-700">livekit-server-sdk v2</span>
            </div>
          </div>

          {/* Card 3: WhatsApp Webhook Gateway */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Gateway</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-mono font-semibold text-slate-800">
              /api/webhooks/whatsapp
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Verification: <span className="font-semibold text-emerald-700">Active (hub.challenge)</span>
            </div>
          </div>

          {/* Card 4: Store & Sessions */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Server className="w-4 h-4 text-slate-700" />
                <span>In-Memory State</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Up: {systemStatus?.stats?.serverUptimeSeconds || 0}s
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {systemStatus?.stats?.activeAppointments || 0} Bookings • {systemStatus?.stats?.dispatchedWhatsApp || 0} WhatsApp
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Lead status: <span className="font-semibold uppercase text-emerald-700">{systemStatus?.stats?.leadQualificationStatus || 'active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: LiveKit Token Generator & Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: LiveKit WebRTC Token Generator (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">LiveKit Access Token Generator</h3>
                <p className="text-xs text-slate-500">Endpoint: <code className="font-mono">POST /api/livekit/token</code></p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              JWT Signed
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Participant Identity</label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateLiveKitToken}
              disabled={tokenLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
            >
              {tokenLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Generate WebRTC Access Token</span>
            </button>

            {generatedToken && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-teal-400 font-bold">
                  <span>Generated JWT Token</span>
                  <button
                    onClick={() => handleCopy(generatedToken.token)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-slate-950 rounded text-[11px] break-all max-h-24 overflow-y-auto text-emerald-300">
                  {generatedToken.token}
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Server URL: <span className="text-slate-200">{generatedToken.serverUrl}</span></div>
                  <div>Room: <span className="text-slate-200">{generatedToken.roomName}</span></div>
                  <div>Participant: <span className="text-slate-200">{generatedToken.participantName}</span></div>
                  <div className="text-emerald-400 font-sans mt-1">✓ Grants: roomJoin, canPublish, canSubscribe</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Webhook Tester (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">WhatsApp Webhook Inbound Simulator</h3>
                <p className="text-xs text-slate-500">Endpoint: <code className="font-mono">POST /api/webhooks/whatsapp</code></p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Cloud API Ready
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={webhookPhone}
                  onChange={(e) => setWebhookPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incoming Message Body</label>
              <textarea
                rows={2}
                value={webhookText}
                onChange={(e) => setWebhookText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSendWebhook}
              disabled={webhookSending}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
            >
              {webhookSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Simulate Inbound WhatsApp Webhook</span>
            </button>

            {webhookResponse && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">Webhook Handler Output:</div>
                <pre className="text-[11px] overflow-x-auto text-slate-300">
                  {JSON.stringify(webhookResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Autonomous Function Tools Interactive Invoker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Direct Tool Endpoints Tester</h3>
              <p className="text-xs text-slate-500">Test all 4 Depioro autonomous agent tools via direct REST API calls</p>
            </div>
          </div>
        </div>

        {/* Tool Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setActiveToolTab('availability'); setToolResponse(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeToolTab === 'availability'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. check_calendar_availability</span>
          </button>

          <button
            onClick={() => { setActiveToolTab('book'); setToolResponse(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeToolTab === 'book'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>2. book_appointment</span>
          </button>

          <button
            onClick={() => { setActiveToolTab('transfer'); setToolResponse(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeToolTab === 'transfer'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PhoneForwarded className="w-3.5 h-3.5" />
            <span>3. transfer_to_human</span>
          </button>

          <button
            onClick={() => { setActiveToolTab('whatsapp'); setToolResponse(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeToolTab === 'whatsapp'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>4. send_whatsapp_summary</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Parameters (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            {activeToolTab === 'availability' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Calls <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">POST /api/tools/check-calendar-availability</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={availDate}
                      onChange={(e) => setAvailDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time of Day</label>
                    <input
                      type="text"
                      value={availTime}
                      onChange={(e) => setAvailTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleExecuteTool('/api/tools/check-calendar-availability', { date: availDate, time_of_day: availTime })}
                  disabled={toolExecuting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                >
                  Execute Tool
                </button>
              </div>
            )}

            {activeToolTab === 'book' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Calls <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">POST /api/tools/book-appointment</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="text"
                      value={bookEmail}
                      onChange={(e) => setBookEmail(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Timeslot</label>
                    <input
                      type="text"
                      value={bookSlot}
                      onChange={(e) => setBookSlot(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleExecuteTool('/api/tools/book-appointment', {
                    name: bookName,
                    phone: bookPhone,
                    email: bookEmail,
                    datetime_display: bookSlot,
                    datetime_iso: new Date().toISOString(),
                  })}
                  disabled={toolExecuting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                >
                  Execute Tool
                </button>
              </div>
            )}

            {activeToolTab === 'transfer' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Calls <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">POST /api/tools/transfer-to-human</code>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Escalation Reason</label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleExecuteTool('/api/tools/transfer-to-human', { reason: transferReason })}
                  disabled={toolExecuting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                >
                  Execute Tool
                </button>
              </div>
            )}

            {activeToolTab === 'whatsapp' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Calls <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">POST /api/tools/send-whatsapp-summary</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Summary</label>
                  <input
                    type="text"
                    value={waDetails}
                    onChange={(e) => setWaDetails(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleExecuteTool('/api/tools/send-whatsapp-summary', {
                    phone: waPhone,
                    customer_name: waName,
                    appointment_details: waDetails,
                  })}
                  disabled={toolExecuting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
                >
                  Execute Tool
                </button>
              </div>
            )}
          </div>

          {/* Response JSON Inspector (6 cols) */}
          <div className="lg:col-span-6 bg-slate-950 rounded-xl p-4 border border-slate-800 text-slate-200 font-mono text-xs flex flex-col">
            <div className="flex items-center justify-between mb-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <span>Backend Response JSON</span>
              {toolResponse?._latencyMs !== undefined && (
                <span className="text-[11px] text-emerald-400">
                  HTTP {toolResponse._status} • {toolResponse._latencyMs}ms
                </span>
              )}
            </div>

            <pre className="flex-1 overflow-x-auto text-[11px] text-slate-300 leading-relaxed max-h-52 overflow-y-auto">
              {toolResponse
                ? JSON.stringify(toolResponse, null, 2)
                : '// Click "Execute Tool" to inspect server-side JSON response and state updates.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
