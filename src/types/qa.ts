export type ExperienceTier = 'Junior' | 'Senior' | 'Specialist';

export interface AnnotationBox {
  id: string;
  classId: string;
  className: string;
  x: number; // percentage or pixel coordinate relative to canvas (0-1000 standard coordinate space)
  y: number;
  width: number;
  height: number;
  confidence: number;
  isOccluded?: boolean;
  isTruncated?: boolean;
  rationale?: string;
  color?: string;
}

export interface AnnotatorSubmission {
  annotatorId: string;
  annotatorName: string;
  experienceTier: ExperienceTier;
  submissionTime: string;
  annotations: AnnotationBox[];
  avatarUrl?: string;
}

export type DiscrepancyType =
  | 'missing_detection'
  | 'false_positive'
  | 'classification_mismatch'
  | 'boundary_drift'
  | 'attribute_conflict';

export type DiscrepancySeverity = 'critical' | 'major' | 'minor';

export type DiscrepancyStatus = 'pending' | 'resolved' | 'disputed';

export type ResolutionAction =
  | 'accept_a'
  | 'accept_b'
  | 'accept_gt'
  | 'merge_boundary'
  | 'flag_ambiguity';

export interface DiscrepancyItem {
  id: string;
  type: DiscrepancyType;
  severity: DiscrepancySeverity;
  title: string;
  description: string;
  boxA?: AnnotationBox;
  boxB?: AnnotationBox;
  groundTruth?: AnnotationBox;
  iouScore: number;
  status: DiscrepancyStatus;
  resolutionAction?: ResolutionAction;
  reviewerRationale?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  mergedBox?: AnnotationBox;
}

export type ScenarioDomain = 'Autonomous Driving' | 'Satellite Mapping' | 'Medical Imaging';

export interface QAScenario {
  id: string;
  title: string;
  domain: ScenarioDomain;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  guidelines: string[];
  groundTruth: AnnotationBox[];
  annotators: AnnotatorSubmission[];
}

export interface QAMetrics {
  overallAgreementKappa: number;
  meanIoU: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalDiscrepancies: number;
  resolvedCount: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  compliancePass: boolean;
}