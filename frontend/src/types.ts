export type CheckStatus = 'met' | 'not_met' | 'needs_info' | 'review_required';
export type EvidenceType = 'documentary_proof' | 'user_statement' | 'derived' | 'missing';
export type OperatingMode = 'live' | 'fixture';
export type Language = 'hi-IN' | 'en-IN';

export interface SourceCitation {
  document_id: string;
  document_name: string;
  page: number;
  block_id?: string;
  excerpt: string;
  evidence_type: EvidenceType;
}

export interface RuleCheck {
  rule_id: string;
  title: string;
  status: CheckStatus;
  operator: string;
  actual_value?: any;
  threshold?: any;
  citation?: SourceCitation;
  missing_evidence?: string;
  explanation: string;
  blocker_message?: string;
}

export interface ApplicationField {
  key: string;
  label: string;
  value?: string;
  status: CheckStatus;
  source_evidence_id?: string;
  citation_summary?: string;
  is_pulsing?: boolean;
}

export interface AuditEvent {
  timestamp: string;
  event_type: string;
  description: string;
  provenance: string;
}

export interface CaseState {
  case_id: string;
  applicant_name: string;
  programme_name: string;
  grant_amount: string;
  mode: OperatingMode;
  language: Language;
  overall_status: 'processing' | 'more_information_needed' | 'stated_condition_not_met' | 'ready_for_review' | 'failure';
  progress_met_count: number;
  progress_total_count: number;
  progress_percentage: number;
  next_action_en: string;
  next_action_hi: string;
  active_blocker_id?: string;
  checks: RuleCheck[];
  draft_fields: ApplicationField[];
  uploaded_documents: any[];
  audit_history: AuditEvent[];
  signature_status: string;
  last_audio_base64?: string;
  last_audio_text?: string;
}
