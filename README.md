# AnnotationGuard QA

An enterprise-grade Image Annotation Quality Assurance, Consensus Audit, and Discrepancy Validation Platform built with React, TypeScript, and Tailwind CSS.

## Key Features

- **Consensus & Discrepancy Engine**:
  - 2D Bounding Box Intersection over Union (IoU) calculation.
  - Inter-annotator statistical agreement via Cohen's Kappa.
  - Automated discrepancy classification: Missing Detections (False Negatives), False Positives, Classification Mismatches, Boundary Drift, and Attribute Conflicts.
- **Interactive Split-Screen & Diff Canvas**:
  - Side-by-Side Synchronized Pan & Zoom comparison view.
  - Unified Overlay Diff Mode with color-coded layers: Annotator A (Cyan), Annotator B (Purple), Ground Truth (Amber), and Active Discrepancies (Pulsing Red).
  - Discrepancy auto-focus and zoom positioning.
- **Reviewer Resolution Workflow**:
  - Accept Annotator A, Accept Annotator B, Accept Ground Truth, Boundary Merge (Consensus Hull), or Flag Ambiguity.
  - Rationale documentation with quick preset tags.
  - Real-time audit trail metrics update.
- **Audit Scorecard & Compliance Export**:
  - ISO-compliant QA report modal with Error Taxonomy distribution.
  - Instant JSON & CSV export.
- **Pre-Loaded Scenarios**:
  - Autonomous Driving (low-light urban intersection).
  - Satellite Mapping (solar array and building shadow boundary drift).
  - Medical Imaging CT (subpleural nodule and ground-glass opacity margins).

---
made with <3 by Tejdeep • [GitHub Repository](https://github.com/TejdeepKodati/annotation-qa-validator)