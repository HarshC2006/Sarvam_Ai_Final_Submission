import React from 'react';
import type { ApplicationField, CaseState } from '../types';
import { Printer, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ApplicationDraftPanelProps {
  fields: ApplicationField[];
  state: CaseState;
  onExport: () => void;
}

export const ApplicationDraftPanel: React.FC<ApplicationDraftPanelProps> = ({
  fields,
  state,
  onExport,
}) => {
  const isComplete = state.progress_percentage === 100;

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Panel Distinct Header */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xs text-teal-800">
            3
          </div>
          <div>
            <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Application Draft
            </h2>
            <p className="text-[11px] text-stone-500">
              Official institutional form preview
            </p>
          </div>
        </div>

        {/* Status Stamp */}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
          isComplete
            ? 'bg-forest-50 text-forest-700 border-forest-100'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {isComplete ? 'Ready for Review' : 'Draft Incomplete'}
        </span>
      </div>

      {/* Official Form Sheet Preview */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        
        <div className="bg-stone-50/60 border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm relative">
          
          {/* Official Seal & Header */}
          <div className="text-center pb-3.5 border-b border-stone-200">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 block font-semibold">
              Official Scholarship Application Sheet
            </span>
            <h3 className="text-sm font-bold text-stone-900 mt-1">
              {state.programme_name}
            </h3>
            <p className="text-[11px] text-stone-600 mt-0.5 font-mono">
              Grant Value: <strong className="text-forest-700">{state.grant_amount}</strong> · Academic Session 2026–27
            </p>
            <p className="text-[10px] text-stone-400 font-mono mt-1">
              Case Ref ID: <span className="text-stone-700 font-bold">{state.case_id}</span>
            </p>
          </div>

          {/* Form Fields Table */}
          <div className="mt-4 space-y-3">
            {fields.map((field) => {
              const isIncome = field.key === 'annual_household_income';
              const isVerified = field.status === 'met';
              const isPulsing = isIncome && field.is_pulsing;

              return (
                <div
                  key={field.key}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isPulsing
                      ? 'border-forest-700 bg-forest-50/60 animate-pulse-subtle shadow-sm'
                      : isVerified
                      ? 'border-stone-200 bg-white'
                      : 'border-amber-200 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider">{field.label}</span>
                    {isVerified ? (
                      <span className="text-forest-700 flex items-center gap-1 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1 font-semibold text-[10px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Action Required</span>
                      </span>
                    )}
                  </div>

                  <div className={`text-xs font-semibold ${
                    isPulsing ? 'text-forest-800 text-sm' : isVerified ? 'text-stone-900' : 'text-amber-800'
                  }`}>
                    {field.value || '—'}
                  </div>

                  {field.citation_summary && (
                    <div className="text-[10px] font-mono text-stone-500 mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-stone-400" />
                      <span>{field.citation_summary}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Attestation & Signature Block */}
          <div className="mt-5 pt-4 border-t border-dashed border-stone-300 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-mono">Declaration:</span>
              <span className="text-stone-600">All enclosed records verified.</span>
            </div>

            <div className="text-right">
              <span className="text-stone-500 block text-[10px] uppercase font-mono">Attestation:</span>
              <span className={`font-mono font-bold ${isComplete ? 'text-forest-700' : 'text-amber-700'}`}>
                [{state.signature_status}]
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Export Action Bar */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <button
          onClick={onExport}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-white shadow-sm cursor-pointer transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Export Application Packet & Checklist (PDF)</span>
        </button>
      </div>

    </div>
  );
};
