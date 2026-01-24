'use client';

import { useState } from 'react';
import { Clock, Minus, Plus, RotateCcw, Save, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppState } from '../../providers';

// Body regions with SVG positions (simplified for demo)
interface BodyRegionConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const bodyRegions: BodyRegionConfig[] = [
  { id: 'head', name: 'Head', x: 135, y: 10, width: 50, height: 50 },
  { id: 'neck', name: 'Neck', x: 140, y: 60, width: 40, height: 30 },
  { id: 'left-shoulder', name: 'Left Shoulder', x: 85, y: 85, width: 45, height: 35 },
  { id: 'right-shoulder', name: 'Right Shoulder', x: 190, y: 85, width: 45, height: 35 },
  { id: 'left-arm', name: 'Left Arm', x: 55, y: 120, width: 35, height: 80 },
  { id: 'right-arm', name: 'Right Arm', x: 230, y: 120, width: 35, height: 80 },
  { id: 'chest', name: 'Chest', x: 115, y: 95, width: 90, height: 50 },
  { id: 'upper-back', name: 'Upper Back', x: 115, y: 95, width: 90, height: 50 },
  { id: 'lower-back', name: 'Lower Back', x: 120, y: 150, width: 80, height: 50 },
  { id: 'abdomen', name: 'Abdomen', x: 120, y: 150, width: 80, height: 50 },
  { id: 'left-hip', name: 'Left Hip', x: 100, y: 200, width: 45, height: 40 },
  { id: 'right-hip', name: 'Right Hip', x: 175, y: 200, width: 45, height: 40 },
  { id: 'left-thigh', name: 'Left Thigh', x: 95, y: 240, width: 50, height: 70 },
  { id: 'right-thigh', name: 'Right Thigh', x: 175, y: 240, width: 50, height: 70 },
  { id: 'left-knee', name: 'Left Knee', x: 100, y: 310, width: 40, height: 35 },
  { id: 'right-knee', name: 'Right Knee', x: 180, y: 310, width: 40, height: 35 },
  { id: 'left-calf', name: 'Left Calf', x: 95, y: 345, width: 45, height: 65 },
  { id: 'right-calf', name: 'Right Calf', x: 180, y: 345, width: 45, height: 65 },
  { id: 'left-ankle', name: 'Left Ankle', x: 100, y: 410, width: 35, height: 30 },
  { id: 'right-ankle', name: 'Right Ankle', x: 185, y: 410, width: 35, height: 30 },
];

function getPainColor(level: number): string {
  if (level === 0) return 'fill-surface stroke-border';
  if (level <= 3) return 'fill-success/30 stroke-success';
  if (level <= 6) return 'fill-warning/30 stroke-warning';
  return 'fill-error/30 stroke-error';
}

function getPainLabel(level: number): string {
  if (level === 0) return 'No pain';
  if (level <= 3) return 'Mild';
  if (level <= 6) return 'Moderate';
  return 'Severe';
}

export default function BodyMapPage() {
  const appState = useAppState();

  // Local state for editing
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [painLevels, setPainLevels] = useState<Record<string, number>>(() => {
    const levels: Record<string, number> = {};
    appState.bodyRegions.forEach((r) => {
      levels[r.id] = r.painLevel;
    });
    return levels;
  });

  const [history, setHistory] = useState<
    { region: string; from: number; to: number; timestamp: Date }[]
  >([]);

  // Mobile: collapse history by default
  const [showHistory, setShowHistory] = useState(false);

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handlePainChange = (level: number) => {
    if (!selectedRegion) return;

    const oldLevel = painLevels[selectedRegion] || 0;
    setPainLevels((prev) => ({
      ...prev,
      [selectedRegion]: level,
    }));

    // Add to history
    setHistory((prev) => [
      {
        region: selectedRegion,
        from: oldLevel,
        to: level,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    const levels: Record<string, number> = {};
    appState.bodyRegions.forEach((r) => {
      levels[r.id] = r.painLevel;
    });
    setPainLevels(levels);
    setHistory([]);
    setSelectedRegion(null);
  };

  const selectedRegionData = bodyRegions.find((r) => r.id === selectedRegion);
  const currentPainLevel = selectedRegion ? painLevels[selectedRegion] || 0 : 0;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Page Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Body Map</h1>
          <p className="mt-1 text-sm text-muted">
            Tap on any region to update your pain level.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-border px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium text-foreground hover:bg-card transition-colors touch-target"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden xs:inline">Reset</span>
          </button>
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors touch-target">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Mobile: Pain Level Editor at top when region selected */}
      {selectedRegion && (
        <div className="lg:hidden rounded-xl border border-border bg-card p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted">Selected Region</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedRegionData?.name}
              </p>
            </div>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                currentPainLevel <= 3
                  ? 'bg-success/10 text-success'
                  : currentPainLevel <= 6
                  ? 'bg-warning/10 text-warning'
                  : 'bg-error/10 text-error'
              }`}
            >
              {currentPainLevel} - {getPainLabel(currentPainLevel)}
            </span>
          </div>

          {/* Slider */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="10"
              value={currentPainLevel}
              onChange={(e) => handlePainChange(parseInt(e.target.value))}
              className="w-full accent-primary h-2"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handlePainChange(Math.max(0, currentPainLevel - 1))}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-3 text-sm font-medium text-foreground hover:bg-surface transition-colors touch-target"
            >
              <Minus className="h-5 w-5" />
              Decrease
            </button>
            <button
              onClick={() => handlePainChange(Math.min(10, currentPainLevel + 1))}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-3 text-sm font-medium text-foreground hover:bg-surface transition-colors touch-target"
            >
              <Plus className="h-5 w-5" />
              Increase
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {/* Body Map Visualization */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 card-shadow">
            <div className="flex justify-center">
              <svg
                viewBox="0 0 320 460"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Body outline */}
                <ellipse
                  cx="160"
                  cy="35"
                  rx="30"
                  ry="35"
                  className="fill-surface stroke-border stroke-2"
                />
                {/* Torso */}
                <path
                  d="M 100 70 Q 100 90 90 120 L 90 200 Q 90 220 110 240 L 110 340 Q 110 360 120 370 L 120 440 Q 120 455 135 455 L 145 455 Q 150 455 150 440 L 150 360 Q 150 350 160 340 Q 170 350 170 360 L 170 440 Q 170 455 175 455 L 185 455 Q 200 455 200 440 L 200 370 Q 210 360 210 340 L 210 240 Q 230 220 230 200 L 230 120 Q 220 90 220 70 Z"
                  className="fill-surface stroke-border stroke-2"
                />

                {/* Clickable regions - larger touch targets */}
                {bodyRegions.map((region) => (
                  <rect
                    key={region.id}
                    x={region.x}
                    y={region.y}
                    width={region.width}
                    height={region.height}
                    rx={8}
                    className={`cursor-pointer transition-all ${getPainColor(
                      painLevels[region.id] || 0
                    )} ${
                      selectedRegion === region.id
                        ? 'stroke-primary stroke-[3]'
                        : 'stroke-2 hover:stroke-primary/50'
                    }`}
                    onClick={() => handleRegionClick(region.id)}
                  />
                ))}
              </svg>
            </div>

            {/* Legend - Responsive grid */}
            <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2 sm:gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-surface border border-border flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted">No pain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-success/30 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted">Mild (1-3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-warning/30 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted">Moderate (4-6)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-error/30 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted">Severe (7-10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Desktop only or collapsible on mobile */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pain Level Editor - Desktop */}
          <div className="hidden lg:block rounded-xl border border-border bg-card p-6 card-shadow">
            <h2 className="text-lg font-semibold text-foreground">
              Pain Level Editor
            </h2>

            {selectedRegion ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-surface p-4">
                  <p className="text-sm text-muted">Selected Region</p>
                  <p className="text-xl font-semibold text-foreground">
                    {selectedRegionData?.name}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Current Level</span>
                    <span
                      className={`text-sm font-medium ${
                        currentPainLevel <= 3
                          ? 'text-success'
                          : currentPainLevel <= 6
                          ? 'text-warning'
                          : 'text-error'
                      }`}
                    >
                      {currentPainLevel} - {getPainLabel(currentPainLevel)}
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="mt-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={currentPainLevel}
                      onChange={(e) =>
                        handlePainChange(parseInt(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Quick buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        handlePainChange(Math.max(0, currentPainLevel - 1))
                      }
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                      Decrease
                    </button>
                    <button
                      onClick={() =>
                        handlePainChange(Math.min(10, currentPainLevel + 1))
                      }
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Increase
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-muted">
                  Click on a body region to edit its pain level
                </p>
              </div>
            )}
          </div>

          {/* Change History - Collapsible on mobile */}
          <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 sm:p-6 lg:cursor-default touch-target"
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Change History
                </h2>
                {history.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {history.length}
                  </span>
                )}
              </div>
              <div className="lg:hidden">
                {showHistory ? (
                  <ChevronUp className="h-5 w-5 text-muted" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted" />
                )}
              </div>
            </button>

            <div className={`${showHistory ? 'block' : 'hidden'} lg:block border-t border-border lg:border-t-0`}>
              {history.length > 0 ? (
                <div className="p-4 sm:p-6 pt-0 lg:pt-0 space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  {history.slice(0, 10).map((entry, index) => {
                    const regionName = bodyRegions.find(
                      (r) => r.id === entry.region
                    )?.name;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-surface p-2.5 sm:p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {regionName}
                          </p>
                          <p className="text-xs text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {entry.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-sm ${
                              entry.from <= 3
                                ? 'text-success'
                                : entry.from <= 6
                                ? 'text-warning'
                                : 'text-error'
                            }`}
                          >
                            {entry.from}
                          </span>
                          <span className="text-muted">to</span>
                          <span
                            className={`text-sm font-medium ${
                              entry.to <= 3
                                ? 'text-success'
                                : entry.to <= 6
                                ? 'text-warning'
                                : 'text-error'
                            }`}
                          >
                            {entry.to}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-4 sm:p-6 pt-0 lg:pt-0 text-sm text-muted">
                  No changes made yet. Select a region and adjust the pain level.
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 card-shadow">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Summary</h2>
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Active Areas</span>
                <span className="text-sm font-medium text-foreground">
                  {
                    Object.values(painLevels).filter((level) => level > 0)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Avg Pain Level</span>
                <span className="text-sm font-medium text-foreground">
                  {(
                    Object.values(painLevels).reduce((a, b) => a + b, 0) /
                    Object.keys(painLevels).length
                  ).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Highest Pain</span>
                <span className="text-sm font-medium text-error">
                  {Math.max(...Object.values(painLevels))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
