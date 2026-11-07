import { useState } from 'react';
import type { DiscrepancyItem, DiscrepancySeverity } from '../types/qa.ts';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  Search,
  Focus,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';

interface DiscrepancySidebarProps {
  discrepancies: DiscrepancyItem[];
  selectedDiscrepancy: DiscrepancyItem | null;
  onSelectDiscrepancy: (item: DiscrepancyItem) => void;
}

export function DiscrepancySidebar({
  discrepancies,
  selectedDiscrepancy,
  onSelectDiscrepancy,
}: DiscrepancySidebarProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | DiscrepancySeverity>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = discrepancies.filter((d) => {
    if (filterSeverity !== 'all' && d.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchClass =
        d.boxA?.className.toLowerCase().includes(q) ||
        d.boxB?.className.toLowerCase().includes(q) ||
        d.groundTruth?.className.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchClass;
    }
    return true;
  });

  const getSeverityBadge = (sev: DiscrepancySeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'major':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/80">
            MAJOR
          </span>
        );
      case 'minor':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            MINOR
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'missing_detection':
        return 'False Negative';
      case 'false_positive':
        return 'False Positive';
      case 'classification_mismatch':
        return 'Class Conflict';
      case 'boundary_drift':
        return 'Boundary Drift';
      case 'attribute_conflict':
        return 'Attribute Conflict';
      default:
        return type;
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden select-none">
      {/* Header and Filter Controls */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Discrepancy Queue
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
            {filtered.length} of {discrepancies.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search discrepancy or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-slate-700 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filterSeverity === 'critical'
                ? 'bg-rose-900/60 text-rose-200 font-medium border border-rose-800'
                : 'text-rose-400/80 hover:bg-rose-950/40'
            }`}
          >
            Critical
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('major')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filterSeverity === 'major'
                ? 'bg-amber-900/60 text-amber-200 font-medium border border-amber-800'
                : 'text-amber-400/80 hover:bg-amber-950/40'
            }`}
          >
            Major
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('minor')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filterSeverity === 'minor'
                ? 'bg-slate-700 text-white font-medium'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Minor
          </button>

          <span className="text-slate-700">|</span>

          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Discrepancy Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-medium text-slate-300">No Discrepancies Found</p>
            <p className="text-[11px] text-slate-500 mt-1">Adjust filters or search criteria above.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selectedDiscrepancy?.id === item.id;
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item.id}
                onClick={() => onSelectDiscrepancy(item)}
                className={`p-3 rounded-lg border transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                    : isResolved
                    ? 'bg-slate-950/60 border-slate-800/60 opacity-75 hover:opacity-100 hover:border-slate-700'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Top row: ID, Type chip, Severity badge */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.id}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>

                {/* Title */}
                <h3 className="text-xs font-semibold text-slate-100 mb-1 line-clamp-1">{item.title}</h3>

                {/* Description */}
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {item.description}
                </p>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-1.5 mt-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>IoU:</span>
                    <span
                      className={`font-semibold ${
                        item.iouScore >= 0.70
                          ? 'text-emerald-400'
                          : item.iouScore >= 0.40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {item.iouScore.toFixed(2)}
                    </span>
                  </div>

                  {isResolved ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                      <Focus className="w-3 h-3" />
                      Review & Resolve
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}