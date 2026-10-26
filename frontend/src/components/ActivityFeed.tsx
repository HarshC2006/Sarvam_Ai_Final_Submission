import React from 'react';
import type { AuditEvent } from '../types';
import { History, ShieldCheck, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ActivityFeedProps {
  events: AuditEvent[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'BLOCKER_RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />;
      case 'DOCUMENT_PARSED':
        return <FileText className="w-3.5 h-3.5 text-sky-600" />;
      case 'IDENTITY_CONFLICT':
      case 'BLOCKER_IDENTIFIED':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-200 mb-3">
        <History className="w-4 h-4 text-forest-700" />
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
          Audit Event History & Provenance Log
        </h3>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {events.map((evt, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{getEventIcon(evt.event_type)}</span>
              <div>
                <span className="font-semibold text-stone-800 block text-[11px]">{evt.description}</span>
                <span className="text-[10px] text-stone-500 font-mono">{evt.provenance}</span>
              </div>
            </div>
            <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">
              {evt.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
