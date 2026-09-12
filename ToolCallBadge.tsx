import React from 'react';
import { Calendar, CheckCircle2, PhoneForwarded, MessageSquare, Clock } from 'lucide-react';
import { ToolCallLog } from '../types';

interface ToolCallBadgeProps {
  tool: ToolCallLog;
}

export const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ tool }) => {
  if (tool.name === 'check_calendar_availability') {
    return (
      <div className="my-2 p-3 rounded-lg bg-blue-50/90 border border-blue-200 text-xs text-blue-900">
        <div className="flex items-center gap-1.5 font-semibold text-blue-800 mb-1">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Tool: check_calendar_availability</span>
        </div>
        <div className="text-slate-600">
          Checking availability for: <span className="font-mono font-medium text-slate-800">{tool.args.date || 'date'}</span> ({tool.args.time_of_day || 'any time'})
        </div>
        {tool.result?.availableSlots && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tool.result.availableSlots.map((slot: string, idx: number) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                <Clock className="w-2.5 h-2.5" />
                {slot}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tool.name === 'book_appointment') {
    return (
      <div className="my-2 p-3 rounded-lg bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-800 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tool: book_appointment (Confirmed)</span>
        </div>
        <div className="space-y-0.5 text-slate-700">
          <div>Client: <strong className="text-slate-900">{tool.args.name}</strong></div>
          <div>Contact: <span className="font-mono">{tool.args.phone}</span></div>
          <div>Scheduled For: <strong className="text-emerald-800">{tool.args.datetime_iso}</strong></div>
        </div>
      </div>
    );
  }

  if (tool.name === 'transfer_to_human') {
    return (
      <div className="my-2 p-3 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
          <PhoneForwarded className="w-3.5 h-3.5 text-amber-600" />
          <span>Escalation Rule Triggered: transfer_to_human</span>
        </div>
        <p className="text-slate-700 mb-1">
          Reason: <span className="italic font-medium text-slate-900">"{tool.args.reason}"</span>
        </p>
        <div className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-1 rounded inline-block">
          Connecting to: {tool.result?.operator || 'Sarah Jenkins (Operations Lead)'}
        </div>
      </div>
    );
  }

  if (tool.name === 'send_whatsapp_summary') {
    return (
      <div className="my-2 p-3 rounded-lg bg-teal-50/90 border border-teal-200 text-xs text-teal-950">
        <div className="flex items-center gap-1.5 font-semibold text-teal-800 mb-1">
          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
          <span>Tool: send_whatsapp_summary (Dispatched)</span>
        </div>
        <div className="text-slate-700 space-y-0.5">
          <div>To: <strong className="text-slate-900">{tool.args.customer_name}</strong> (<span className="font-mono">{tool.args.phone}</span>)</div>
          <div className="text-[11px] text-slate-600 italic bg-white/70 p-1.5 rounded border border-teal-100 mt-1">
            "{tool.args.appointment_details}"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-2 p-2 rounded bg-slate-100 text-xs font-mono">
      Tool: {tool.name} ({JSON.stringify(tool.args)})
    </div>
  );
};
