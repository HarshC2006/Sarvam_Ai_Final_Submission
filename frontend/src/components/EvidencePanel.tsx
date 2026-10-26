import React, { useState } from 'react';
import type { RuleCheck } from '../types';
import { FileText, Upload, Sparkles, AlertTriangle, ShieldCheck, ZoomIn, ZoomOut, FileCode } from 'lucide-react';

interface EvidencePanelProps {
  checks: RuleCheck[];
  selectedRuleId: string;
  onResolveHero: () => void;
  onUploadFile: (file: File) => void;
  uploadedDocs: any[];
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  checks,
  selectedRuleId,
  onResolveHero,
  onUploadFile,
  uploadedDocs,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const selectedCheck = checks.find(c => c.rule_id === selectedRuleId) || checks[0];
  const citation = selectedCheck?.citation;
  const isDocumentProof = citation?.evidence_type === 'documentary_proof';
  const isUserStatement = citation?.evidence_type === 'user_statement';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Panel Distinct Header */}
      <div className="px-5 py-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-700">
            2
          </div>
          <div>
            <h2 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Evidence Inspector
            </h2>
            <p className="text-[11px] text-stone-500">
              Documentary proof and verbatim citations
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 text-xs text-stone-700">
          <button
            onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
            className="hover:text-stone-900 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] w-9 text-center">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
            className="hover:text-stone-900 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        
        {/* Active Requirement Evidence Card */}
        <div className="bg-stone-50/70 border border-stone-200 rounded-xl p-4 shadow-sm space-y-3.5">
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-stone-500 font-bold tracking-wider">
              Inspecting Criterion:
            </span>
            {isDocumentProof ? (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>Verified Documentary Proof</span>
              </span>
            ) : isUserStatement ? (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Unverified Self-Reported Claim</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Evidence Missing
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm text-stone-900">{selectedCheck?.title}</h3>
            {citation ? (
              <p className="text-xs text-stone-600 mt-1 flex items-center gap-1.5 font-mono">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>{citation.document_name} · Page {citation.page}</span>
              </p>
            ) : (
              <p className="text-xs text-amber-700 mt-1 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>No official document supplied yet</span>
              </p>
            )}
          </div>

          {/* Verbatim Excerpt Block */}
          <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
              Sarvam Vision OCR / Extracted Excerpt:
            </span>
            <div
              className="text-xs font-mono text-stone-800 leading-relaxed italic bg-forest-50/40 p-2.5 rounded-lg border-l-2 border-forest-700 transition-all duration-200"
              style={{ fontSize: `${(12 * zoomLevel) / 100}px` }}
            >
              {citation ? `"${citation.excerpt}"` : '"[NO EVIDENCE AVAILABLE - OFFICIAL DOCUMENT PENDING]"'}
            </div>
          </div>

          {/* Institutional Distinction Callout */}
          <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-700">
            <strong className="text-stone-900 block mb-0.5 font-semibold">Institutional Rule Guidance:</strong>
            {isUserStatement ? (
              <p className="text-amber-800 text-[11px]">
                ⚠️ Rule distinction: Applicant's verbal assertion records a stated value, but cannot satisfy the statutory requirement for an authorized revenue officer's certificate.
              </p>
            ) : isDocumentProof ? (
              <p className="text-forest-700 text-[11px]">
                ✅ Verified against official issuer stamp and signature. This evidence fully satisfies the programme condition.
              </p>
            ) : (
              <p className="text-stone-500 text-[11px]">
                Attach the original issued certificate to advance your application to verified status.
              </p>
            )}
          </div>

        </div>

        {/* Hero Resolution Action Button */}
        {selectedCheck?.rule_id === 'income_ceiling' && selectedCheck?.status !== 'met' && (
          <button
            onClick={onResolveHero}
            className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>⚡ Resolve Blocker: Upload Tehsildar Certificate</span>
          </button>
        )}

        {/* Drag and Drop Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-stone-300 hover:border-forest-700 rounded-xl p-5 text-center bg-stone-50/50 transition cursor-pointer relative group"
        >
          <input
            type="file"
            onChange={handleFileInput}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-6 h-6 text-stone-400 group-hover:text-forest-700 mx-auto mb-2 transition" />
          <p className="text-xs font-semibold text-stone-800">
            Drop your documents here, or <span className="text-forest-700 underline">browse</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">
            Supports PDF, PNG, JPG (Digitised by Sarvam Vision)
          </p>
        </div>

        {/* Uploaded Documents List */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
            Attached Documents ({uploadedDocs.length}):
          </span>
          <div className="space-y-1.5">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-stone-200 text-xs"
              >
                <div className="flex items-center gap-2 font-mono">
                  <FileCode className="w-4 h-4 text-stone-500" />
                  <span className="text-stone-800">{doc.name}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
        <span>Vision Engine: Sarvam Doc AI v1</span>
        <span className="font-mono text-stone-600">Reading Mode: Markdown</span>
      </div>

    </div>
  );
};
