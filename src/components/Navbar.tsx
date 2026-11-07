import type { QAScenario } from '../types/qa.ts';
import {
  ShieldAlert,
  FileCheck2,
  FileSpreadsheet,
  BookOpen,
  Award,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  scenarios: QAScenario[];
  activeScenario: QAScenario;
  onSelectScenario: (scenario: QAScenario) => void;
  onOpenGuidelines: () => void;
  onOpenAuditReport: () => void;
  onExportReport: () => void;
  resolvedCount: number;
  totalCount: number;
}

export function Navbar({
  scenarios,
  activeScenario,
  onSelectScenario,
  onOpenGuidelines,
  onOpenAuditReport,
  onExportReport,
  resolvedCount,
  totalCount,
}: NavbarProps) {
  const progressPct = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AnnotationGuard <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">QA v2.4</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AUDIT ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">Image Annotation Quality Assurance & Consensus Engine</p>
          </div>
        </div>

        {/* Center: Scenario Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select
              value={activeScenario.id}
              onChange={(e) => {
                const found = scenarios.find((s) => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              className="appearance-none bg-slate-900/90 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700/80 rounded-lg pl-3 pr-8 py-2 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer shadow-inner min-w-[220px]"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.domain}] {s.title.substring(0, 36)}...
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Progress pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Consensus:</span>
            <span className="font-mono font-semibold text-white">
              {resolvedCount}/{totalCount}
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[11px] font-mono ${progressPct === 100 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-cyan-400'}`}>
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Action Controls & Author Badge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenGuidelines}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition cursor-pointer"
            title="View Annotation Guidelines (SOP)"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Guidelines</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuditReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Inspect Audit Scorecard & Metrics"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scorecard</span>
          </button>

          <button
            type="button"
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-md shadow-cyan-950/40 cursor-pointer"
            title="Export QA Audit Package (JSON / CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {/* Mandatory Badge */}
          <div className="border-l border-slate-800 pl-2">
            <a
              href="https://github.com/TejdeepKodati/annotation-qa-validator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition flex items-center gap-1"
            >
              made with ♥ by Tejdeep
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}