import pytest
from app.evaluator import Evaluator
from app.models import CheckStatus, EvidenceType, SourceCitation

def test_marks_gte_operator():
    facts = {
        "percentage": {
            "value": 84.0,
            "evidence_type": EvidenceType.DOCUMENTARY_PROOF,
            "citation": SourceCitation(document_id="doc1", document_name="marksheet.pdf", page=1, excerpt="Marks: 84%")
        }
    }
    res = Evaluator.evaluate_rule(
        rule_id="academic_merit",
        title="Marks ≥ 60%",
        operator="gte",
        field_key="percentage",
        threshold=60.0,
        facts=facts
    )
    assert res.status == CheckStatus.MET
    assert res.actual_value == 84.0

def test_income_lte_operator_passed():
    facts = {
        "annual_household_income": {
            "value": 180000,
            "evidence_type": EvidenceType.DOCUMENTARY_PROOF,
            "citation": SourceCitation(document_id="doc2", document_name="income_cert.pdf", page=1, excerpt="Income: 180000")
        }
    }
    res = Evaluator.evaluate_rule(
        rule_id="income_ceiling",
        title="Income ≤ ₹250,000",
        operator="lte",
        field_key="annual_household_income",
        threshold=250000,
        facts=facts
    )
    assert res.status == CheckStatus.MET

def test_income_lte_operator_failed_rohan():
    facts = {
        "annual_household_income": {
            "value": 320000,
            "evidence_type": EvidenceType.DOCUMENTARY_PROOF,
            "citation": SourceCitation(document_id="doc2", document_name="income_cert.pdf", page=1, excerpt="Income: 320000")
        }
    }
    res = Evaluator.evaluate_rule(
        rule_id="income_ceiling",
        title="Income ≤ ₹250,000",
        operator="lte",
        field_key="annual_household_income",
        threshold=250000,
        facts=facts
    )
    assert res.status == CheckStatus.NOT_MET
    assert "exceeds" in res.explanation

def test_spoken_income_cannot_satisfy_document_requirement():
    """
    CRITICAL INSTITUTIONAL BEHAVIOR:
    User statement is recorded, but cannot satisfy official documentary requirement.
    """
    facts = {
        "annual_household_income": {
            "value": 180000,
            "evidence_type": EvidenceType.USER_STATEMENT,
            "citation": SourceCitation(document_id="statement1", document_name="User Oral Statement", page=1, excerpt="My income is 1.8L", evidence_type=EvidenceType.USER_STATEMENT)
        }
    }
    res = Evaluator.evaluate_rule(
        rule_id="income_ceiling",
        title="Income ≤ ₹250,000",
        operator="lte",
        field_key="annual_household_income",
        threshold=250000,
        facts=facts
    )
    # Must be NEEDS_INFO, NOT MET!
    assert res.status == CheckStatus.NEEDS_INFO
    assert res.missing_evidence == "Official Revenue / Tehsildar Income Certificate"

def test_conflicting_names_require_review():
    facts = {
        "name": {
            "value": "Asha Sharma",
            "has_conflict": True,
            "conflicting_value": "Ashish Sharma",
            "evidence_type": EvidenceType.DOCUMENTARY_PROOF,
            "citation": SourceCitation(document_id="doc3", document_name="marksheet.pdf", page=1, excerpt="Ashish Sharma")
        }
    }
    res = Evaluator.evaluate_rule(
        rule_id="identity_match",
        title="Identity Verification",
        operator="eq",
        field_key="name",
        threshold="Asha Sharma",
        facts=facts
    )
    assert res.status == CheckStatus.REVIEW_REQUIRED
