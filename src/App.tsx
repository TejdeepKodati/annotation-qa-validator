import { useState, useMemo } from 'react';
import type { DiscrepancyItem, QAScenario, ResolutionAction } from './types/qa.ts';
import { SAMPLE_SCENARIOS } from './data/sampleScenarios.ts';
import { computeQAMetrics, detectDiscrepancies, mergeBoundingBoxes } from './utils/metricsEngine.ts';
import { Navbar } from './components/Navbar.tsx';
import { MetricsHUD } from './components/MetricsHUD.tsx';
import { DiscrepancySidebar } from './components/DiscrepancySidebar.tsx';
import { DiffViewer } from './components/DiffViewer.tsx';
import { ResolutionDrawer } from './components/ResolutionDrawer.tsx';
import { AuditReportModal } from './components/AuditReportModal.tsx';
import { GuidelinesModal } from './components/GuidelinesModal.tsx';
import { exportAuditReportJSON } from './utils/reportExport.ts';

export default function App() {
  const [activeScenario, setActiveScenario] = useState<QAScenario>(SAMPLE_SCENARIOS[0]);
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('overlay');

  // Track dynamic discrepancies state per scenario
  const [scenarioDiscrepancies, setScenarioDiscrepancies] = useState<Record<string, DiscrepancyItem[]>>(() => {
    const initial: Record<string, DiscrepancyItem[]> = {};
    for (const sc of SAMPLE_SCENARIOS) {
      initial[sc.id] = detectDiscrepancies(
        sc.groundTruth,
        sc.annotators[0].annotations,
        sc.annotators[1].annotations
      );
    }
    return initial;
  });

  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState<string | null>(null);

  // Modals state
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const currentDiscrepancies = useMemo(() => {
    return scenarioDiscrepancies[activeScenario.id] || [];
  }, [scenarioDiscrepancies, activeScenario.id]);

  const selectedDiscrepancy = useMemo(() => {
    return currentDiscrepancies.find((d) => d.id === selectedDiscrepancyId) || null;
  }, [currentDiscrepancies, selectedDiscrepancyId]);

  const metrics = useMemo(() => {
    return computeQAMetrics(
      currentDiscrepancies,
      activeScenario.groundTruth,
      activeScenario.annotators[0].annotations,
      activeScenario.annotators[1].annotations
    );
  }, [currentDiscrepancies, activeScenario]);

  // Handle Resolution Action on discrepancy
  const handleResolveDiscrepancy = (action: ResolutionAction, rationale: string) => {
    if (!selectedDiscrepancy) return;

    setScenarioDiscrepancies((prev) => {
      const list = prev[activeScenario.id] || [];
      const updated = list.map((item) => {
        if (item.id === selectedDiscrepancy.id) {
          let mergedBox = item.mergedBox;
          if (action === 'merge_boundary' && item.boxA && item.boxB) {
            mergedBox = mergeBoundingBoxes(item.boxA, item.boxB);
          }

          return {
            ...item,
            status: 'resolved' as const,
            resolutionAction: action,
            reviewerRationale: rationale,
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Senior Consensus Auditor',
            mergedBox,
          };
        }
        return item;
      });

      return {
        ...prev,
        [activeScenario.id]: updated,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        scenarios={SAMPLE_SCENARIOS}
        activeScenario={activeScenario}
        onSelectScenario={(s) => {
          setActiveScenario(s);
          setSelectedDiscrepancyId(null);
        }}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenAuditReport={() => setIsAuditModalOpen(true)}
        onExportReport={() => exportAuditReportJSON(activeScenario, metrics, currentDiscrepancies)}
        resolvedCount={metrics.resolvedCount}
        totalCount={metrics.totalDiscrepancies}
      />

      {/* Metrics HUD Strip */}
      <MetricsHUD
        metrics={metrics}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        annotatorAName={activeScenario.annotators[0].annotatorName}
        annotatorBName={activeScenario.annotators[1].annotatorName}
      />

      {/* Central Interactive Workstation */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Discrepancy Queue Sidebar */}
        <DiscrepancySidebar
          discrepancies={currentDiscrepancies}
          selectedDiscrepancy={selectedDiscrepancy}
          onSelectDiscrepancy={(item) => setSelectedDiscrepancyId(item.id)}
        />

        {/* Center Interactive Diff & Split Canvas */}
        <DiffViewer
          scenario={activeScenario}
          viewMode={viewMode}
          selectedDiscrepancy={selectedDiscrepancy}
          onSelectDiscrepancy={(item) => setSelectedDiscrepancyId(item.id)}
          discrepancies={currentDiscrepancies}
        />

        {/* Right Reviewer Resolution Workflow Drawer */}
        {selectedDiscrepancy && (
          <ResolutionDrawer
            discrepancy={selectedDiscrepancy}
            onClose={() => setSelectedDiscrepancyId(null)}
            onResolve={handleResolveDiscrepancy}
            annotatorAName={activeScenario.annotators[0].annotatorName}
            annotatorBName={activeScenario.annotators[1].annotatorName}
          />
        )}
      </div>

      {/* Footer Status Bar with bottom-right badge */}
      <footer className="h-7 border-t border-slate-850 bg-slate-950 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span>Active Benchmark: {activeScenario.title.substring(0, 40)}...</span>
          <span>•</span>
          <span>Domain: {activeScenario.domain}</span>
          <span>•</span>
          <span className="text-cyan-400">Total Discrepancies: {currentDiscrepancies.length}</span>
        </div>
        <div>
          <a
            href="https://github.com/TejdeepKodati/annotation-qa-validator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1 font-sans"
          >
            made with ♥ by Tejdeep
          </a>
        </div>
      </footer>

      {/* Audit Scorecard Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        scenario={activeScenario}
        metrics={metrics}
        discrepancies={currentDiscrepancies}
      />

      {/* Annotation SOP Guidelines Modal */}
      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        scenario={activeScenario}
      />
    </div>
  );
}