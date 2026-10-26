from typing import Dict, Any
from .models import CaseState

def generate_printable_html(state: CaseState) -> str:
    """
    Generates a print-ready, downloadable institutional application packet.
    Matches current screen state, includes all field statuses, checklist, and citations.
    """
    fields_html = ""
    for field in state.draft_fields:
        status_badge = f"<span style='color: #059669; font-weight: 600;'>[VERIFIED]</span>" if field.status == "met" else f"<span style='color: #D97706; font-weight: 700;'>[PENDING / ACTION REQUIRED]</span>"
        fields_html += f"""
        <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px; font-weight: 600; color: #374151; width: 35%;">{field.label}</td>
            <td style="padding: 10px; font-weight: 500; color: #111827;">{field.value or '—'}</td>
            <td style="padding: 10px; font-size: 12px;">{status_badge}</td>
            <td style="padding: 10px; font-size: 11px; color: #6B7280;">{field.citation_summary or '—'}</td>
        </tr>
        """

    checklist_html = ""
    for check in state.checks:
        status_text = "PASSED" if check.status == "met" else ("FAILED" if check.status == "not_met" else "ACTION NEEDED")
        color = "#059669" if check.status == "met" else ("#DC2626" if check.status == "not_met" else "#D97706")
        checklist_html += f"""
        <div style="margin-bottom: 12px; padding: 12px; border: 1px solid #E5E7EB; border-left: 4px solid {color}; border-radius: 6px; background-color: #F9FAFB;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #1F2937;">{check.title}</strong>
                <span style="font-size: 11px; font-weight: 700; color: {color}; border: 1px solid {color}; padding: 2px 8px; border-radius: 12px;">{status_text}</span>
            </div>
            <p style="margin: 6px 0 2px 0; font-size: 13px; color: #4B5563;">{check.explanation}</p>
            {f'<p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #047857; background: #ECFDF5; padding: 4px 8px; border-radius: 4px;">Cited Evidence: "{check.citation.excerpt}"</p>' if check.citation else ''}
        </div>
        """

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Packet - {state.applicant_name} ({state.case_id})</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1F2937;
            background-color: #FFF;
            margin: 40px auto;
            max-width: 800px;
            padding: 24px;
            line-height: 1.5;
        }}
        @media print {{
            body {{ margin: 0; padding: 16px; max-width: 100%; }}
            .no-print {{ display: none !important; }}
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
        }}
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Print / Save to PDF
        </button>
    </div>

    <div class="header">
        <h3 style="margin: 0; color: #4B5563; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Official Demonstration Application Packet</h3>
        <h1 style="margin: 6px 0; color: #111827; font-size: 24px;">{state.programme_name}</h1>
        <p style="margin: 0; font-size: 13px; color: #6B7280;">Grant Value: <strong>{state.grant_amount}</strong> · Academic Year 2026–27</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #9CA3AF;">Case Reference ID: {state.case_id} · Export Generated via Aavedan</p>
    </div>

    <div style="background-color: {'#ECFDF5' if state.progress_percentage == 100 else '#FFFBEB'}; border: 1px solid {'#10B981' if state.progress_percentage == 100 else '#F59E0B'}; padding: 14px; border-radius: 8px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: {'#065F46' if state.progress_percentage == 100 else '#92400E'}; font-size: 14px;">
                Status: {'READY FOR REVIEW & SUBMISSION' if state.progress_percentage == 100 else 'INCOMPLETE DRAFT (ACTION REQUIRED)'}
            </strong>
            <span style="font-weight: bold; font-size: 14px; color: {'#059669' if state.progress_percentage == 100 else '#D97706'};">
                {state.progress_met_count} of {state.progress_total_count} Conditions Met ({state.progress_percentage}%)
            </span>
        </div>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #4B5563;">
            {state.next_action_en}
        </p>
    </div>

    <h2 style="font-size: 16px; border-bottom: 1px solid #D1D5DB; padding-bottom: 6px; margin-top: 24px;">1. Applicant Information Draft</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <thead>
            <tr style="background-color: #F3F4F6; text-align: left;">
                <th style="padding: 10px;">Field Name</th>
                <th style="padding: 10px;">Populated Value</th>
                <th style="padding: 10px;">Status</th>
                <th style="padding: 10px;">Supporting Provenance</th>
            </tr>
        </thead>
        <tbody>
            {fields_html}
        </tbody>
    </table>

    <h2 style="font-size: 16px; border-bottom: 1px solid #D1D5DB; padding-bottom: 6px; margin-top: 24px;">2. Statutory Requirements Checklist & Audit Evidence</h2>
    <div style="margin-bottom: 24px;">
        {checklist_html}
    </div>

    <h2 style="font-size: 16px; border-bottom: 1px solid #D1D5DB; padding-bottom: 6px; margin-top: 24px;">3. Applicant Declaration & Attestation</h2>
    <p style="font-size: 12px; color: #4B5563;">
        I hereby solemnly declare that all particulars stated above and in the enclosed supporting documents are true and genuine to the best of my knowledge. I understand that any deliberate misrepresentation will lead to summary disqualification.
    </p>

    <div style="display: flex; justify-content: space-between; margin-top: 50px; padding-top: 16px; border-top: 1px dashed #9CA3AF; font-size: 12px;">
        <div>
            <p style="margin: 0;"><strong>Date:</strong> ________________________</p>
            <p style="margin: 4px 0 0 0; color: #6B7280;">Place: New Delhi / Online</p>
        </div>
        <div style="text-align: right;">
            <p style="margin: 0; border-bottom: 1px solid #111827; padding-bottom: 2px; width: 220px; display: inline-block; font-weight: bold; color: #D97706;">
                [{state.signature_status}]
            </p>
            <p style="margin: 4px 0 0 0; color: #6B7280;">Signature of Candidate ({state.applicant_name})</p>
        </div>
    </div>
</body>
</html>
"""
    return html
