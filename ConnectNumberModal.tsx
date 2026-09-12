import React, { useState } from 'react';
import { X, Phone, Check, Shield, Globe, Sparkles } from 'lucide-react';

interface ConnectNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectNumber: (number: string, label: string) => void;
}

export function ConnectNumberModal({ isOpen, onClose, onConnectNumber }: ConnectNumberModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('+91 80 4725 9900');
  const [label, setLabel] = useState('Bangalore Office Primary DID');
  const [provider, setProvider] = useState<'airtel' | 'jio' | 'twilio' | 'exotel'>('exotel');
  const [routingMode, setRoutingMode] = useState<'ai_direct' | 'ivr_schedule' | 'fallback_human'>('ai_direct');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConnectNumber(phoneNumber, label);
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-wood-300/40 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-wood-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wood-700 rounded-lg">
              <Phone className="w-5 h-5 text-wood-100" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Connect Business Phone Number</h3>
              <p className="text-xs text-wood-200">Route incoming calls straight to Depioro AI Receptionist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-wood-700 text-wood-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-wood-900">Phone Number Connected!</h4>
            <p className="text-sm text-wood-600">
              {phoneNumber} is now live and routing to your Depioro AI Receptionist with instant WhatsApp confirmations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-wood-700 uppercase tracking-wider mb-1.5">
                Indian Virtual Number or DID (+91)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 80 4725 9900"
                  className="w-full px-4 py-2.5 rounded-lg border border-wood-300/60 focus:outline-none focus:ring-2 focus:ring-wood-600 text-wood-900 font-mono text-sm bg-warmWhite-100"
                />
                <span className="absolute right-3 top-2.5 text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                  Active DID
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-wood-700 uppercase tracking-wider mb-1.5">
                Line Identifier / Branch Label
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Sales Inquiries & Consultations"
                className="w-full px-4 py-2.5 rounded-lg border border-wood-300/60 focus:outline-none focus:ring-2 focus:ring-wood-600 text-wood-900 text-sm bg-warmWhite-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-wood-700 uppercase tracking-wider mb-1.5">
                  Telecom / SIP Provider
                </label>
                <select
                  value={provider}
                  onChange={(e: any) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300/60 focus:outline-none focus:ring-2 focus:ring-wood-600 text-sm bg-warmWhite-100 text-wood-900"
                >
                  <option value="exotel">Exotel (India VoIP)</option>
                  <option value="airtel">Airtel IQ Cloud</option>
                  <option value="jio">Jio Business SIP</option>
                  <option value="twilio">Twilio Programmable Voice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-wood-700 uppercase tracking-wider mb-1.5">
                  Depioro AI Ingress Mode
                </label>
                <select
                  value={routingMode}
                  onChange={(e: any) => setRoutingMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-wood-300/60 focus:outline-none focus:ring-2 focus:ring-wood-600 text-sm bg-warmWhite-100 text-wood-900"
                >
                  <option value="ai_direct">Direct AI Receptionist (24/7)</option>
                  <option value="ivr_schedule">Business Hours (9:30-6:30 IST)</option>
                  <option value="fallback_human">AI First with Human Transfer</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-wood-50 rounded-xl border border-wood-200 flex items-start gap-2.5 text-xs text-wood-700">
              <Shield className="w-4 h-4 text-wood-600 shrink-0 mt-0.5" />
              <span>
                Calls to this number will run on the Pro AI Agent plan (₹999/mo) with full Hinglish/English voice synthesis and instant WhatsApp booking summaries.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-wood-300 text-wood-700 hover:bg-wood-100 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-wood-800 hover:bg-wood-900 text-white text-sm font-semibold shadow transition cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Linking Number...' : 'Connect Number Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
