import React from 'react';
import type { ChallengeEvent } from '@/types';

interface ChallengeHistoryOverlayProps {
  events: ChallengeEvent[];
}

const formatEvent = (event: ChallengeEvent) => {
  switch (event.event_type) {
    case 'proposed':
      return 'Challenge proposed';
    case 'accepted':
      return 'Challenge accepted';
    case 'completed':
      return 'Challenge completed';
    case 'failed':
      return 'Challenge failed';
    case 'cancelled':
      return 'Challenge cancelled';
    case 'disputed':
      return 'Challenge disputed';
    default:
      return event.event_type;
  }
};

export const ChallengeHistoryOverlay: React.FC<ChallengeHistoryOverlayProps> = ({ events }) => {
  if (!events?.length) return null;

  return (
    <div className="w-full max-w-sm rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-3 text-white shadow-xl">
      <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">Fun History</div>
      <div className="space-y-1.5 text-xs">
        {events.slice(0, 6).map((event) => (
          <div key={event.id} className="flex items-center justify-between gap-2">
            <span className="text-white/90">{formatEvent(event)}</span>
            <span className="text-white/50">
              {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
