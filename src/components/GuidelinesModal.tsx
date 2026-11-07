import type { QAScenario } from '../types/qa.ts';
import { X, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: QAScenario;
}

export function GuidelinesModal({ isOpen, onClose, scenario }: GuidelinesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Annotation Standard Operating Procedure (SOP)
              </h2>
              <p className="text-xs text-slate-400">{scenario.domain} Protocol Specification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/50 text-cyan-200 leading-relaxed">
            All bounding box geometries in this scenario are measured against strict enterprise QA rules. Any discrepancy beyond specified margins must be flagged or resolved via consensus review.
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Domain Labeling Rules
            </h3>
            <ul className="space-y-2.5">
              {scenario.guidelines.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Consensus IoU Criteria
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div>IoU ≥ 0.75: Full Geometric Agreement</div>
              <div>0.40 ≤ IoU &lt; 0.75: Boundary Drift</div>
              <div>IoU &lt; 0.40: Potential False Positive / Negative</div>
              <div>Opposite Class + IoU ≥ 0.50: Severe Classification Mismatch</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Acknowledge Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}