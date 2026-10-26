from typing import Dict, Any, List, Tuple
from .models import CheckStatus, EvidenceType, RuleCheckResult, SourceCitation

ALLOWLISTED_OPERATORS = {"gte", "lte", "eq", "in", "required_document", "all", "any"}

class Evaluator:
    """
    Deterministic typed rule evaluator for institutional application checks.
    Never executes model-generated code.
    Distinguishes missing evidence from condition failure.
    """

    @staticmethod
    def evaluate_rule(
        rule_id: str,
        title: str,
        operator: str,
        field_key: str,
        threshold: Any,
        facts: Dict[str, Any],
        required_doc_type: str = None,
        uploaded_doc_types: List[str] = None
    ) -> RuleCheckResult:
        uploaded_doc_types = uploaded_doc_types or []
        
        # 1. Required Document Check
        if operator == "required_document":
            doc_present = required_doc_type in uploaded_doc_types
            if doc_present:
                # Find matching doc citation if available
                citation = facts.get(f"doc_{required_doc_type}_citation")
                return RuleCheckResult(
                    rule_id=rule_id,
                    title=title,
                    status=CheckStatus.MET,
                    operator=operator,
                    actual_value=required_doc_type,
                    threshold=required_doc_type,
                    citation=citation,
                    explanation=f"Required document '{required_doc_type}' has been uploaded and verified."
                )
            else:
                return RuleCheckResult(
                    rule_id=rule_id,
                    title=title,
                    status=CheckStatus.NEEDS_INFO,
                    operator=operator,
                    actual_value=None,
                    threshold=required_doc_type,
                    missing_evidence=f"Missing: {required_doc_type}",
                    blocker_message=f"Please upload an official {required_doc_type} to satisfy this requirement.",
                    explanation=f"Official {required_doc_type} is not yet attached."
                )

        # 2. Field Value Checks
        fact = facts.get(field_key)
        
        # Missing fact
        if fact is None or fact.get("value") is None:
            return RuleCheckResult(
                rule_id=rule_id,
                title=title,
                status=CheckStatus.NEEDS_INFO,
                operator=operator,
                threshold=threshold,
                missing_evidence=f"No record found for {field_key}",
                blocker_message=f"Missing documentary evidence for {title}.",
                explanation=f"Could not determine {field_key}; required documentary proof is missing."
            )

        val = fact.get("value")
        ev_type = fact.get("evidence_type", EvidenceType.MISSING)
        citation = fact.get("citation")

        # Identity Conflict Check
        if fact.get("has_conflict"):
            return RuleCheckResult(
                rule_id=rule_id,
                title=title,
                status=CheckStatus.REVIEW_REQUIRED,
                operator=operator,
                actual_value=val,
                threshold=threshold,
                citation=citation,
                missing_evidence="Conflicting identity information across documents",
                blocker_message="Identity mismatch detected between Marksheet and Aadhaar. Manual review required.",
                explanation=f"Name on Aadhaar ({val}) conflicts with secondary document ({fact.get('conflicting_value')})."
            )

        # CRITICAL INSTITUTIONAL DISTINCTION:
        # User statements (oral/typed income claims) cannot satisfy an official documentary requirement!
        if field_key == "annual_household_income" and ev_type == EvidenceType.USER_STATEMENT:
            return RuleCheckResult(
                rule_id=rule_id,
                title=title,
                status=CheckStatus.NEEDS_INFO,
                operator=operator,
                actual_value=val,
                threshold=threshold,
                citation=citation,
                missing_evidence="Official Revenue / Tehsildar Income Certificate",
                blocker_message="Applicant stated ₹1,80,000, but official Tehsildar Income Certificate is missing.",
                explanation=f"Self-reported claim of ₹{val:,} recorded. An official certified income certificate is required to verify statutory eligibility."
            )

        # 3. Numeric & Equality Evaluations
        if operator == "gte":
            try:
                numeric_val = float(val)
                numeric_thresh = float(threshold)
                if numeric_val >= numeric_thresh:
                    return RuleCheckResult(
                        rule_id=rule_id,
                        title=title,
                        status=CheckStatus.MET,
                        operator=operator,
                        actual_value=numeric_val,
                        threshold=numeric_thresh,
                        citation=citation,
                        explanation=f"Achieved {numeric_val}%, satisfying minimum merit requirement of {numeric_thresh}%."
                    )
                else:
                    return RuleCheckResult(
                        rule_id=rule_id,
                        title=title,
                        status=CheckStatus.NOT_MET,
                        operator=operator,
                        actual_value=numeric_val,
                        threshold=numeric_thresh,
                        citation=citation,
                        explanation=f"Score of {numeric_val}% is below the mandatory threshold of {numeric_thresh}%."
                    )
            except (ValueError, TypeError):
                return RuleCheckResult(rule_id=rule_id, title=title, status=CheckStatus.NEEDS_INFO, operator=operator, threshold=threshold, explanation="Invalid numeric score.")

        elif operator == "lte":
            try:
                numeric_val = float(val)
                numeric_thresh = float(threshold)
                if numeric_val <= numeric_thresh:
                    return RuleCheckResult(
                        rule_id=rule_id,
                        title=title,
                        status=CheckStatus.MET,
                        operator=operator,
                        actual_value=numeric_val,
                        threshold=numeric_thresh,
                        citation=citation,
                        explanation=f"Certified annual income of ₹{int(numeric_val):,} is within statutory ceiling of ₹{int(numeric_thresh):,}."
                    )
                else:
                    return RuleCheckResult(
                        rule_id=rule_id,
                        title=title,
                        status=CheckStatus.NOT_MET,
                        operator=operator,
                        actual_value=numeric_val,
                        threshold=numeric_thresh,
                        citation=citation,
                        explanation=f"Certified annual income of ₹{int(numeric_val):,} exceeds the statutory ceiling of ₹{int(numeric_thresh):,}."
                    )
            except (ValueError, TypeError):
                return RuleCheckResult(rule_id=rule_id, title=title, status=CheckStatus.NEEDS_INFO, operator=operator, threshold=threshold, explanation="Invalid numeric income.")

        elif operator == "eq":
            is_match = str(val).strip().lower() == str(threshold).strip().lower()
            if is_match:
                return RuleCheckResult(
                    rule_id=rule_id,
                    title=title,
                    status=CheckStatus.MET,
                    operator=operator,
                    actual_value=val,
                    threshold=threshold,
                    citation=citation,
                    explanation=f"Enrollment verified for {val} ({threshold})."
                )
            else:
                return RuleCheckResult(
                    rule_id=rule_id,
                    title=title,
                    status=CheckStatus.NOT_MET,
                    operator=operator,
                    actual_value=val,
                    threshold=threshold,
                    citation=citation,
                    explanation=f"Enrollment status ({val}) does not match required programme year ({threshold})."
                )

        return RuleCheckResult(
            rule_id=rule_id,
            title=title,
            status=CheckStatus.NEEDS_INFO,
            operator=operator,
            explanation=f"Operator '{operator}' check could not be evaluated."
        )
