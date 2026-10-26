from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class CheckStatus(str, Enum):
    MET = "met"
    NOT_MET = "not_met"
    NEEDS_INFO = "needs_info"
    REVIEW_REQUIRED = "review_required"

class EvidenceType(str, Enum):
    DOCUMENTARY_PROOF = "documentary_proof"
    USER_STATEMENT = "user_statement"
    DERIVED = "derived"
    MISSING = "missing"

class OperatingMode(str, Enum):
    LIVE = "live"
    FIXTURE = "fixture"

class Language(str, Enum):
    HINDI = "hi-IN"
    ENGLISH = "en-IN"

class SourceCitation(BaseModel):
    document_id: str
    document_name: str
    page: int = 1
    block_id: Optional[str] = None
    bounding_box: Optional[List[float]] = None
    excerpt: str
    evidence_type: EvidenceType = EvidenceType.DOCUMENTARY_PROOF

class FactValue(BaseModel):
    key: str
    value: Any
    unit: Optional[str] = None
    evidence_type: EvidenceType
    citation: Optional[SourceCitation] = None
    is_correction: bool = False
    original_value: Optional[Any] = None

class ConditionRule(BaseModel):
    id: str
    title: str
    description: str
    operator: str  # gte, lte, eq, in, required_document, all, any
    field: Optional[str] = None
    threshold: Optional[Any] = None
    required_doc_type: Optional[str] = None
    explanation: Optional[str] = None

class RuleCheckResult(BaseModel):
    rule_id: str
    title: str
    status: CheckStatus
    operator: str
    actual_value: Optional[Any] = None
    threshold: Optional[Any] = None
    citation: Optional[SourceCitation] = None
    missing_evidence: Optional[str] = None
    explanation: str
    blocker_message: Optional[str] = None

class ApplicationField(BaseModel):
    key: str
    label: str
    value: Optional[Any] = None
    status: CheckStatus
    source_evidence_id: Optional[str] = None
    citation_summary: Optional[str] = None
    is_pulsing: bool = False

class AuditEvent(BaseModel):
    timestamp: str
    event_type: str
    description: str
    provenance: str

class CaseState(BaseModel):
    case_id: str
    applicant_name: str
    programme_name: str = "Udaan Education Grant — Demonstration Programme"
    grant_amount: str = "₹25,000"
    mode: OperatingMode = OperatingMode.FIXTURE
    language: Language = Language.HINDI
    overall_status: str = "more_information_needed" # processing, more_information_needed, stated_condition_not_met, ready_for_review, failure
    progress_met_count: int = 0
    progress_total_count: int = 4
    progress_percentage: int = 0
    next_action_en: str = ""
    next_action_hi: str = ""
    active_blocker_id: Optional[str] = None
    
    rules: List[ConditionRule] = Field(default_factory=list)
    checks: List[RuleCheckResult] = Field(default_factory=list)
    facts: Dict[str, FactValue] = Field(default_factory=dict)
    draft_fields: List[ApplicationField] = Field(default_factory=list)
    uploaded_documents: List[Dict[str, Any]] = Field(default_factory=list)
    audit_history: List[AuditEvent] = Field(default_factory=list)
    signature_status: str = "Pending Applicant Signature"
    
    last_audio_base64: Optional[str] = None
    last_audio_text: Optional[str] = None
