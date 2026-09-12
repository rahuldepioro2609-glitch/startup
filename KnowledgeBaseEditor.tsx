import React, { useState } from 'react';
import { BookOpen, Building2, Plus, Trash2, Check, ShieldAlert, Code2, Sparkles, HelpCircle, DollarSign } from 'lucide-react';
import { KnowledgeBase } from '../types';

interface KnowledgeBaseEditorProps {
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: React.Dispatch<React.SetStateAction<KnowledgeBase>>;
}

export const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({
  knowledgeBase,
  setKnowledgeBase,
}) => {
  const [showPromptInspector, setShowPromptInspector] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Helper to add new service
  const handleAddService = () => {
    setKnowledgeBase((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: 'New Custom Offering',
          description: 'Detailed description of deliverables.',
          pricing: 'Starts at $3,500',
        },
      ],
    }));
  };

  const handleRemoveService = (index: number) => {
    setKnowledgeBase((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    setKnowledgeBase((prev) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  // Helper to add FAQ
  const handleAddFaq = () => {
    setKnowledgeBase((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          q: 'Common customer question here?',
          a: 'Direct factual answer from knowledge base.',
        },
      ],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setKnowledgeBase((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (index: number, field: 'q' | 'a', value: string) => {
    setKnowledgeBase((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Preset switchers
  const loadPreset = (presetName: string) => {
    if (presetName === 'cyber') {
      setKnowledgeBase({
        companyName: 'CyberGuard Security India',
        tagline: 'Enterprise Penetration Testing & Threat Defense',
        operatingHours: '24/7/365 Global Threat Operations (IST)',
        contactPhone: '+91 80055 57233',
        contactEmail: 'security@cyberguard.in',
        escalationManager: 'Vikram Mehta (Head of Incident Response, Ext 911)',
        services: [
          {
            name: 'Cloud Penetration Testing',
            description: 'Red-team simulated cyberattacks on AWS, GCP, and Kubernetes architectures.',
            pricing: '₹65,000 (Painsath hazar rupaye) per audit',
          },
          {
            name: 'Managed SIEM & 24/7 SOC',
            description: 'Continuous monitoring, AI anomaly detection, and rapid incident response.',
            pricing: '₹45,000 (Paintalis hazar rupaye) monthly retainer',
          },
        ],
        faqs: [
          {
            q: 'Breach response kitni der me activate hota hai?',
            a: 'Hamare on-call incident commanders 10 minute ke andar mobilize hote hain.',
          },
          {
            q: 'Do you provide SOC 2 certification support?',
            a: 'Yes, we assist engineering teams through end-to-end evidence collection and readiness.',
          },
        ],
      });
    } else if (presetName === 'apex') {
      setKnowledgeBase({
        companyName: 'Apex Cloud Solutions',
        tagline: 'Enterprise Cloud Architecture, 24/7 Managed DevOps & SOC 2 Security',
        operatingHours: 'Monday to Saturday, 9:30 AM to 6:30 PM IST',
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@apexcloud.in',
        escalationManager: 'Rohan Sharma (Director of Client Operations, Ext 104)',
        services: [
          {
            name: 'Enterprise Cloud Migration',
            description: 'End-to-end zero-downtime cloud migration for AWS, Google Cloud, and Azure.',
            pricing: '₹75,000 (Pachhattar hazar rupaye) fixed engagement',
          },
          {
            name: '24/7 Managed DevOps & SRE',
            description: 'Kubernetes cluster management, automated CI/CD pipelines, and 99.99% uptime SLA.',
            pricing: '₹35,000 (Paintis hazar rupaye) monthly retainer',
          },
          {
            name: 'Cybersecurity & SOC 2 Audit',
            description: 'Cloud posture hardening, penetration testing, and fast-track compliance certification.',
            pricing: '₹50,000 (Pachaas hazar rupaye) comprehensive audit',
          },
        ],
        faqs: [
          {
            q: 'Kya emergency 24/7 support available hai?',
            a: 'Haan, hamare managed retainer clients ko 15-minute response SLA ke saath 24/7 emergency incident support milta hai.',
          },
          {
            q: 'Infrastructure assessment me kitna time lagta hai?',
            a: 'Hamari architectural aur security audit team 5 business days me complete assessment report deliver karti hai.',
          },
        ],
      });
    }
  };

  const compiledPrompt = `# SYSTEM PROMPT: DEPIORO AI EMPLOYEE (INDIA REGION)

## 1. ROLE & IDENTITY
You are "Depioro," an autonomous AI Receptionist for ${knowledgeBase.companyName} in India. You handle incoming phone calls and send instant WhatsApp follow-ups. You speak natural Hinglish (Hindi + English blend) or pure English based on the caller's preference.

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
   "Namaste! Thanks for calling ${knowledgeBase.companyName}. Main Depioro AI bol raha hu. Bataiye main aapki kya help kar sakta hu?"

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
Business Name: ${knowledgeBase.companyName}
Tagline: ${knowledgeBase.tagline}
Operating Hours: ${knowledgeBase.operatingHours}
Contact Phone: ${knowledgeBase.contactPhone}
Contact Email: ${knowledgeBase.contactEmail}
Escalation Manager: ${knowledgeBase.escalationManager}

Services & Pricing:
${knowledgeBase.services.map((s) => `• ${s.name}: ${s.description} (Pricing: ${s.pricing})`).join('\n')}

Frequently Asked Questions:
${knowledgeBase.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n')}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Knowledge Base & Company Context</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configures Section 6 and <code>[COMPANY_NAME]</code> of the Depioro System Prompt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPreset('apex')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Preset: Apex Cloud
          </button>
          <button
            onClick={() => loadPreset('cyber')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Preset: CyberGuard
          </button>
          <button
            onClick={() => setShowPromptInspector(!showPromptInspector)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showPromptInspector ? 'Hide Prompt' : 'Inspect Prompt'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? 'Updated!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Compiled Prompt Modal / Accordion */}
      {showPromptInspector && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between mb-2 text-emerald-400 font-bold">
            <span>Compiled System Instruction (Sent to Gemini 3.8 Flash):</span>
            <span className="text-[10px] text-slate-400">Zero-Hallucination Guardrail Active</span>
          </div>
          <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed max-h-80 overflow-y-auto p-3 bg-slate-900 rounded-lg text-slate-300">
            {compiledPrompt}
          </pre>
        </div>
      )}

      {/* Company Identity Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Core Company Information ([COMPANY_NAME])</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={knowledgeBase.companyName}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, companyName: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline & Domain</label>
            <input
              type="text"
              value={knowledgeBase.tagline}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, tagline: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
            <input
              type="text"
              value={knowledgeBase.operatingHours}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, operatingHours: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inbound Contact Phone</label>
            <input
              type="text"
              value={knowledgeBase.contactPhone}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, contactPhone: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operations Email</label>
            <input
              type="text"
              value={knowledgeBase.contactEmail}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, contactEmail: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Escalation Manager / Ext</label>
            <input
              type="text"
              value={knowledgeBase.escalationManager}
              onChange={(e) => setKnowledgeBase({ ...knowledgeBase, escalationManager: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Services & Pricing */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Services & Pricing Tiers</h3>
          </div>
          <button
            onClick={handleAddService}
            className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Offering</span>
          </button>
        </div>

        <div className="space-y-3">
          {knowledgeBase.services.map((service, index) => (
            <div key={index} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Service Name</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Pricing (Factual)</label>
                  <input
                    type="text"
                    value={service.pricing}
                    onChange={(e) => handleServiceChange(index, 'pricing', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none font-semibold text-emerald-800"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleRemoveService(index)}
                    className="text-xs text-rose-500 hover:text-rose-700 p-2"
                    title="Remove Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Deliverable Scope</label>
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Frequently Asked Questions (FAQ)</h3>
          </div>
          <button
            onClick={handleAddFaq}
            className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-3">
          {knowledgeBase.faqs.map((faq, index) => (
            <div key={index} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700">FAQ Item #{index + 1}</span>
                <button
                  onClick={() => handleRemoveFaq(index)}
                  className="text-xs text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={faq.q}
                onChange={(e) => handleFaqChange(index, 'q', e.target.value)}
                placeholder="Question"
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none mb-1.5 font-medium"
              />
              <textarea
                rows={2}
                value={faq.a}
                onChange={(e) => handleFaqChange(index, 'a', e.target.value)}
                placeholder="Factual Answer"
                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
