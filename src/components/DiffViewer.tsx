import { useState, useRef, useEffect } from 'react';
import type { AnnotationBox, DiscrepancyItem, QAScenario } from '../types/qa.ts';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Crosshair,
  Sliders,
  Check,
} from 'lucide-react';

interface DiffViewerProps {
  scenario: QAScenario;
  viewMode: 'split' | 'overlay';
  selectedDiscrepancy: DiscrepancyItem | null;
  onSelectDiscrepancy: (item: DiscrepancyItem) => void;
  discrepancies: DiscrepancyItem[];
}

export function DiffViewer({
  scenario,
  viewMode,
  selectedDiscrepancy,
  onSelectDiscrepancy,
  discrepancies,
}: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer Visibility
  const [showAnnotatorA, setShowAnnotatorA] = useState(true);
  const [showAnnotatorB, setShowAnnotatorB] = useState(true);
  const [showGroundTruth, setShowGroundTruth] = useState(true);
  const [showDiscrepancies, setShowDiscrepancies] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Hovered Box for Tooltip Inspection
  const [hoveredBox, setHoveredBox] = useState<{
    box: AnnotationBox;
    owner: 'Annotator A' | 'Annotator B' | 'Ground Truth';
    x: number;
    y: number;
  } | null>(null);

  const annotatorA = scenario.annotators[0];
  const annotatorB = scenario.annotators[1];

  // Auto-focus on selected discrepancy
  useEffect(() => {
    if (selectedDiscrepancy) {
      const targetBox =
        selectedDiscrepancy.boxA ||
        selectedDiscrepancy.boxB ||
        selectedDiscrepancy.groundTruth;

      if (targetBox && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Scale box center into container coordinates
        const boxCenterX = targetBox.x + targetBox.width / 2;
        const boxCenterY = targetBox.y + targetBox.height / 2;

        setZoom(1.6);
        setPan({
          x: centerX - boxCenterX * 1.6,
          y: centerY - boxCenterY * 1.6,
        });
      }
    }
  }, [selectedDiscrepancy]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(3.5, Math.max(0.6, Number((prev + delta).toFixed(2)))));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /**
   * Generates high-fidelity simulated sensor background canvas SVG
   * according to scenario domain.
   */
  const renderSimulatedBackground = () => {
    const { domain, imageWidth, imageHeight } = scenario;

    if (domain === 'Autonomous Driving') {
      return (
        <svg width={imageWidth} height={imageHeight} className="absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="roadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0e17" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#080c14" />
            </linearGradient>
            <pattern id="rainTexture" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="10" y2="25" stroke="#38bdf8" strokeWidth="0.4" strokeOpacity="0.15" />
              <line x1="20" y1="5" x2="30" y2="30" stroke="#38bdf8" strokeWidth="0.4" strokeOpacity="0.15" />
            </pattern>
          </defs>
          {/* Asphalt & Wet Reflections */}
          <rect width={imageWidth} height={imageHeight} fill="url(#roadGradient)" />
          <rect width={imageWidth} height={imageHeight} fill="url(#rainTexture)" />

          {/* Lane markings & Crosswalk */}
          <line x1="50" y1="360" x2="950" y2="360" stroke="#475569" strokeWidth="3" strokeDasharray="25 20" />
          <line x1="50" y1="500" x2="950" y2="500" stroke="#cbd5e1" strokeWidth="4" strokeOpacity="0.25" />

          {/* Crosswalk Zebra bars */}
          {[160, 200, 240, 280, 320, 360, 400, 440, 480, 520].map((x) => (
            <rect key={x} x={x} y="330" width="22" height="70" fill="#94a3b8" fillOpacity="0.12" />
          ))}

          {/* Simulated HUD Reticles & Sensor Horizon */}
          <line x1="0" y1="260" x2={imageWidth} y2="260" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 6" />
          <text x="30" y="45" fill="#38bdf8" fontSize="12" fontFamily="monospace" opacity="0.6">
            LIDAR-CAM01 [1080p 60FPS] • EV -0.7 • ISO 3200
          </text>
        </svg>
      );
    }

    if (domain === 'Satellite Mapping') {
      return (
        <svg width={imageWidth} height={imageHeight} className="absolute inset-0 pointer-events-none">
          <defs>
            <radialGradient id="terrainGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <pattern id="grid100" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>
          <rect width={imageWidth} height={imageHeight} fill="url(#terrainGrad)" />
          <rect width={imageWidth} height={imageHeight} fill="url(#grid100)" />

          {/* Simulated industrial structures */}
          <rect x="520" y="90" width="380" height="240" fill="#334155" fillOpacity="0.4" stroke="#64748b" strokeWidth="1" />
          {/* Photovoltaic array pattern */}
          <rect x="120" y="110" width="320" height="190" fill="#0369a1" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1" />
          {/* Retention pond water contour */}
          <ellipse cx="280" cy="470" rx="130" ry="90" fill="#0f766e" fillOpacity="0.3" stroke="#14b8a6" strokeWidth="1" />
          {/* Ortho grid label */}
          <text x="30" y="45" fill="#14b8a6" fontSize="12" fontFamily="monospace" opacity="0.6">
            SENTINEL-2 ORTHO-NADIR • GSD 0.3M • EPSG:3857
          </text>
        </svg>
      );
    }

    // Medical Imaging CT
    return (
      <svg width={imageWidth} height={imageHeight} className="absolute inset-0 pointer-events-none">
        <defs>
          <radialGradient id="ctGrad" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
        <rect width={imageWidth} height={imageHeight} fill="url(#ctGrad)" />
        {/* Lung Parenchyma ellipses */}
        <ellipse cx="380" cy="330" rx="190" ry="210" fill="#020617" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
        <ellipse cx="660" cy="330" rx="190" ry="210" fill="#020617" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
        {/* Vertebral body & sternum simulated density */}
        <ellipse cx="520" cy="520" rx="45" ry="35" fill="#64748b" fillOpacity="0.4" />
        <text x="30" y="45" fill="#f43f5e" fontSize="12" fontFamily="monospace" opacity="0.6">
          THORACIC CT AXIAL • 1.25mm SLICE • WL: -600 WW: 1500 (LUNG WINDOW)
        </text>
      </svg>
    );
  };

  /**
   * Render single bounding box item
   */
  const renderBox = (
    box: AnnotationBox,
    borderColor: string,
    bgColor: string,
    owner: 'Annotator A' | 'Annotator B' | 'Ground Truth',
    dashed = false,
    isHighlighted = false
  ) => {
    return (
      <div
        key={`${owner}-${box.id}`}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredBox({
            box,
            owner,
            x: rect.right + 10,
            y: rect.top,
          });
        }}
        onMouseLeave={() => setHoveredBox(null)}
        style={{
          left: `${box.x}px`,
          top: `${box.y}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        }}
        className={`absolute transition-all duration-150 pointer-events-auto ${borderColor} ${bgColor} ${
          dashed ? 'border-2 border-dashed' : 'border-2'
        } ${
          isHighlighted
            ? 'ring-4 ring-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse z-30'
            : 'z-10 hover:z-20'
        }`}
      >
        {/* Corner alignment markers */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-current opacity-80" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-current opacity-80" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-current opacity-80" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-current opacity-80" />

        {/* Floating pill label */}
        {showLabels && (
          <div
            className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none ${
              owner === 'Annotator A'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : owner === 'Annotator B'
                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {box.className}
            {box.confidence && <span className="opacity-70 ml-1">{(box.confidence * 100).toFixed(0)}%</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col h-full">
      {/* Top Floating Canvas Toolbar */}
      <div className="absolute top-3 left-4 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-xl">
        <button
          type="button"
          onClick={() => handleZoom(0.2)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="font-mono text-xs text-slate-300 px-1 min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => handleZoom(-0.2)}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Reset Canvas View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <span className="text-slate-700">|</span>

        {/* Layer Visibility Toggles */}
        <button
          type="button"
          onClick={() => setShowAnnotatorA(!showAnnotatorA)}
          className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
            showAnnotatorA
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Annotator A layer"
        >
          {showAnnotatorA ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
          Ann A
        </button>

        <button
          type="button"
          onClick={() => setShowAnnotatorB(!showAnnotatorB)}
          className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
            showAnnotatorB
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Annotator B layer"
        >
          {showAnnotatorB ? <Eye className="w-3 h-3 text-purple-400" /> : <EyeOff className="w-3 h-3" />}
          Ann B
        </button>

        <button
          type="button"
          onClick={() => setShowGroundTruth(!showGroundTruth)}
          className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition cursor-pointer ${
            showGroundTruth
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Ground Truth layer"
        >
          {showGroundTruth ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
          GT
        </button>

        <button
          type="button"
          onClick={() => setShowLabels(!showLabels)}
          className={`px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
            showLabels ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
          }`}
          title="Toggle bounding box text labels"
        >
          Labels
        </button>
      </div>

      {/* Main Visual Workspace Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`flex-1 relative overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {viewMode === 'overlay' ? (
          /* UNIFIED OVERLAY DIFF MODE */
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: `${scenario.imageWidth}px`,
              height: `${scenario.imageHeight}px`,
            }}
            className="absolute top-12 left-12 border border-slate-800 rounded-lg shadow-2xl transition-transform duration-75"
          >
            {renderSimulatedBackground()}

            {/* Ground Truth Layer */}
            {showGroundTruth &&
              scenario.groundTruth.map((box) =>
                renderBox(
                  box,
                  'border-amber-400 text-amber-400',
                  'bg-amber-400/10',
                  'Ground Truth',
                  true,
                  selectedDiscrepancy?.groundTruth?.id === box.id
                )
              )}

            {/* Annotator A Layer */}
            {showAnnotatorA &&
              annotatorA.annotations.map((box) =>
                renderBox(
                  box,
                  'border-cyan-400 text-cyan-400',
                  'bg-cyan-400/15',
                  'Annotator A',
                  false,
                  selectedDiscrepancy?.boxA?.id === box.id
                )
              )}

            {/* Annotator B Layer */}
            {showAnnotatorB &&
              annotatorB.annotations.map((box) =>
                renderBox(
                  box,
                  'border-purple-400 text-purple-400',
                  'bg-purple-400/15',
                  'Annotator B',
                  false,
                  selectedDiscrepancy?.boxB?.id === box.id
                )
              )}

            {/* Discrepancy Reticle Markers */}
            {showDiscrepancies &&
              discrepancies.map((disc) => {
                const targetBox = disc.boxA || disc.boxB || disc.groundTruth;
                if (!targetBox) return null;
                const isSelected = selectedDiscrepancy?.id === disc.id;

                return (
                  <div
                    key={disc.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDiscrepancy(disc);
                    }}
                    style={{
                      left: `${targetBox.x + targetBox.width - 12}px`,
                      top: `${targetBox.y - 12}px`,
                    }}
                    className={`absolute z-30 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shadow-lg cursor-pointer transition transform hover:scale-125 ${
                      isSelected
                        ? 'bg-rose-500 text-white ring-4 ring-rose-400/60 animate-bounce'
                        : disc.status === 'resolved'
                        ? 'bg-emerald-600 text-white'
                        : disc.severity === 'critical'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {disc.status === 'resolved' ? <Check className="w-3.5 h-3.5" /> : '!'}
                  </div>
                );
              })}
          </div>
        ) : (
          /* SIDE-BY-SIDE SPLIT VIEW */
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            className="absolute top-12 left-12 flex items-center gap-6 transition-transform duration-75"
          >
            {/* Panel 1: Annotator A */}
            <div
              style={{
                width: `${scenario.imageWidth}px`,
                height: `${scenario.imageHeight}px`,
              }}
              className="relative border border-cyan-800/80 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-cyan-800 text-[11px] font-mono text-cyan-300">
                Annotator A: {annotatorA.annotatorName} ({annotatorA.experienceTier})
              </div>
              {renderSimulatedBackground()}
              {annotatorA.annotations.map((box) =>
                renderBox(
                  box,
                  'border-cyan-400 text-cyan-400',
                  'bg-cyan-400/20',
                  'Annotator A',
                  false,
                  selectedDiscrepancy?.boxA?.id === box.id
                )
              )}
            </div>

            {/* Panel 2: Annotator B (with Ground Truth overlay dashed) */}
            <div
              style={{
                width: `${scenario.imageWidth}px`,
                height: `${scenario.imageHeight}px`,
              }}
              className="relative border border-purple-800/80 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-md border border-purple-800 text-[11px] font-mono text-purple-300">
                Annotator B: {annotatorB.annotatorName} ({annotatorB.experienceTier})
              </div>
              {renderSimulatedBackground()}
              {/* Optional Ground Truth reference */}
              {showGroundTruth &&
                scenario.groundTruth.map((box) =>
                  renderBox(
                    box,
                    'border-amber-400 text-amber-400',
                    'bg-amber-400/10',
                    'Ground Truth',
                    true
                  )
                )}
              {annotatorB.annotations.map((box) =>
                renderBox(
                  box,
                  'border-purple-400 text-purple-400',
                  'bg-purple-400/20',
                  'Annotator B',
                  false,
                  selectedDiscrepancy?.boxB?.id === box.id
                )
              )}
            </div>
          </div>
        )}

        {/* Hover Inspection Tooltip */}
        {hoveredBox && (
          <div
            style={{ left: `${hoveredBox.x}px`, top: `${hoveredBox.y}px` }}
            className="fixed z-50 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-3 shadow-2xl text-xs space-y-1.5 min-w-[200px]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-semibold text-white">{hoveredBox.box.className}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {hoveredBox.owner}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>Coords: [{hoveredBox.box.x}, {hoveredBox.box.y}]</div>
              <div>Dims: {hoveredBox.box.width} x {hoveredBox.box.height} px</div>
              <div>Confidence: {(hoveredBox.box.confidence * 100).toFixed(1)}%</div>
              {hoveredBox.box.isOccluded !== undefined && (
                <div>Occluded: {hoveredBox.box.isOccluded ? 'Yes' : 'No'}</div>
              )}
            </div>
            {hoveredBox.box.rationale && (
              <p className="text-[10px] text-slate-400 italic border-t border-slate-800 pt-1">
                "{hoveredBox.box.rationale}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom status helper strip */}
      <div className="border-t border-slate-800/80 px-4 py-2 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Click & drag to Pan canvas</span>
          <span>•</span>
          <span>Scroll or use +/- to Zoom</span>
          <span>•</span>
          <span>Click discrepancy markers (!) to audit</span>
        </div>
        <div>
          Resolution: {scenario.imageWidth} x {scenario.imageHeight} px
        </div>
      </div>
    </div>
  );
}