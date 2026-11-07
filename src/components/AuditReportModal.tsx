import type { DiscrepancyItem, QAMetrics, QAScenario } from '../types/qa.ts';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileCode2,
  BarChart3,
  Shield,
  Layers,
} from 'lucide-react';
import { exportAuditReportCSV, exportAuditReportJSON } from '../utils/reportExport.ts';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: QAScenario;
  metrics: QAMetrics;
  discrepancies: DiscrepancyItem[];
}

export function AuditReportModal({
  isOpen,
  onClose,
  scenario,
  metrics,
  discrepancies,
}: AuditReportModalProps) {
  if (!isOpen) return null;

  // Breakdown of error taxonomy
  const missingCount = discrepancies.filter((d) => d.type === 'missing_detection').length;
  const fpCount = discrepancies.filter((d) => d.type === 'false_positive').length;
  const classCount = discrepancies.filter((d) => d.type === 'classification_mismatch').length;
  const boundaryCount = discrepancies.filter((d) => d.type === 'boundary_drift').length;
  const attrCount = discrepancies.filter((d) => d.type === 'attribute_conflict').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                QA Audit Scorecard & Compliance Dossier
              </h2>
              <p className="text-xs text-slate-400">{scenario.title} ({scenario.domain})</p>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Compliance Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              metrics.compliancePass
                ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {metrics.compliancePass ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {metrics.compliancePass ? 'QA AUDIT CERTIFIED - COMPLIANCE PASS' : 'REMEDIATION REQUIRED - AUDIT PENDING'}
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Threshold: F1 ≥ 82%, Cohen's κ ≥ 0.70, and 0 Pending Critical Discrepancies.
                </p>
              </div>
            </div>
            <div className="font-mono font-bold text-base px-3 py-1 rounded bg-slate-950/60 border border-current">
              F1: {(metrics.f1Score * 100).toFixed(0)}%
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Cohen's Kappa (κ)</span>
              <div className="text-lg font-mono font-bold text-cyan-400 mt-1">{metrics.overallAgreementKappa}</div>
              <span className="text-[10px] text-slate-500">Categorical Agreement</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Mean IoU (Spatial)</span>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">{(metrics.meanIoU * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-500">Overlap Precision</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Precision / Recall</span>
              <div className="text-lg font-mono font-bold text-white mt-1">{metrics.precision} / {metrics.recall}</div>
              <span className="text-[10px] text-slate-500">True Positivity</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-medium">Resolution Rate</span>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                {metrics.resolvedCount}/{metrics.totalDiscrepancies}
              </div>
              <span className="text-[10px] text-slate-500">
                {metrics.totalDiscrepancies > 0 ? Math.round((metrics.resolvedCount / metrics.totalDiscrepancies) * 100) : 100}% Cleared
              </span>
            </div>
          </div>

          {/* Error Taxonomy Visual Distribution */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Error Taxonomy Breakdown
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Total: {discrepancies.length} Events</span>
            </div>

            {/* Visual Distribution Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              {missingCount > 0 && (
                <div style={{ width: `${(missingCount / discrepancies.length) * 100}%` }} className="bg-rose-500" title={`Missing Detections: ${missingCount}`} />
              )}
              {fpCount > 0 && (
                <div style={{ width: `${(fpCount / discrepancies.length) * 100}%` }} className="bg-orange-500" title={`False Positives: ${fpCount}`} />
              )}
              {classCount > 0 && (
                <div style={{ width: `${(classCount / discrepancies.length) * 100}%` }} className="bg-purple-500" title={`Class Mismatches: ${classCount}`} />
              )}
              {boundaryCount > 0 && (
                <div style={{ width: `${(boundaryCount / discrepancies.length) * 100}%` }} className="bg-cyan-500" title={`Boundary Drift: ${boundaryCount}`} />
              )}
              {attrCount > 0 && (
                <div style={{ width: `${(attrCount / discrepancies.length) * 100}%` }} className="bg-slate-500" title={`Attribute Conflicts: ${attrCount}`} />
              )}
            </div>

            {/* Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Missing Detections
                </span>
                <span className="font-mono font-semibold text-rose-400">{missingCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  False Positives
                </span>
                <span className="font-mono font-semibold text-orange-400">{fpCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Class Conflicts
                </span>
                <span className="font-mono font-semibold text-purple-400">{classCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Boundary Drift
                </span>
                <span className="font-mono font-semibold text-cyan-400">{boundaryCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Attribute Conflicts
                </span>
                <span className="font-mono font-semibold text-slate-300">{attrCount}</span>
              </div>
            </div>
          </div>

          {/* Annotator Comparative Performance Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Annotator</th>
                  <th className="p-2.5">Tier</th>
                  <th className="p-2.5">Box Count</th>
                  <th className="p-2.5">Submission Timestamp</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {scenario.annotators.map((ann) => (
                  <tr key={ann.annotatorId}>
                    <td className="p-2.5 font-semibold text-slate-200">{ann.annotatorName}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                        {ann.experienceTier}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-slate-300">{ann.annotations.length} targets</td>
                    <td className="p-2.5 font-mono text-slate-400">{ann.submissionTime}</td>
                    <td className="p-2.5 text-emerald-400 font-medium">Audited</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            Export signed audit trail package for compliance archives
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportAuditReportJSON(scenario, metrics, discrepancies)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => exportAuditReportCSV(scenario, metrics, discrepancies)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}