import React from 'react';
import type { RuleCheck, CheckStatus } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, AlertOctagon, ChevronRight } from 'lucide-react';

interface RequirementsPanelProps {
  checks: RuleCheck[];
  selectedRuleId: string;
  onSelectRule: (ruleId: string) => void;
}

export const RequirementsPanel: React.FC<RequirementsPanelProps> = ({
  checks,
  selectedRuleId,
  onSelectRule,
}) => {
  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'met':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
            <span>Satisfied</span>
          </span>
        );
      case 'not_met':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Not Met</span>
          </span>
        );
      case 'review_required':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <AlertOctagon className="w-3.5 h-3.5 text-purple-600" />
            <span>Review</span>
          </span>
        );
      case 'needs_info':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Missing Proof</span>
          </span>
        );
    }
  };

  const getCardStyle = (status: CheckStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'border-forest-700 ring-1 ring-forest-700 bg-white shadow-sm';
    }
    switch (status) {
      case 'met':
        return 'border-stone-200 hover:border-stone-300 bg-white';
      case 'not_met':
        return 'border-rose-200 hover:border-rose-300 bg-rose-50/20';
      case 'review_required':
        return 'border-purple-200 hover:border-purple-300 bg-purple-50/20';
      case 'needs_info':
      default:
        return 'border-amber-200 hover:border-amber-300 bg-amber-50/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Panel Distinct Header */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center font-bold text-xs text-forest-700">
            1
          </div>
          <div>
            <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Statutory Requirements
            </h2>
            <p className="text-[11px] text-stone-500">
              Conditions, thresholds and verification
            </p>
          </div>
        </div>
        <span className="text-[11px] text-stone-600 font-mono">
          {checks.filter(c => c.status === 'met').length} / {checks.length} Met
        </span>
      </div>

      {/* Actionable Check Cards */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {checks.map((check) => {
          const isSelected = check.rule_id === selectedRuleId;
          const cardStyle = getCardStyle(check.status, isSelected);

          return (
            <div
              key={check.rule_id}
              onClick={() => onSelectRule(check.rule_id)}
              className={`p-4 rounded-xl border ${cardStyle} cursor-pointer transition-all duration-200 shadow-sm relative group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-stone-900 group-hover:text-forest-700 transition">
                    {check.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {check.explanation}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {getStatusBadge(check.status)}
                  <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-forest-700 translate-x-0.5' : 'text-stone-400'}`} />
                </div>
              </div>

              {/* Missing Evidence Notice */}
              {check.missing_evidence && (
                <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span className="font-medium text-[11px]">{check.blocker_message || check.missing_evidence}</span>
                </div>
              )}

              {/* Source Document Tag */}
              {check.citation && (
                <div className="mt-2 text-[10px] text-stone-500 font-mono flex items-center gap-1.5">
                  <span>Source:</span>
                  <span className="text-stone-800 underline underline-offset-2">{check.citation.document_name}</span>
                  <span>(p.{check.citation.page})</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
        <span>Click card to inspect evidence</span>
        <span className="font-mono text-stone-600">Evaluator: Deterministic</span>
      </div>

    </div>
  );
};
