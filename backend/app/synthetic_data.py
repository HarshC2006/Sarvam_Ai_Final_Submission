from datetime import datetime
from typing import Dict, Any, List
from .models import (
    CaseState, ConditionRule, RuleCheckResult, CheckStatus,
    EvidenceType, SourceCitation, ApplicationField, AuditEvent,
    OperatingMode, Language
)

PROGRAMME_NAME = "Udaan Education Grant — Demonstration Programme"
GRANT_AMOUNT = "₹25,000"

RULES_DEFINITION = [
    ConditionRule(
        id="academic_merit",
        title="Academic Merit (Marks ≥ 60%)",
        description="Applicant must have secured at least 60% aggregate marks in the qualifying board exam.",
        operator="gte",
        field="percentage",
        threshold=60.0,
        explanation="Minimum academic score of 60.0% required."
    ),
    ConditionRule(
        id="income_ceiling",
        title="Household Income Ceiling (≤ ₹2,50,000)",
        description="Gross annual family income from all sources must not exceed ₹2,50,000.",
        operator="lte",
        field="annual_household_income",
        threshold=250000,
        explanation="Statutory annual family income ceiling is ₹2,50,000."
    ),
    ConditionRule(
        id="full_time_enrollment",
        title="Full-time Enrollment (AY 2026–27)",
        description="Must be enrolled full-time in a recognised degree course for academic year 2026–27.",
        operator="eq",
        field="academic_year",
        threshold="2026-27",
        explanation="Valid full-time admission for academic session 2026–27."
    ),
    ConditionRule(
        id="mandatory_documents",
        title="Mandatory Document Verification",
        description="All 3 mandatory documents must be uploaded: Marksheet, Enrollment Letter, and Income Certificate.",
        operator="required_document",
        required_doc_type="income_certificate",
        explanation="Requires certified revenue authority income certificate."
    )
]

SYNTHETIC_DOCUMENTS = {
    "asha_marksheet": """
CENTRAL BOARD OF SECONDARY EDUCATION
SENIOR SCHOOL CERTIFICATE EXAMINATION 2025
Roll No: 11849201
Candidate Name: ASHA SHARMA
Father's Name: RAJESH SHARMA
Mother's Name: KAVITA SHARMA
School: Kendriya Vidyalaya No. 1, Delhi

SUBJECT PERFORMANCE:
English Core: 86
Mathematics: 82
Physics: 85
Chemistry: 81
Computer Science: 86

TOTAL AGGREGATE: 420 / 500
PERCENTAGE: 84.0%
RESULT: PASS (FIRST DIVISION WITH DISTINCTION)
Date of Issue: 24-May-2025
    """.strip(),

    "asha_enrollment": """
MIRANDA HOUSE, UNIVERSITY OF DELHI
OFFICE OF THE REGISTRAR - ADMISSION CONFIRMATION
Date: 14-July-2026
Student ID: MH-2026-UG-4412
Name: Asha Sharma
Programme: Bachelor of Science (Honours) Chemistry
Academic Year: 2026-27
Enrollment Status: FULL-TIME REGULAR
This is to certify that Ms. Asha Sharma is bona fide full-time admitted student for AY 2026-27.
    """.strip(),

    "asha_income_certificate": """
कार्यालय तहसीलदार, सदर, उत्तर-पश्चिमी जिला, दिल्ली
प्रमाण पत्र संख्या: DL/INC/2026/049182
दिनांक: 18-जनवरी-2026

आय प्रमाण पत्र (INCOME CERTIFICATE)

प्रमाणित किया जाता है कि कु. आशा शर्मा, सुपुत्री श्री राजेश शर्मा, निवासी रोहिणी सेक्टर-9, दिल्ली के परिवार की समस्त स्रोतों से कुल वार्षिक आय रु 1,80,000/- (एक लाख अस्सी हज़ार रुपये मात्र) है।

सत्यापित अधिकारी: तहसीलदार (सदर)
राजस्व विभाग, राष्ट्रीय राजधानी क्षेत्र दिल्ली
    """.strip(),

    "rohan_income_certificate": """
OFFICE OF THE TEHSILDAR, JAIPUR (RAJASTHAN)
Certificate No: RJ/REV/2026/88412
Date: 10-January-2026

INCOME CERTIFICATE

This is to certify that the total annual household income of Mr. Rohan Mehta, son of Shri Alok Mehta, resident of C-Scheme, Jaipur, from all verified business and agricultural sources is:
Total Annual Income: Rs. 3,20,000/- (Three Lakh Twenty Thousand Rupees Only).

Issuing Authority: Sub-Divisional Magistrate & Tehsildar, Jaipur.
    """.strip()
}

def build_scenario_state(scenario_key: str = "asha_incomplete", mode: OperatingMode = OperatingMode.FIXTURE, language: Language = Language.HINDI) -> CaseState:
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    if scenario_key == "asha_incomplete":
        # Asha Sharma: 84% marks, enrolled, stated Rs 1.8L income, but income certificate omitted!
        checks = [
            RuleCheckResult(
                rule_id="academic_merit",
                title="Academic Merit (Marks ≥ 60%)",
                status=CheckStatus.MET,
                operator="gte",
                actual_value=84.0,
                threshold=60.0,
                citation=SourceCitation(
                    document_id="doc_asha_marksheet",
                    document_name="Asha_Class12_Marksheet.pdf",
                    page=1,
                    excerpt="TOTAL AGGREGATE: 420 / 500 | PERCENTAGE: 84.0% | RESULT: PASS (FIRST DIVISION WITH DISTINCTION)",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="Scored 84.0% in CBSE Board Exam, surpassing 60.0% threshold."
            ),
            RuleCheckResult(
                rule_id="full_time_enrollment",
                title="Full-time Enrollment (AY 2026–27)",
                status=CheckStatus.MET,
                operator="eq",
                actual_value="2026-27",
                threshold="2026-27",
                citation=SourceCitation(
                    document_id="doc_asha_enrollment",
                    document_name="Miranda_House_Enrollment_Letter.pdf",
                    page=1,
                    excerpt="Student ID: MH-2026-UG-4412 | Programme: B.Sc (Hons) Chemistry | Academic Year: 2026-27 | Status: FULL-TIME REGULAR",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="Verified full-time enrollment in B.Sc (Hons) Chemistry at Miranda House for AY 2026-27."
            ),
            RuleCheckResult(
                rule_id="income_ceiling",
                title="Household Income Ceiling (≤ ₹2,50,000)",
                status=CheckStatus.NEEDS_INFO,
                operator="lte",
                actual_value=180000,
                threshold=250000,
                missing_evidence="Official Revenue / Tehsildar Income Certificate",
                blocker_message="Applicant stated ₹1,80,000, but official Tehsildar Income Certificate is missing.",
                citation=SourceCitation(
                    document_id="oral_statement_01",
                    document_name="Applicant Stated Claim",
                    page=1,
                    excerpt="Applicant stated: 'Our annual household income is ₹1.8 lakh.'",
                    evidence_type=EvidenceType.USER_STATEMENT
                ),
                explanation="Oral assertion of ₹1,80,000 recorded. An official certified income certificate is required to verify statutory eligibility."
            ),
            RuleCheckResult(
                rule_id="mandatory_documents",
                title="Mandatory Income Certificate",
                status=CheckStatus.NEEDS_INFO,
                operator="required_document",
                threshold="income_certificate",
                missing_evidence="income_certificate.pdf",
                blocker_message="Please upload the official Tehsildar Income Certificate to complete your submission.",
                explanation="Income Certificate has not been uploaded."
            )
        ]

        draft_fields = [
            ApplicationField(key="name", label="Full Name", value="Asha Sharma", status=CheckStatus.MET, citation_summary="Asha_Class12_Marksheet.pdf (Page 1)"),
            ApplicationField(key="student_id", label="Student ID", value="MH-2026-UG-4412", status=CheckStatus.MET, citation_summary="Miranda_House_Enrollment_Letter.pdf"),
            ApplicationField(key="institution", label="Institution", value="Miranda House, University of Delhi", status=CheckStatus.MET, citation_summary="Miranda_House_Enrollment_Letter.pdf"),
            ApplicationField(key="course", label="Course Enrolled", value="B.Sc (Honours) Chemistry", status=CheckStatus.MET, citation_summary="Miranda_House_Enrollment_Letter.pdf"),
            ApplicationField(key="academic_year", label="Academic Year", value="2026-27 (Full-time)", status=CheckStatus.MET, citation_summary="Miranda_House_Enrollment_Letter.pdf"),
            ApplicationField(key="percentage", label="Class XII Aggregate", value="84.0%", status=CheckStatus.MET, citation_summary="Asha_Class12_Marksheet.pdf"),
            ApplicationField(key="annual_household_income", label="Annual Household Income", value="⚠️ [REQUIRED: Income Certificate Missing]", status=CheckStatus.NEEDS_INFO, citation_summary="Applicant oral statement: ₹1,80,000 (Unverified)")
        ]

        return CaseState(
            case_id="case_asha_incomplete",
            applicant_name="Asha Sharma",
            programme_name=PROGRAMME_NAME,
            grant_amount=GRANT_AMOUNT,
            mode=mode,
            language=language,
            overall_status="more_information_needed",
            progress_met_count=2,
            progress_total_count=4,
            progress_percentage=50,
            next_action_en="Upload your official revenue authority Income Certificate to satisfy the income ceiling rule.",
            next_action_hi="कृपया आय सीमा नियम को पूरा करने के लिए अपना आधिकारिक तहसीलदार आय प्रमाण पत्र अपलोड करें।",
            active_blocker_id="income_ceiling",
            rules=RULES_DEFINITION,
            checks=checks,
            draft_fields=draft_fields,
            uploaded_documents=[
                {"id": "doc_asha_marksheet", "name": "Asha_Class12_Marksheet.pdf", "type": "marksheet", "pages": 1, "status": "verified"},
                {"id": "doc_asha_enrollment", "name": "Miranda_House_Enrollment_Letter.pdf", "type": "enrollment_letter", "pages": 1, "status": "verified"}
            ],
            audit_history=[
                AuditEvent(timestamp=now, event_type="DOCUMENT_PARSED", description="Parsed CBSE Marksheet. Aggregate 84.0% extracted.", provenance="Sarvam Vision / 105B"),
                AuditEvent(timestamp=now, event_type="DOCUMENT_PARSED", description="Parsed Miranda House Enrollment. Full-time AY 2026-27 confirmed.", provenance="Sarvam Vision / 105B"),
                AuditEvent(timestamp=now, event_type="BLOCKER_IDENTIFIED", description="Income Certificate missing. Oral assertion ₹1.8L unverified.", provenance="Deterministic Evaluator")
            ],
            signature_status="Pending Applicant Signature"
        )

    elif scenario_key == "asha_complete":
        state = build_scenario_state("asha_incomplete", mode, language)
        # Add income cert
        state.case_id = "case_asha_complete"
        state.overall_status = "ready_for_review"
        state.progress_met_count = 4
        state.progress_percentage = 100
        state.next_action_en = "All 4 requirements verified! You can now review and export your application packet."
        state.next_action_hi = "सभी 4 शर्तें सत्यापित हो चुकी हैं! अब आप अपना आवेदन पत्र देख और डाउनलोड कर सकते हैं।"
        state.active_blocker_id = None
        
        # Update income check
        state.checks[2] = RuleCheckResult(
            rule_id="income_ceiling",
            title="Household Income Ceiling (≤ ₹2,50,000)",
            status=CheckStatus.MET,
            operator="lte",
            actual_value=180000,
            threshold=250000,
            citation=SourceCitation(
                document_id="doc_asha_income",
                document_name="Income_Certificate_Tehsildar.pdf",
                page=1,
                excerpt="प्रमाणित किया जाता है कि कु. आशा शर्मा... परिवार की समस्त स्रोतों से कुल वार्षिक आय रु 1,80,000/- (एक लाख अस्सी हज़ार रुपये मात्र) है।",
                evidence_type=EvidenceType.DOCUMENTARY_PROOF
            ),
            explanation="Certified annual income of ₹1,80,000 satisfies statutory ceiling of ₹2,50,000."
        )
        state.checks[3] = RuleCheckResult(
            rule_id="mandatory_documents",
            title="Mandatory Income Certificate",
            status=CheckStatus.MET,
            operator="required_document",
            actual_value="income_certificate",
            threshold="income_certificate",
            citation=SourceCitation(
                document_id="doc_asha_income",
                document_name="Income_Certificate_Tehsildar.pdf",
                page=1,
                excerpt="सत्यापित अधिकारी: तहसीलदार (सदर), राजस्व विभाग, दिल्ली",
                evidence_type=EvidenceType.DOCUMENTARY_PROOF
            ),
            explanation="Tehsildar Income Certificate verified successfully."
        )

        # Update draft field
        for field in state.draft_fields:
            if field.key == "annual_household_income":
                field.value = "₹1,80,000 (Verified by Tehsildar Office)"
                field.status = CheckStatus.MET
                field.citation_summary = "Income_Certificate_Tehsildar.pdf (Page 1)"
                field.is_pulsing = True

        state.uploaded_documents.append({
            "id": "doc_asha_income",
            "name": "Income_Certificate_Tehsildar.pdf",
            "type": "income_certificate",
            "pages": 1,
            "status": "verified"
        })
        state.audit_history.append(
            AuditEvent(timestamp=now, event_type="BLOCKER_RESOLVED", description="Official Income Certificate uploaded. ₹1,80,000 verified. Progress reached 100%.", provenance="Deterministic Evaluator")
        )
        return state

    elif scenario_key == "rohan_ineligible":
        # Rohan Mehta: Income 320,000 > 250,000 ceiling!
        checks = [
            RuleCheckResult(
                rule_id="academic_merit",
                title="Academic Merit (Marks ≥ 60%)",
                status=CheckStatus.MET,
                operator="gte",
                actual_value=76.0,
                threshold=60.0,
                citation=SourceCitation(
                    document_id="doc_rohan_marksheet",
                    document_name="Rohan_Marksheet_Class12.pdf",
                    page=1,
                    excerpt="Total Marks: 380/500 | Percentage: 76.0% | Result: Pass",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="Scored 76.0%, satisfying minimum 60% requirement."
            ),
            RuleCheckResult(
                rule_id="full_time_enrollment",
                title="Full-time Enrollment (AY 2026–27)",
                status=CheckStatus.MET,
                operator="eq",
                actual_value="2026-27",
                threshold="2026-27",
                citation=SourceCitation(
                    document_id="doc_rohan_enrollment",
                    document_name="Rajasthan_Univ_Admission.pdf",
                    page=1,
                    excerpt="Course: B.Com (Hons) | Academic Year: 2026-27 | Status: Full-time",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="Enrolled in B.Com (Hons) for AY 2026-27."
            ),
            RuleCheckResult(
                rule_id="income_ceiling",
                title="Household Income Ceiling (≤ ₹2,50,000)",
                status=CheckStatus.NOT_MET,
                operator="lte",
                actual_value=320000,
                threshold=250000,
                citation=SourceCitation(
                    document_id="doc_rohan_income",
                    document_name="Rohan_Income_Certificate_Jaipur.pdf",
                    page=1,
                    excerpt="Total Annual Income: Rs. 3,20,000/- (Three Lakh Twenty Thousand Rupees Only). Issuing Authority: SDM & Tehsildar, Jaipur.",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="Certified annual income of ₹3,20,000 exceeds statutory maximum limit of ₹2,50,000.",
                blocker_message="Applicant is non-qualifying under current income criteria."
            ),
            RuleCheckResult(
                rule_id="mandatory_documents",
                title="Mandatory Document Verification",
                status=CheckStatus.MET,
                operator="required_document",
                actual_value="income_certificate",
                threshold="income_certificate",
                citation=SourceCitation(
                    document_id="doc_rohan_income",
                    document_name="Rohan_Income_Certificate_Jaipur.pdf",
                    page=1,
                    excerpt="Document verified: Revenue Certificate No. RJ/REV/2026/88412",
                    evidence_type=EvidenceType.DOCUMENTARY_PROOF
                ),
                explanation="All documents supplied, but income ceiling condition failed."
            )
        ]

        draft_fields = [
            ApplicationField(key="name", label="Full Name", value="Rohan Mehta", status=CheckStatus.MET, citation_summary="Rohan_Marksheet_Class12.pdf"),
            ApplicationField(key="student_id", label="Student ID", value="RU-2026-COMM-1092", status=CheckStatus.MET, citation_summary="Rajasthan_Univ_Admission.pdf"),
            ApplicationField(key="institution", label="Institution", value="University of Rajasthan, Jaipur", status=CheckStatus.MET, citation_summary="Rajasthan_Univ_Admission.pdf"),
            ApplicationField(key="course", label="Course Enrolled", value="B.Com (Honours)", status=CheckStatus.MET, citation_summary="Rajasthan_Univ_Admission.pdf"),
            ApplicationField(key="academic_year", label="Academic Year", value="2026-27 (Full-time)", status=CheckStatus.MET, citation_summary="Rajasthan_Univ_Admission.pdf"),
            ApplicationField(key="percentage", label="Class XII Aggregate", value="76.0%", status=CheckStatus.MET, citation_summary="Rohan_Marksheet_Class12.pdf"),
            ApplicationField(key="annual_household_income", label="Annual Household Income", value="₹3,20,000 (EXCEEDS ELIGIBILITY LIMIT)", status=CheckStatus.NOT_MET, citation_summary="Rohan_Income_Certificate_Jaipur.pdf (Page 1)")
        ]

        return CaseState(
            case_id="case_rohan_ineligible",
            applicant_name="Rohan Mehta",
            programme_name=PROGRAMME_NAME,
            grant_amount=GRANT_AMOUNT,
            mode=mode,
            language=language,
            overall_status="stated_condition_not_met",
            progress_met_count=3,
            progress_total_count=4,
            progress_percentage=75,
            next_action_en="Statutory criterion not met: Annual household income of ₹3,20,000 exceeds ₹2,50,000 ceiling.",
            next_action_hi="पात्रता शर्त पूरी नहीं हुई: ₹3,20,000 की वार्षिक आय ₹2,50,000 की सीमा से अधिक है।",
            active_blocker_id="income_ceiling",
            rules=RULES_DEFINITION,
            checks=checks,
            draft_fields=draft_fields,
            uploaded_documents=[
                {"id": "doc_rohan_marksheet", "name": "Rohan_Marksheet_Class12.pdf", "type": "marksheet", "pages": 1, "status": "verified"},
                {"id": "doc_rohan_enrollment", "name": "Rajasthan_Univ_Admission.pdf", "type": "enrollment_letter", "pages": 1, "status": "verified"},
                {"id": "doc_rohan_income", "name": "Rohan_Income_Certificate_Jaipur.pdf", "type": "income_certificate", "pages": 1, "status": "verified"}
            ],
            audit_history=[
                AuditEvent(timestamp=now, event_type="DOCUMENT_PARSED", description="Parsed Rohan Mehta documents.", provenance="Sarvam Vision / 105B"),
                AuditEvent(timestamp=now, event_type="CONDITION_FAILED", description="Income ₹3,20,000 exceeds ₹2,50,000 limit.", provenance="Deterministic Evaluator")
            ],
            signature_status="Pending Applicant Signature"
        )

    elif scenario_key == "conflicting_names":
        state = build_scenario_state("asha_incomplete", mode, language)
        state.case_id = "case_conflicting_names"
        state.overall_status = "more_information_needed"
        state.next_action_en = "Identity conflict detected: Marksheet states 'Ashish Sharma' whereas Aadhaar states 'Asha Sharma'. Manual review required."
        state.next_action_hi = "पहचान में विसंगति: अंकतालिका में 'आशीष शर्मा' लिखा है जबकि आधार में 'आशा शर्मा'। समीक्षा आवश्यक है।"
        state.active_blocker_id = "academic_merit"
        
        state.checks[0] = RuleCheckResult(
            rule_id="academic_merit",
            title="Academic Merit (Identity Conflict)",
            status=CheckStatus.REVIEW_REQUIRED,
            operator="gte",
            actual_value=84.0,
            threshold=60.0,
            missing_evidence="Name reconciliation between Marksheet and Aadhaar",
            blocker_message="Name mismatch: 'Ashish Sharma' on marksheet vs 'Asha Sharma' on application. Review required.",
            citation=SourceCitation(
                document_id="doc_conflict",
                document_name="Secondary_Marksheet.pdf",
                page=1,
                excerpt="Candidate Name: ASHISH SHARMA | Roll No: 11849201 | Aggregate: 84.0%",
                evidence_type=EvidenceType.DOCUMENTARY_PROOF
            ),
            explanation="Marksheet name ('Ashish Sharma') does not match applicant identity ('Asha Sharma'). Unresolved conflict."
        )

        state.audit_history.append(
            AuditEvent(timestamp=now, event_type="IDENTITY_CONFLICT", description="Conflicting candidate names found. Flagged for review.", provenance="Identity Verifier")
        )
        return state

    return build_scenario_state("asha_incomplete", mode, language)
