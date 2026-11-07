import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateIoU, calculateCohenKappa, mergeBoundingBoxes } from '../metricsEngine.ts';
import type { AnnotationBox } from '../../types/qa.ts';

describe('MetricsEngine Verification', () => {
  it('calculates IoU of identical boxes as 1.0', () => {
    const box1: AnnotationBox = { id: 'b1', classId: 'c1', className: 'Car', x: 10, y: 10, width: 100, height: 100, confidence: 1 };
    const box2: AnnotationBox = { id: 'b2', classId: 'c1', className: 'Car', x: 10, y: 10, width: 100, height: 100, confidence: 1 };
    assert.strictEqual(calculateIoU(box1, box2), 1.0);
  });

  it('calculates IoU of non-overlapping boxes as 0.0', () => {
    const box1: AnnotationBox = { id: 'b1', classId: 'c1', className: 'Car', x: 10, y: 10, width: 50, height: 50, confidence: 1 };
    const box2: AnnotationBox = { id: 'b2', classId: 'c1', className: 'Car', x: 100, y: 100, width: 50, height: 50, confidence: 1 };
    assert.strictEqual(calculateIoU(box1, box2), 0.0);
  });

  it('calculates IoU accurately for 50% shifted overlap', () => {
    const box1: AnnotationBox = { id: 'b1', classId: 'c1', className: 'Car', x: 0, y: 0, width: 100, height: 100, confidence: 1 };
    const box2: AnnotationBox = { id: 'b2', classId: 'c1', className: 'Car', x: 50, y: 0, width: 100, height: 100, confidence: 1 };
    // Intersection = 50 * 100 = 5000; Union = 10000 + 10000 - 5000 = 15000; IoU = 5000 / 15000 = 0.3333
    const iou = calculateIoU(box1, box2);
    assert.strictEqual(iou, 0.3333);
  });

  it('calculates Cohen Kappa statistical agreement correctly', () => {
    const ratingsA = ['Pedestrian', 'Car', 'Pedestrian', 'Cyclist'];
    const ratingsB = ['Pedestrian', 'Car', 'Pedestrian', 'Cyclist'];
    const cats = ['Pedestrian', 'Car', 'Cyclist'];
    const kappa = calculateCohenKappa(ratingsA, ratingsB, cats);
    assert.strictEqual(kappa, 1.0);
  });

  it('merges bounding boxes into an enveloping consensus box', () => {
    const box1: AnnotationBox = { id: 'b1', classId: 'c1', className: 'Box', x: 10, y: 20, width: 50, height: 60, confidence: 0.8 };
    const box2: AnnotationBox = { id: 'b2', classId: 'c1', className: 'Box', x: 15, y: 15, width: 60, height: 70, confidence: 0.9 };
    const merged = mergeBoundingBoxes(box1, box2);
    assert.strictEqual(merged.x, 10);
    assert.strictEqual(merged.y, 15);
    assert.strictEqual(merged.width, 65);
    assert.strictEqual(merged.height, 70);
    assert.strictEqual(merged.confidence, 0.85);
  });
});