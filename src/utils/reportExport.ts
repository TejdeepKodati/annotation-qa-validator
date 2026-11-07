import type { DiscrepancyItem, QAMetrics, QAScenario } from '../types/qa.ts';

export function exportAuditReportJSON(
  scenario: QAScenario,
  metrics: QAMetrics,
  discrepancies: DiscrepancyItem[]
): void {
  const payload = {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      platform: 'AnnotationGuard QA Console',
      complianceFramework: 'ISO-25010 Quality Model / Consensus Audit Protocol',
      auditor: 'Lead QA Reviewer',
    },
    scenarioSummary: {
      scenarioId: scenario.id,
      title: scenario.title,
      domain: scenario.domain,
      groundTruthTargetCount: scenario.groundTruth.length,
      annotators: scenario.annotators.map((a) => ({
        id: a.annotatorId,
        name: a.annotatorName,
        experienceTier: a.experienceTier,
        submissionCount: a.annotations.length,
        submittedAt: a.submissionTime,
      })),
    },
    consensusMetrics: {
      cohenKappa: metrics.overallAgreementKappa,
      meanIoU: metrics.meanIoU,
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      compliancePass: metrics.compliancePass,
      totalDiscrepancies: metrics.totalDiscrepancies,
      resolvedCount: metrics.resolvedCount,
      pendingCritical: metrics.criticalCount,
      pendingMajor: metrics.majorCount,
      pendingMinor: metrics.minorCount,
    },
    auditTrail: discrepancies.map((d) => ({
      discrepancyId: d.id,
      type: d.type,
      severity: d.severity,
      title: d.title,
      description: d.description,
      iouScore: d.iouScore,
      status: d.status,
      resolutionAction: d.resolutionAction ?? 'UNRESOLVED',
      reviewerRationale: d.reviewerRationale ?? 'N/A',
      resolvedAt: d.resolvedAt ?? null,
      boxA: d.boxA ? { class: d.boxA.className, x: d.boxA.x, y: d.boxA.y, w: d.boxA.width, h: d.boxA.height } : null,
      boxB: d.boxB ? { class: d.boxB.className, x: d.boxB.x, y: d.boxB.y, w: d.boxB.width, h: d.boxB.height } : null,
      groundTruth: d.groundTruth ? { class: d.groundTruth.className, x: d.groundTruth.x, y: d.groundTruth.y, w: d.groundTruth.width, h: d.groundTruth.height } : null,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `AnnotationGuard-Audit-${scenario.id}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportAuditReportCSV(
  scenario: QAScenario,
  _metrics: QAMetrics,
  discrepancies: DiscrepancyItem[]
): void {
  const headers = [
    'Discrepancy ID',
    'Scenario',
    'Domain',
    'Type',
    'Severity',
    'Title',
    'IoU Score',
    'Status',
    'Resolution Action',
    'Reviewer Rationale',
    'Resolved At',
  ];

  const rows = discrepancies.map((d) => [
    `"${d.id}"`,
    `"${scenario.title.replace(/"/g, '""')}"`,
    `"${scenario.domain}"`,
    `"${d.type}"`,
    `"${d.severity}"`,
    `"${d.title.replace(/"/g, '""')}"`,
    d.iouScore.toFixed(3),
    `"${d.status}"`,
    `"${d.resolutionAction ?? 'PENDING'}"`,
    `"${(d.reviewerRationale ?? '').replace(/"/g, '""')}"`,
    `"${d.resolvedAt ?? 'N/A'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `AnnotationGuard-Audit-${scenario.id}-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}