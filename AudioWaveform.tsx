import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  status: 'idle' | 'calling' | 'connected' | 'speaking' | 'listening' | 'processing' | 'interrupted' | 'transferred' | 'ended';
  isMuted?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ status, isMuted }) => {
  const [bars, setBars] = useState<number[]>(Array(18).fill(12));

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if ((status === 'speaking' || status === 'listening') && !isMuted) {
      interval = setInterval(() => {
        setBars(
          Array(18)
            .fill(0)
            .map(() => {
              if (status === 'speaking') {
                // Energetic speaking amplitude
                return Math.floor(Math.random() * 38) + 8;
              } else {
                // Gentle listening ambient amplitude
                return Math.floor(Math.random() * 22) + 6;
              }
            })
        );
      }, 90);
    } else {
      setBars(Array(18).fill(8));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, isMuted]);

  const getColorClass = () => {
    if (isMuted) return 'bg-slate-300';
    if (status === 'speaking') return 'bg-emerald-500';
    if (status === 'listening') return 'bg-blue-500';
    if (status === 'interrupted') return 'bg-amber-500';
    if (status === 'transferred') return 'bg-purple-500';
    return 'bg-slate-300';
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-14 px-4 py-2 bg-slate-900/5 rounded-xl border border-slate-200/60">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-100 ${getColorClass()}`}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
};
