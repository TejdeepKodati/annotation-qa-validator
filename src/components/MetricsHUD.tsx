import type { QAMetrics } from '../types/qa.ts';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Layers,
  Columns,
  Sparkles,
} from 'lucide-react';

interface MetricsHUDProps {
  metrics: QAMetrics;
  viewMode: 'split' | 'overlay';
  onToggleViewMode: (mode: 'split' | 'overlay') => void;
  annotatorAName: string;
  annotatorBName: string;
}

export function MetricsHUD({
  metrics,
  viewMode,
  onToggleViewMode,
  annotatorAName,
  annotatorBName,
}: MetricsHUDProps) {
  // Cohen Kappa interpretation
  const getKappaLabel = (k: number) => {
    if (k >= 0.81) return { label: 'Near Perfect', color: 'text-emerald-400', bg: 'bg-emerald-950/40' };
    if (k >= 0.61) return { label: 'Substantial', color: 'text-cyan-400', bg: 'bg-cyan-950/40' };
    if (k >= 0.41) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-950/40' };
    return { label: 'Poor / Drift', color: 'text-rose-400', bg: 'bg-rose-950/40' };
  };

  const kappaBadge = getKappaLabel(metrics.overallAgreementKappa);

  return (
    <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 lg:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
      {/* Metric Badges */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Cohen's Kappa */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-medium">Cohen's Kappa (κ):</span>
          <span className="font-mono font-bold text-white">{metrics.overallAgreementKappa}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${kappaBadge.bg} ${kappaBadge.color}`}>
            {kappaBadge.label}
          </span>
        </div>

        {/* Mean IoU */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-medium">Mean IoU:</span>
          <span className="font-mono font-bold text-emerald-400">{(metrics.meanIoU * 100).toFixed(1)}%</span>
        </div>

        {/* F1 Score */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 font-medium">F1 Score:</span>
          <span className="font-mono font-bold text-white">{metrics.f1Score}</span>
          <span className="text-slate-500 text-[10px]">P: {metrics.precision} / R: {metrics.recall}</span>
        </div>

        {/* Severity counters */}
        <div className="flex items-center gap-1.5">
          {metrics.criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/70 text-rose-300 font-mono font-medium text-[11px]">
              <XCircle className="w-3 h-3 text-rose-400 animate-pulse" />
              {metrics.criticalCount} Critical
            </span>
          )}
          {metrics.majorCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/70 text-amber-300 font-mono font-medium text-[11px]">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {metrics.majorCount} Major
            </span>
          )}
          {metrics.minorCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
              {metrics.minorCount} Minor
            </span>
          )}
          {metrics.criticalCount === 0 && metrics.majorCount === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Consensus Clear
            </span>
          )}
        </div>
      </div>

      {/* Right controls: View Mode toggle & Annotator legend */}
      <div className="flex items-center gap-3">
        {/* Color Legend indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 border-r border-slate-800 pr-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span className="text-cyan-300">{annotatorAName} (A)</span>
          </span>
          <span className="inline-flex items-center gap-1 ml-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
            <span className="text-purple-300">{annotatorBName} (B)</span>
          </span>
          <span className="inline-flex items-center gap-1 ml-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-amber-300">Ground Truth</span>
          </span>
        </div>

        {/* Split vs Unified Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => onToggleViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
              viewMode === 'split'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('overlay')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition text-xs font-medium cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Unified Diff</span>
          </button>
        </div>
      </div>
    </div>
  );
}