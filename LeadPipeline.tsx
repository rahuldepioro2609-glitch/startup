import React from 'react';
import { User, Phone, Briefcase, Calendar, CheckCircle2, Clock, AlertCircle, Sparkles, ExternalLink, Download } from 'lucide-react';
import { LeadQualification, Appointment, KnowledgeBase } from '../types';

interface LeadPipelineProps {
  leadQualification: LeadQualification;
  setLeadQualification: React.Dispatch<React.SetStateAction<LeadQualification>>;
  appointments: Appointment[];
  knowledgeBase: KnowledgeBase;
}

export const LeadPipeline: React.FC<LeadPipelineProps> = ({
  leadQualification,
  setLeadQualification,
  appointments,
  knowledgeBase,
}) => {
  // Calculate completion percentage
  const completedFields = [
    leadQualification.callerName,
    leadQualification.phone,
    leadQualification.businessNeed,
  ].filter(Boolean).length;

  const progressPercent = Math.round((completedFields / 3) * 100);

  const getStatusBadge = () => {
    switch (leadQualification.status) {
      case 'qualified':
        return { label: 'Fully Qualified Lead', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'qualifying':
        return { label: 'Qualifying In-Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'escalated':
        return { label: 'Escalated to Human Manager', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'Discovery Stage', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Live Qualification Card (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Inbound Lead Qualification</h3>
              <p className="text-xs text-slate-500">Autonomous 3-point qualification rule</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge().color}`}>
              {getStatusBadge().label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Qualification Completion</span>
              <span className="font-bold text-emerald-600">{completedFields}/3 Details Collected ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3 Core Qualifications Fields */}
          <div className="space-y-3">
            {/* 1. Full Name */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>1. Caller's Full Name</span>
                </div>
                {leadQualification.callerName ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Collected
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    Pending Input
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-slate-900">
                {leadQualification.callerName || <span className="italic text-slate-400">Waiting for caller introduction</span>}
              </div>
            </div>

            {/* 2. Primary Phone / WhatsApp */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>2. Primary Phone / WhatsApp</span>
                </div>
                {leadQualification.phone ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Collected
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    Pending Input
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-900">
                {leadQualification.phone || <span className="italic font-sans text-slate-400">Waiting for phone / WhatsApp number</span>}
              </div>
            </div>

            {/* 3. Business Need / Project Scope */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>3. Business Need or Scope</span>
                </div>
                {leadQualification.businessNeed ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Collected
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    Pending Input
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-900 leading-relaxed">
                {leadQualification.businessNeed || <span className="italic text-slate-400">Waiting for scope description (e.g., Cloud Migration, DevOps, SOC 2)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Rules Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-xs">
          <h4 className="font-bold text-slate-900 mb-2">Automated CRM Sync</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
            Once Depioro gathers these 3 core requirements, the lead is tagged as <strong>Qualified</strong> and immediately routed into the operations dispatch queue.
          </p>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
            Target Escalation Manager: <strong>{knowledgeBase.escalationManager}</strong>
          </div>
        </div>
      </div>

      {/* Right Column: Booked Calendar Appointments (7 cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scheduled Consultations & Calendar</h3>
              <p className="text-xs text-slate-500">Bookings executed autonomously via `book_appointment`</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {appointments.length} Consultations Booked
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px]">
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No Appointments Booked Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                During a phone call, ask Depioro to check calendar availability and book a slot.
              </p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{apt.name}</h4>
                    <p className="text-xs text-slate-500">
                      Contact: <span className="font-mono text-slate-700">{apt.phone}</span> • {apt.email}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1 font-semibold text-emerald-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.datetime_display}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="text-slate-600">
                    Type: 30-Min Technical Discovery Consultation
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="font-mono text-[11px] text-slate-400">
                    ID: {apt.id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
