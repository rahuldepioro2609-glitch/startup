import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { AccessToken } from 'livekit-server-sdk';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for the session
interface AppointmentRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  datetime_iso: string;
  datetime_display: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  createdAt: string;
}

interface WhatsAppRecord {
  id: string;
  phone: string;
  customerName: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface LeadQualificationRecord {
  callerName: string | null;
  phone: string | null;
  businessNeed: string | null;
  status: 'unqualified' | 'discovering' | 'qualifying' | 'qualified' | 'escalated';
}

let appointments: AppointmentRecord[] = [
  {
    id: 'apt-101',
    name: 'Rahul Verma',
    phone: '+91 98765 43210',
    email: 'rahul@enterprise.in',
    datetime_iso: '2026-09-11T14:00:00Z',
    datetime_display: 'Friday at 2:00 PM IST',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
];

let whatsappMessages: WhatsAppRecord[] = [
  {
    id: 'wa-1',
    phone: '+91 98765 43210',
    customerName: 'Rahul Verma',
    message: 'Namaste Rahul ji, Apex Cloud Solutions ke saath aapki 30-minute cloud consultation meeting Friday at 2:00 PM IST confirm ho gayi hai. Dhanyawad!',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered',
  }
];

let leadQualification: LeadQualificationRecord = {
  callerName: null,
  phone: null,
  businessNeed: null,
  status: 'unqualified',
};

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set. Using intelligent fallback simulation.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Function Declarations matching the prompt
const checkCalendarAvailabilityDecl: FunctionDeclaration = {
  name: 'check_calendar_availability',
  description: 'Checks open calendar time slots for scheduling consultations or discovery calls.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: 'The requested date (e.g., "tomorrow", "Thursday", "2026-09-12")',
      },
      time_of_day: {
        type: Type.STRING,
        description: 'Preferred time of day (e.g., "morning", "afternoon", "2:00 PM")',
      },
    },
    required: ['date'],
  },
};

const bookAppointmentDecl: FunctionDeclaration = {
  name: 'book_appointment',
  description: 'Books an appointment consultation with the operations or solutions team.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "Caller's full name",
      },
      phone: {
        type: Type.STRING,
        description: 'Primary phone / WhatsApp number',
      },
      slot_time: {
        type: Type.STRING,
        description: 'Confirmed date and time slot (e.g., "Tomorrow at 3:00 PM IST")',
      },
      datetime_iso: {
        type: Type.STRING,
        description: 'Optional ISO date timestamp representation',
      },
    },
    required: ['name', 'phone'],
  },
};

const transferToHumanDecl: FunctionDeclaration = {
  name: 'transfer_to_human',
  description: 'Transfers the caller directly to a human team member or supervisor.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: 'Reason for transferring (e.g., explicit caller demand, angry caller, unresolved after 2 attempts)',
      },
    },
    required: ['reason'],
  },
};

const sendWhatsappSummaryDecl: FunctionDeclaration = {
  name: 'send_whatsapp_summary',
  description: 'Sends confirmation and appointment details straight to the caller WhatsApp.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      phone: {
        type: Type.STRING,
        description: 'Recipient phone / WhatsApp number',
      },
      customer_name: {
        type: Type.STRING,
        description: "Customer's full name",
      },
      details: {
        type: Type.STRING,
        description: 'Summary of the meeting time and key discussion notes',
      },
      appointment_details: {
        type: Type.STRING,
        description: 'Optional alias for details',
      },
    },
    required: ['phone', 'customer_name'],
  },
};

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// API: Comprehensive System Status & Backend Diagnostics
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Depioro.ai Autonomous Engine',
    gemini: {
      model: 'gemini-3.8-flash',
      isConfigured: Boolean(process.env.GEMINI_API_KEY),
      mode: process.env.GEMINI_API_KEY ? 'gemini_cloud_live' : 'autonomous_simulator',
    },
    livekit: {
      configured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
      serverUrl: process.env.LIVEKIT_URL || 'wss://depioro.livekit.cloud',
      apiKeyConfigured: Boolean(process.env.LIVEKIT_API_KEY),
    },
    whatsapp: {
      gateway: 'WhatsApp Business Cloud API',
      webhookVerified: true,
      hasApiToken: Boolean(process.env.WHATSAPP_API_TOKEN),
    },
    stats: {
      activeAppointments: appointments.length,
      dispatchedWhatsApp: whatsappMessages.length,
      leadQualificationStatus: leadQualification.status,
      serverUptimeSeconds: Math.floor(process.uptime()),
    },
    time: new Date().toISOString(),
  });
});

// API: LiveKit WebRTC Token Generation
app.all('/api/livekit/token', async (req, res) => {
  try {
    const roomName = (req.body?.roomName || req.query?.roomName || 'depioro-call-room') as string;
    const participantName = (req.body?.participantName || req.query?.participantName || `caller-${Math.floor(1000 + Math.random() * 9000)}`) as string;

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    const livekitUrl = process.env.LIVEKIT_URL || 'wss://depioro.livekit.cloud';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    res.json({
      token,
      roomName,
      serverUrl: livekitUrl,
      participantName,
      isConfigured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
    });
  } catch (error: any) {
    console.error('LiveKit token generation error:', error);
    res.status(500).json({
      error: 'Failed to generate LiveKit access token',
      details: error.message,
    });
  }
});

// API: LiveKit Server Status
app.get('/api/livekit/status', (req, res) => {
  res.json({
    configured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
    serverUrl: process.env.LIVEKIT_URL || 'wss://depioro.livekit.cloud',
    hasApiKey: Boolean(process.env.LIVEKIT_API_KEY),
    hasApiSecret: Boolean(process.env.LIVEKIT_API_SECRET),
    clientSdk: 'livekit-client',
    serverSdk: 'livekit-server-sdk',
  });
});

// -------------------------------------------------------------
// DEDICATED TOOL ENDPOINTS (The 4 Autonomous Agent Function Tools)
// -------------------------------------------------------------

// Tool 1: Check Calendar Availability
app.post('/api/tools/check-calendar-availability', (req, res) => {
  const { date, time_of_day } = req.body;
  const targetDate = date || 'tomorrow';
  const targetTime = time_of_day || 'afternoon';

  const availableSlots = [
    `${targetDate === 'tomorrow' ? 'Tomorrow' : targetDate} at 10:30 AM`,
    `${targetDate === 'tomorrow' ? 'Tomorrow' : targetDate} at 2:00 PM`,
    'Friday at 11:00 AM',
    'Friday at 3:30 PM',
  ];

  res.json({
    success: true,
    tool: 'check_calendar_availability',
    availableSlots,
    requestedDate: targetDate,
    requestedTimeOfDay: targetTime,
    durationMinutes: 30,
    note: 'Consultation with Lead Solutions Architect',
  });
});

// Tool 2: Book Appointment
app.post('/api/tools/book-appointment', (req, res) => {
  const { name, phone, email, datetime_iso, datetime_display } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required to book an appointment' });
  }

  const timeDisplay = datetime_display || formatDisplayDateTime(datetime_iso || '2026-09-17T14:00:00Z');
  const newAppointment: AppointmentRecord = {
    id: `apt-${Date.now()}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`,
    datetime_iso: datetime_iso || new Date().toISOString(),
    datetime_display: timeDisplay,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  appointments.unshift(newAppointment);

  // Auto-trigger WhatsApp confirmation message
  const newWa: WhatsAppRecord = {
    id: `wa-${Date.now()}`,
    phone,
    customerName: name,
    message: `Hello ${name}, this is Depioro confirming your 30-minute consultation on ${timeDisplay}. A calendar invite has been sent to ${newAppointment.email}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered',
  };
  whatsappMessages.unshift(newWa);

  // Update lead status to qualified
  leadQualification.callerName = name;
  leadQualification.phone = phone;
  leadQualification.status = 'qualified';

  res.json({
    success: true,
    tool: 'book_appointment',
    appointment: newAppointment,
    whatsappMessage: newWa,
    leadQualification,
  });
});

// Tool 3: Transfer to Human
app.post('/api/tools/transfer-to-human', (req, res) => {
  const { reason, caller_name, phone } = req.body;
  const escalationReason = reason || 'Caller requested human escalation or reached boundary condition';

  leadQualification.status = 'escalated';
  if (caller_name) leadQualification.callerName = caller_name;
  if (phone) leadQualification.phone = phone;

  res.json({
    success: true,
    tool: 'transfer_to_human',
    transferred: true,
    operator: 'Sarah Jenkins (Director of Client Operations, Ext 402)',
    reason: escalationReason,
    escalationTimestamp: new Date().toISOString(),
    callerInfo: {
      name: caller_name || leadQualification.callerName,
      phone: phone || leadQualification.phone,
    },
  });
});

// Tool 4: Send WhatsApp Summary
app.post('/api/tools/send-whatsapp-summary', (req, res) => {
  const { phone, customer_name, appointment_details } = req.body;

  if (!phone || !customer_name) {
    return res.status(400).json({ error: 'Phone and customer_name are required' });
  }

  const details = appointment_details || '30-Minute Cloud Solutions Discovery Consultation';
  const newWa: WhatsAppRecord = {
    id: `wa-${Date.now()}`,
    phone,
    customerName: customer_name,
    message: `Hello ${customer_name}! Depioro here. Summary of our discussion: ${details}. If you need anything before our call, reply here directly.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered',
  };

  whatsappMessages.unshift(newWa);

  res.json({
    success: true,
    tool: 'send_whatsapp_summary',
    message: newWa,
    deliveryStatus: 'delivered',
  });
});

// -------------------------------------------------------------
// APPOINTMENTS CRUD ENDPOINTS
// -------------------------------------------------------------
app.get('/api/appointments', (req, res) => {
  res.json({
    success: true,
    total: appointments.length,
    appointments,
  });
});

app.post('/api/appointments', (req, res) => {
  const { name, phone, email, datetime_iso, datetime_display } = req.body;
  const newAppointment: AppointmentRecord = {
    id: `apt-${Date.now()}`,
    name: name || 'New Client',
    phone: phone || '+1 (555) 000-0000',
    email: email || 'client@example.com',
    datetime_iso: datetime_iso || new Date().toISOString(),
    datetime_display: datetime_display || 'Scheduled Slot',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  appointments.unshift(newAppointment);
  res.json({ success: true, appointment: newAppointment });
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex((a) => a.id === id);
  if (index !== -1) {
    appointments[index].status = 'cancelled';
    return res.json({ success: true, message: 'Appointment cancelled', appointment: appointments[index] });
  }
  res.status(404).json({ error: 'Appointment not found' });
});

app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { datetime_display, datetime_iso } = req.body;
  const item = appointments.find((a) => a.id === id);
  if (item) {
    if (datetime_display) item.datetime_display = datetime_display;
    if (datetime_iso) item.datetime_iso = datetime_iso;
    item.status = 'rescheduled';
    return res.json({ success: true, appointment: item });
  }
  res.status(404).json({ error: 'Appointment not found' });
});

// -------------------------------------------------------------
// LEADS QUALIFICATION ENDPOINTS
// -------------------------------------------------------------
app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    lead: leadQualification,
  });
});

app.post('/api/leads', (req, res) => {
  const { callerName, phone, businessNeed, status } = req.body;
  if (callerName !== undefined) leadQualification.callerName = callerName;
  if (phone !== undefined) leadQualification.phone = phone;
  if (businessNeed !== undefined) leadQualification.businessNeed = businessNeed;
  if (status !== undefined) leadQualification.status = status;

  res.json({
    success: true,
    lead: leadQualification,
  });
});

// -------------------------------------------------------------
// WHATSAPP WEBHOOKS (Meta / Twilio compliant webhook handlers)
// -------------------------------------------------------------

// Webhook Verification (GET)
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'depioro_webhook_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('WhatsApp webhook verified successfully.');
    return res.status(200).send(challenge);
  }
  res.status(403).send('Forbidden: Token mismatch');
});

// Webhook Inbound Messages (POST)
app.post('/api/webhooks/whatsapp', (req, res) => {
  try {
    const body = req.body;
    let senderPhone = body.from || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || '+1 (555) 234-8901';
    let messageText = body.message || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || 'Hello from WhatsApp';
    let senderName = body.name || body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || 'Customer';

    const incomingRecord: WhatsAppRecord = {
      id: `wa-inbound-${Date.now()}`,
      phone: senderPhone,
      customerName: senderName,
      message: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    whatsappMessages.unshift(incomingRecord);

    // Auto-respond via Depioro WhatsApp Bot
    const autoReplyText = `Depioro Bot: Thanks for reaching out, ${senderName}. Your message has been logged with operations. We will follow up shortly!`;
    const replyRecord: WhatsAppRecord = {
      id: `wa-bot-reply-${Date.now()}`,
      phone: senderPhone,
      customerName: 'Depioro AI',
      message: autoReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setTimeout(() => {
      whatsappMessages.unshift(replyRecord);
    }, 800);

    res.json({
      status: 'received',
      messageId: incomingRecord.id,
      autoReplyQueued: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Webhook processing failed', details: err.message });
  }
});

// API: Get State
app.get('/api/state', (req, res) => {
  res.json({
    appointments,
    whatsappMessages,
    leadQualification,
  });
});

// API: Reset State
app.post('/api/state/reset', (req, res) => {
  leadQualification = {
    callerName: null,
    phone: null,
    businessNeed: null,
    status: 'unqualified',
  };
  res.json({ success: true, leadQualification });
});

// Build system prompt based on user instructions and custom knowledge base
function buildSystemPrompt(kb: any): string {
  const company = kb.companyName || 'Apex Cloud Solutions';
  const servicesList = (kb.services || [])
    .map((s: any) => `- ${s.name}: ${s.description} (Pricing: ${s.pricing})`)
    .join('\n');
  const faqsList = (kb.faqs || [])
    .map((f: any) => `Q: ${f.q}\nA: ${f.a}`)
    .join('\n\n');

  return `# SYSTEM PROMPT: DEPIORO AI EMPLOYEE (INDIA REGION)

## 1. ROLE & IDENTITY
You are "Depioro," an autonomous AI Receptionist for ${company} in India. You handle incoming phone calls and send instant WhatsApp follow-ups. You speak natural Hinglish (Hindi + English blend) or pure English based on the caller's preference.

- Tone: Warm, polite, respectful, and efficient.
- Cultural Etiquette: Greet with "Namaste" or "Hello", use respectful honorifics like "Ji" when appropriate (e.g. "Rahul ji", "Haan ji").
- Persona: Helpful, concise, and clear.

---

## 2. VOICE & LANGUAGE CONSTRAINTS
- Hinglish Adaptability: If the caller speaks Hindi or Hinglish, respond in natural Hinglish. If they speak in English, switch to English.
- Short Audio Responses: Keep each response to 1-2 short sentences (under 20 words).
- Spoken Numbers & Pricing: Speak Indian currency amounts clearly (e.g., say "Doh hazar paanch sau rupaye" or "Two thousand five hundred rupees", NOT raw numbers).
- Interruption Handling: Stop talking instantly if the caller speaks over you.

---

## 3. CONVERSATIONAL WORKFLOW
1. GREETING:
   "Namaste! Thanks for calling ${company}. Main Depioro AI bol raha hu. Bataiye main aapki kya help kar sakta hu?"

2. DISCOVERY & FAQ:
   Answer queries using the Knowledge Base. If information is missing, say: "Iske baare mein main team se confirm karke aapko WhatsApp par details bhej deta hu."

3. LEAD QUALIFICATION:
   Collect Name, WhatsApp number, and specific inquiry.

4. APPOINTMENT BOOKING:
   - Offer open slots via \`check_calendar_availability\`.
   - Confirm and execute \`book_appointment\`.

5. WHATSAPP CONFIRMATION:
   - Say: "Maine aapki appointment book kar di hai aur confirmation WhatsApp par bhej diya hai. Dhanyawad!"
   - Execute \`send_whatsapp_summary\`.

---

## 4. FUNCTION TOOLS DEFINITION
- \`check_calendar_availability(date: string, time_of_day: string)\`
- \`book_appointment(name: string, phone: string, slot_time: string)\`
- \`transfer_to_human(reason: string)\`
- \`send_whatsapp_summary(phone: string, customer_name: string, details: string)\`

---

## 5. KNOWLEDGE BASE
Business Name: ${company}
Tagline: ${kb.tagline || 'Enterprise Cloud & DevOps Solutions'}
Operating Hours: ${kb.operatingHours || 'Monday to Saturday, 9:30 AM to 6:30 PM IST'}
Contact Phone: ${kb.contactPhone || '+91 98765 43210'}
Contact Email: ${kb.contactEmail || 'contact@apexcloud.in'}
Escalation Manager: ${kb.escalationManager || 'Rohan Sharma (Director of Client Operations)'}

Services & Pricing:
${servicesList}

Frequently Asked Questions:
${faqsList}
`;
}

// Helper to format natural datetime string
function formatDisplayDateTime(val: string): string {
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  } catch (e) {
    // fallback
  }
  return val;
}

// API: Process Chat & Voice input
app.all(['/api/chat', '/api/depioro/call-turn'], async (req, res) => {
  try {
    const messages = req.body?.messages || (req.body?.message ? [{ role: 'user', content: req.body.message }] : []);
    const knowledgeBase = req.body?.knowledgeBase || {};
    const leadInfo = req.body?.leadInfo;
    const currentLead = leadInfo || leadQualification;

    const userMessage = messages[messages.length - 1];
    const userText = userMessage?.content || '';

    // If no Gemini key is provided, perform smart high-fidelity simulation
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const simulated = runSimulatedConversation(userText, messages, knowledgeBase, currentLead);
      return res.json(simulated);
    }

    const ai = getGeminiClient();
    const systemInstruction = buildSystemPrompt(knowledgeBase);

    // Format conversation history for Gemini
    const contents: any[] = [];
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const toolDeclarations = [
      checkCalendarAvailabilityDecl,
      bookAppointmentDecl,
      transferToHumanDecl,
      sendWhatsappSummaryDecl,
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ functionDeclarations: toolDeclarations }],
      },
    });

    const executedTools: any[] = [];
    let assistantReply = response.text || '';

    // Process tool calls if any
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        const toolName = call.name;
        const toolArgs = (call.args || {}) as Record<string, any>;
        let toolResult: any = null;

        if (toolName === 'check_calendar_availability') {
          toolResult = {
            availableSlots: [
              'Tomorrow at 10:30 AM',
              'Tomorrow at 2:00 PM',
              'Friday at 11:00 AM',
              'Friday at 3:30 PM',
            ],
            note: 'Slots are 30-minute discovery consultations with lead architect.',
          };
          executedTools.push({
            id: `tool-${Date.now()}-${Math.random()}`,
            name: toolName,
            args: toolArgs,
            result: toolResult,
            timestamp: Date.now(),
          });
        } else if (toolName === 'book_appointment') {
          const slot = toolArgs.slot_time || toolArgs.datetime_iso || 'Tomorrow at 3:00 PM IST';
          const newApt: AppointmentRecord = {
            id: `apt-${Date.now()}`,
            name: toolArgs.name || currentLead.callerName || 'Valued Caller',
            phone: toolArgs.phone || currentLead.phone || '+91 98765 43210',
            email: toolArgs.email || 'client@enterprise.in',
            datetime_iso: slot,
            datetime_display: formatDisplayDateTime(slot),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          };
          appointments.unshift(newApt);
          toolResult = { success: true, appointmentId: newApt.id, confirmedTime: newApt.datetime_display };
          executedTools.push({
            id: `tool-${Date.now()}-${Math.random()}`,
            name: toolName,
            args: toolArgs,
            result: toolResult,
            timestamp: Date.now(),
          });
        } else if (toolName === 'transfer_to_human') {
          toolResult = {
            transferred: true,
            operator: knowledgeBase.escalationManager || 'Rohan Sharma (Client Operations)',
            reason: toolArgs.reason,
          };
          executedTools.push({
            id: `tool-${Date.now()}-${Math.random()}`,
            name: toolName,
            args: toolArgs,
            result: toolResult,
            timestamp: Date.now(),
          });
        } else if (toolName === 'send_whatsapp_summary') {
          const detailStr = toolArgs.details || toolArgs.appointment_details || '30-minute discovery consultation';
          const customer = toolArgs.customer_name || currentLead.callerName || 'Client';
          const newWa: WhatsAppRecord = {
            id: `wa-${Date.now()}`,
            phone: toolArgs.phone || currentLead.phone || '+91 98765 43210',
            customerName: customer,
            message: `Namaste ${customer} ji, ${knowledgeBase.companyName || 'Apex Cloud Solutions'} ke saath aapki meeting confirm ho gayi hai: ${detailStr}. Dhanyawad!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
          };
          whatsappMessages.unshift(newWa);
          toolResult = { success: true, messageId: newWa.id, status: 'delivered' };
          executedTools.push({
            id: `tool-${Date.now()}-${Math.random()}`,
            name: toolName,
            args: toolArgs,
            result: toolResult,
            timestamp: Date.now(),
          });
        }
      }

      // If response text was empty because of function calls, produce the exact mandated response
      if (!assistantReply || assistantReply.trim().length === 0) {
        const isHinglishInput = /namaste|aap|mera|kya|bataiye|kardo|karni|baje|subah|dopahar|hai|kaun/i.test(userText);
        if (executedTools.some((t) => t.name === 'transfer_to_human')) {
          assistantReply = isHinglishInput
            ? 'Main aapko hamari team se connect kar raha hu. Kripya ek minute hold karein.'
            : 'Let me transfer you directly to a human team member. Please hold on one moment.';
        } else if (executedTools.some((t) => t.name === 'send_whatsapp_summary' || t.name === 'book_appointment')) {
          assistantReply = isHinglishInput
            ? 'Maine aapki appointment book kar di hai aur confirmation WhatsApp par bhej diya hai. Dhanyawad!'
            : 'I have booked your appointment and sent the confirmation to your WhatsApp. Thank you!';
        } else if (executedTools.some((t) => t.name === 'check_calendar_availability')) {
          assistantReply = isHinglishInput
            ? 'Hamare paas kal dopahar 2 baje aur Friday subah 11 baje ke slots khali hain. Kaunsa time theek rahega?'
            : 'We have open times tomorrow at 2:00 PM or Friday at 11:00 AM. Would one of those work for you?';
        } else {
          assistantReply = isHinglishInput
            ? 'Maine system me note kar liya hai. Aur batayein kya help kar sakta hu?'
            : "I've noted that in our system. How else can I help you today?";
        }
      }
    }

    // Extract / update qualification signals
    const updatedLead = extractLeadInfo(userText, assistantReply, currentLead, executedTools);

    return res.json({
      text: assistantReply.trim(),
      toolCalls: executedTools,
      leadQualification: updatedLead,
      appointments,
      whatsappMessages,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Graceful fallback if Gemini encountered network or token issues
    const fallback = runSimulatedConversation(
      req.body.messages?.[req.body.messages.length - 1]?.content || '',
      req.body.messages || [],
      req.body.knowledgeBase || {},
      req.body.leadInfo || leadQualification
    );
    return res.json(fallback);
  }
});

// Heuristic extractor for lead qualification to keep real-time UI synchronized
function extractLeadInfo(
  userText: string,
  modelText: string,
  existing: LeadQualificationRecord,
  toolCalls: any[]
): LeadQualificationRecord {
  const result: LeadQualificationRecord = { ...existing };

  // Check from tool calls
  for (const tc of toolCalls) {
    if (tc.name === 'book_appointment' || tc.name === 'send_whatsapp_summary') {
      if (tc.args.name || tc.args.customer_name) {
        result.callerName = tc.args.name || tc.args.customer_name;
      }
      if (tc.args.phone) {
        result.phone = tc.args.phone;
      }
    }
  }

  // Extract phone pattern: international, 10-digit Indian (starts with 6-9), or US formatted
  const phoneMatch = userText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/);
  if (phoneMatch && !result.phone) {
    result.phone = phoneMatch[0];
  }

  // Extract name introduction (English & Hinglish: "my name is", "mera naam ... hai", "this is", "main ... bol raha hu")
  const nameMatch = userText.match(/(?:my name is|this is|i am|i'm|mera naam|main)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch && !result.callerName) {
    const candidate = nameMatch[1].trim();
    const blacklist = ['upset', 'angry', 'calling', 'interested', 'looking', 'ready', 'here', 'just', 'wondering', 'frustrated', 'depioro', 'bol', 'ek', 'ekdum'];
    if (!blacklist.includes(candidate.toLowerCase())) {
      result.callerName = candidate;
    }
  }

  // Extract business need / scope keywords
  const needTriggers = [
    'cloud migration',
    'cloud',
    'devops',
    'security audit',
    'soc 2',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'consulting',
    'pricing',
    'retainer',
    'uptime',
    'infrastructure',
    'erp',
  ];
  for (const trigger of needTriggers) {
    if (userText.toLowerCase().includes(trigger)) {
      result.businessNeed = result.businessNeed ? `${result.businessNeed}, ${trigger}` : trigger;
    }
  }

  // Update status based on completeness
  if (result.callerName && result.phone && result.businessNeed) {
    result.status = 'qualified';
  } else if (result.callerName || result.phone || result.businessNeed) {
    result.status = 'qualifying';
  } else {
    result.status = 'discovering';
  }

  return result;
}

// High-fidelity local simulation if API key is not ready or for instant testing
function runSimulatedConversation(
  userText: string,
  history: any[],
  kb: any,
  lead: LeadQualificationRecord
) {
  const company = kb.companyName || 'Apex Cloud Solutions';
  const text = userText.toLowerCase();
  const isHinglish = /namaste|aap|mera|meri|kya|bataiye|kardo|karni|baje|subah|dopahar|hai|kaun|chahiye|kitna|kharcha|bhejo|insaan|madad|theek|rahul|amit/i.test(userText);
  const toolCalls: any[] = [];
  let reply = '';
  const currentLead: LeadQualificationRecord = { ...lead };

  // Check for human transfer trigger
  if (text.includes('human') || text.includes('manager') || text.includes('operator') || text.includes('angry') || text.includes('speak to a person') || text.includes('insaan se') || text.includes('transfer')) {
    const reason = 'Caller requested human manager';
    toolCalls.push({
      id: `tool-${Date.now()}`,
      name: 'transfer_to_human',
      args: { reason },
      result: { transferred: true, operator: kb.escalationManager || 'Sarah Jenkins' },
      timestamp: Date.now(),
    });
    reply = isHinglish
      ? 'Main aapko hamari team se connect kar raha hu. Kripya ek minute hold karein.'
      : 'Let me transfer you directly to a human team member. Please hold on one moment.';
    currentLead.status = 'escalated';
    return {
      text: reply,
      toolCalls,
      leadQualification: currentLead,
      appointments,
      whatsappMessages,
    };
  }

  // Check if caller asks if AI
  if (text.includes('are you an ai') || text.includes('are you ai') || text.includes('robot') || text.includes('real person') || text.includes('ai ho') || text.includes('insaan ho')) {
    reply = isHinglish
      ? `Haan, main Depioro hu, ${company} ka AI Employee. Main aapke sawalon ke jawab dene, lead qualify karne aur appointment book karne ke liye hu.`
      : `Yes, I am Depioro, an AI Employee built for ${company}. I'm here to answer questions, qualify leads, and schedule appointments.`;
    return {
      text: reply,
      toolCalls,
      leadQualification: currentLead,
      appointments,
      whatsappMessages,
    };
  }

  // Check for name input
  const nameMatch = userText.match(/(?:my name is|i am|this is|i'm|mera naam|main)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (nameMatch) {
    const candidate = nameMatch[1].trim();
    if (!['bol', 'ek', 'interested', 'here'].includes(candidate.toLowerCase())) {
      currentLead.callerName = candidate;
    }
  }

  // Check for phone input
  const phoneMatch = userText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    currentLead.phone = phoneMatch[0];
  }

  // Check for business need
  if (text.includes('cloud') || text.includes('migration')) {
    currentLead.businessNeed = 'Enterprise Cloud Migration';
  } else if (text.includes('devops') || text.includes('kubernetes')) {
    currentLead.businessNeed = '24/7 Managed DevOps & SRE';
  } else if (text.includes('soc') || text.includes('audit') || text.includes('security')) {
    currentLead.businessNeed = 'Cybersecurity & SOC 2 Audit';
  }

  // Booking / calendar intents
  if (
    text.includes('book') ||
    text.includes('schedule') ||
    text.includes('calendar') ||
    text.includes('appointment') ||
    text.includes('meeting') ||
    text.includes('availability') ||
    text.includes('tomorrow') ||
    text.includes('thursday') ||
    text.includes('friday') ||
    text.includes('kal') ||
    text.includes('dopahar') ||
    text.includes('subah') ||
    text.includes('2 pm') ||
    text.includes('3 pm') ||
    text.includes('3 baje') ||
    text.includes('2 baje') ||
    text.includes('10 am')
  ) {
    if (
      text.includes('confirm') ||
      text.includes('yes') ||
      text.includes('kardo') ||
      text.includes('theek hai') ||
      text.includes('thursday at') ||
      text.includes('friday at') ||
      text.includes('2:00') ||
      text.includes('10:30') ||
      text.includes('tomorrow at') ||
      text.includes('3 baje') ||
      text.includes('2 baje') ||
      text.includes('kal dopahar')
    ) {
      // Execute booking tool
      const name = currentLead.callerName || (isHinglish ? 'Rahul Verma' : 'Alex Parker');
      const phone = currentLead.phone || (isHinglish ? '+91 98765 43210' : '+1 (555) 492-3810');
      const timeStr = isHinglish ? 'Kal dopahar 3 baje' : 'Tomorrow at 3 PM';

      const newApt: AppointmentRecord = {
        id: `apt-${Date.now()}`,
        name,
        phone,
        email: 'client@enterprise.com',
        datetime_iso: '2026-09-17T15:00:00Z',
        datetime_display: timeStr,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      appointments.unshift(newApt);

      toolCalls.push({
        id: `tool-${Date.now()}-1`,
        name: 'book_appointment',
        args: { name, phone, email: 'client@enterprise.com', datetime_iso: '2026-09-17T15:00:00Z' },
        result: { success: true, appointmentId: newApt.id },
        timestamp: Date.now(),
      });

      // Execute WhatsApp tool
      const newWa: WhatsAppRecord = {
        id: `wa-${Date.now()}-2`,
        phone,
        customerName: name,
        message: isHinglish
          ? `Namaste ${name}, ${company} ke saath aapki meeting ${timeStr} confirm ho gayi hai.`
          : `Confirmed meeting with ${company} on ${timeStr}. We look forward to speaking with you!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };
      whatsappMessages.unshift(newWa);

      toolCalls.push({
        id: `tool-${Date.now()}-2`,
        name: 'send_whatsapp_summary',
        args: { phone, customer_name: name, appointment_details: `${timeStr} Discovery Call` },
        result: { success: true, messageId: newWa.id },
        timestamp: Date.now(),
      });

      reply = isHinglish
        ? 'Maine aapki appointment book kar di hai aur confirmation WhatsApp par bhej diya hai. Dhanyawad!'
        : 'I have booked your appointment and sent the confirmation to your WhatsApp. Thank you!';
      currentLead.status = 'qualified';
      return {
        text: reply,
        toolCalls,
        leadQualification: currentLead,
        appointments,
        whatsappMessages,
      };
    } else {
      // Check availability tool
      toolCalls.push({
        id: `tool-${Date.now()}`,
        name: 'check_calendar_availability',
        args: { date: 'tomorrow', time_of_day: 'afternoon' },
        result: { slots: ['Tomorrow at 3:00 PM', 'Friday at 11:00 AM'] },
        timestamp: Date.now(),
      });
      reply = isHinglish
        ? 'Hamare paas kal dopahar 2 baje aur Friday subah 11 baje ke slots khali hain. Kaunsa time theek rahega?'
        : 'We have open times tomorrow at 2:00 PM or Friday at 11:00 AM. Would one of those work for you?';
      return {
        text: reply,
        toolCalls,
        leadQualification: currentLead,
        appointments,
        whatsappMessages,
      };
    }
  }

  // Check missing knowledge base query (e.g. unknown topic / missing info test)
  if (text.includes('chai') || text.includes('lunch') || text.includes('tea') || text.includes('coffee') || text.includes('address') || text.includes('refund')) {
    reply = isHinglish
      ? 'Iske baare mein main team se confirm karke aapko WhatsApp par details bhej deta hu.'
      : 'I will confirm these details with our team and WhatsApp them to you shortly.';
    return {
      text: reply,
      toolCalls,
      leadQualification: currentLead,
      appointments,
      whatsappMessages,
    };
  }

  // Pricing queries (spoken Indian currency amounts)
  if (text.includes('price') || text.includes('cost') || text.includes('how much') || text.includes('rate') || text.includes('kitna') || text.includes('kharcha')) {
    reply = isHinglish
      ? 'Hamari DevOps service paintis hazar rupaye monthly aur Cloud Migration pachhattar hazar rupaye se start hoti hai. Aapka requirement kya hai?'
      : 'Our DevOps service starts at thirty-five thousand rupees monthly, and cloud migrations start at seventy-five thousand rupees. What is your scope?';
  } else if (text.includes('namaste') || text.includes('hello') || text.includes('hi') || history.length <= 1) {
    reply = isHinglish
      ? `Namaste! Thanks for calling ${company}. Main Depioro AI bol raha hu. Bataiye main aapki kya help kar sakta hu?`
      : `Hello! Thanks for calling ${company}. This is Depioro AI. How can I help you today?`;
  } else if (!currentLead.callerName) {
    reply = isHinglish
      ? 'Zaroor! Kya main aapka shubh naam aur contact number jaan sakta hu?'
      : 'We can certainly help with that. May I have your full name and best callback number?';
  } else if (!currentLead.phone) {
    reply = isHinglish
      ? `Bahut badhiya, ${currentLead.callerName} ji. Aapka WhatsApp number kya hai taaki main details bhej saku?`
      : `Great to meet you, ${currentLead.callerName}. What is the best WhatsApp or mobile number to reach you at?`;
  } else if (!currentLead.businessNeed) {
    reply = isHinglish
      ? 'Aapke infrastructure ya project ki requirement thoda detail me bataiye?'
      : 'Could you briefly share your core infrastructure or DevOps scope so we can prepare?';
  } else {
    reply = isHinglish
      ? 'Kya main kal dopahar ke liye ek 30-minute discovery call schedule kar du?'
      : 'Would you like me to check our calendar availability for a quick 30-minute discovery consultation?';
  }

  // Update qualification state
  if (currentLead.callerName && currentLead.phone && currentLead.businessNeed) {
    currentLead.status = 'qualified';
  } else if (currentLead.callerName || currentLead.phone || currentLead.businessNeed) {
    currentLead.status = 'qualifying';
  } else {
    currentLead.status = 'discovering';
  }

  return {
    text: reply,
    toolCalls,
    leadQualification: currentLead,
    appointments,
    whatsappMessages,
  };
}

// Start server with Vite middleware in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Depioro AI Employee server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
