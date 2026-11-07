import { useState } from 'react';
import type { DiscrepancyItem, ResolutionAction } from '../types/qa.ts';
import {
  X,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GitMerge,
  ShieldCheck,
  Flag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResolutionDrawerProps {
  discrepancy: DiscrepancyItem | null;
  onClose: () => void;
  onResolve: (action: ResolutionAction, rationale: string) => void;
  annotatorAName: string;
  annotatorBName: string;
}

export function ResolutionDrawer({
  discrepancy,
  onClose,
  onResolve,
  annotatorAName,
  annotatorBName,
}: ResolutionDrawerProps) {
  if (!discrepancy) return null;

  const [selectedAction, setSelectedAction] = useState<ResolutionAction>(
    discrepancy.resolutionAction || 'accept_gt'
  );
  const [rationale, setRationale] = useState(discrepancy.reviewerRationale || '');

  // Preset rationale quick tags
  const presetTags = [
    'Boundary geometry matches edge guide standard',
    'Cast shadow artifact correctly identified & pruned',
    'Severe occlusion (>40%) verified against guidelines',
    'Ground Truth gold standard confirmed by lead reviewer',
    'Consensus hull created via boundary merge algorithm',
  ];

  const handleApplyResolution = () => {
    onResolve(selectedAction, rationale.trim() || 'Reviewed and validated per annotation consensus standard.');

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7, x: 0.8 },
      colors: ['#06b6d4', '#10b981', '#a855f7'],
    });
  };

  return (
    <div className="w-full md:w-96 lg:w-[440px] border-l border-slate-800 bg-slate-950 flex flex-col h-full z-30 shadow-2xl text-xs">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">{discrepancy.id}</span>
            <span
              className={`px-1.5 py-0.2 rounded font-mono font-medium text-[10px] ${
                discrepancy.severity === 'critical'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {discrepancy.severity.toUpperCase()}
            </span>
          </div>
          <h2 className="text-sm font-bold text-white mt-0.5">{discrepancy.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description card */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed text-slate-300">
          {discrepancy.description}
        </div>

        {/* Side-by-side candidates inspection */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Candidate Submissions
          </h3>

          {/* Annotator A Box */}
          {discrepancy.boxA && (
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-800/60">
              <div className="flex items-center justify-between text-cyan-400 font-medium mb-1">
                <span>{annotatorAName} (Ann A)</span>
                <span className="font-mono text-[11px]">IoU: {discrepancy.iouScore.toFixed(2)}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                <div>Class: <span className="text-slate-200">{discrepancy.boxA.className}</span></div>
                <div>Bounding Box: [{discrepancy.boxA.x}, {discrepancy.boxA.y}, {discrepancy.boxA.width}x{discrepancy.boxA.height}]</div>
                <div>Confidence: {(discrepancy.boxA.confidence * 100).toFixed(0)}%</div>
                {discrepancy.boxA.rationale && (
                  <div className="italic text-slate-500">"{discrepancy.boxA.rationale}"</div>
                )}
              </div>
            </div>
          )}

          {/* Annotator B Box */}
          {discrepancy.boxB && (
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-800/60">
              <div className="flex items-center justify-between text-purple-400 font-medium mb-1">
                <span>{annotatorBName} (Ann B)</span>
                <span className="font-mono text-[11px]">IoU: {discrepancy.iouScore.toFixed(2)}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                <div>Class: <span className="text-slate-200">{discrepancy.boxB.className}</span></div>
                <div>Bounding Box: [{discrepancy.boxB.x}, {discrepancy.boxB.y}, {discrepancy.boxB.width}x{discrepancy.boxB.height}]</div>
                <div>Confidence: {(discrepancy.boxB.confidence * 100).toFixed(0)}%</div>
                {discrepancy.boxB.rationale && (
                  <div className="italic text-slate-500">"{discrepancy.boxB.rationale}"</div>
                )}
              </div>
            </div>
          )}

          {/* Ground Truth Box */}
          {discrepancy.groundTruth && (
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-800/60">
              <div className="flex items-center justify-between text-amber-400 font-medium mb-1">
                <span>Ground Truth (Gold Standard)</span>
                <span className="font-mono text-[11px]">100% Validated</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                <div>Class: <span className="text-slate-200">{discrepancy.groundTruth.className}</span></div>
                <div>Bounding Box: [{discrepancy.groundTruth.x}, {discrepancy.groundTruth.y}, {discrepancy.groundTruth.width}x{discrepancy.groundTruth.height}]</div>
                {discrepancy.groundTruth.rationale && (
                  <div className="italic text-slate-500">"{discrepancy.groundTruth.rationale}"</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resolution Action Picker */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Resolution Action
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {discrepancy.boxA && (
              <button
                type="button"
                onClick={() => setSelectedAction('accept_a')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedAction === 'accept_a'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-cyan-300">Accept Annotator A</div>
                  <div className="text-[10px] text-slate-400">Adopt Elena's precise boundary box</div>
                </div>
                {selectedAction === 'accept_a' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
              </button>
            )}

            {discrepancy.boxB && (
              <button
                type="button"
                onClick={() => setSelectedAction('accept_b')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedAction === 'accept_b'
                    ? 'bg-purple-950/60 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-purple-300">Accept Annotator B</div>
                  <div className="text-[10px] text-slate-400">Adopt Marcus's classification</div>
                </div>
                {selectedAction === 'accept_b' && <CheckCircle className="w-4 h-4 text-purple-400" />}
              </button>
            )}

            {discrepancy.groundTruth && (
              <button
                type="button"
                onClick={() => setSelectedAction('accept_gt')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                  selectedAction === 'accept_gt'
                    ? 'bg-amber-950/60 border-amber-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-amber-300">Accept Ground Truth</div>
                  <div className="text-[10px] text-slate-400">Overrule annotators with validated baseline</div>
                </div>
                {selectedAction === 'accept_gt' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedAction('merge_boundary')}
              className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                selectedAction === 'merge_boundary'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <GitMerge className="w-3.5 h-3.5" />
                  Merge Boundaries (Consensus Hull)
                </div>
                <div className="text-[10px] text-slate-400">Synthesize mathematical bounding envelope</div>
              </div>
              {selectedAction === 'merge_boundary' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('flag_ambiguity')}
              className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                selectedAction === 'flag_ambiguity'
                  ? 'bg-rose-950/60 border-rose-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" />
                  Flag Ambiguity & Escalate
                </div>
                <div className="text-[10px] text-slate-400">Escalate edge case to domain specialist committee</div>
              </div>
              {selectedAction === 'flag_ambiguity' && <CheckCircle className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Quick Tags for Rationale */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400">Quick Rationale Presets</div>
          <div className="flex flex-wrap gap-1">
            {presetTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setRationale(tag)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-800 transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Rationale Textarea */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400">
            Reviewer Audit Rationale
          </label>
          <textarea
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Document reasoning for compliance audit log..."
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Drawer Footer CTA */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button
          type="button"
          onClick={handleApplyResolution}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-emerald-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Apply Resolution & Sign Audit</span>
        </button>
      </div>
    </div>
  );
}