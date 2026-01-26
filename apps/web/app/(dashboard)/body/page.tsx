'use client';

import { Clock, Minus, Plus, RotateCcw, Save, History, ChevronDown, ChevronUp, Sparkles, Target, Activity } from 'lucide-react';
import { useState, useCallback, useId } from 'react';

import { SmartSuggestion } from '../../../src/components';
import { VisuallyHidden, LiveRegion } from '../../../src/components/A11y';
import { useAmbientAI } from '../../../src/hooks';
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
  if (level === 0) return 'fill-[var(--glass-bg)] stroke-[var(--glass-border)]';
  if (level <= 3) return 'fill-emerald-500/30 stroke-emerald-500';
  if (level <= 6) return 'fill-amber-500/30 stroke-amber-500';
  return 'fill-rose-500/30 stroke-rose-500';
}

function getPainLabel(level: number): string {
  if (level === 0) return 'No pain';
  if (level <= 3) return 'Mild';
  if (level <= 6) return 'Moderate';
  return 'Severe';
}

export default function BodyMapPage() {
  const appState = useAppState();
  const sliderId = useId();
  const announcementId = useId();

  // Use ambient AI for contextual insights
  const { smartSuggestions, dismissInsight, context } = useAmbientAI({
    sessions: appState.sessions,
    bodyRegions: appState.bodyRegions,
    location: 'body',
  });

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

  // Announcement for screen readers
  const [announcement, setAnnouncement] = useState('');

  const handleRegionClick = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    const region = bodyRegions.find((r) => r.id === regionId);
    if (region) {
      setAnnouncement(`${region.name} selected. Current pain level: ${painLevels[regionId] || 0} out of 10.`);
    }
  }, [painLevels]);

  const handleRegionKeyDown = useCallback((event: React.KeyboardEvent, regionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRegionClick(regionId);
    }
  }, [handleRegionClick]);

  const handlePainChange = useCallback((level: number) => {
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

    // Announce change
    const regionName = bodyRegions.find((r) => r.id === selectedRegion)?.name;
    setAnnouncement(`${regionName} pain level changed from ${oldLevel} to ${level}. ${getPainLabel(level)}.`);
  }, [selectedRegion, painLevels]);

  const handleReset = useCallback(() => {
    const levels: Record<string, number> = {};
    appState.bodyRegions.forEach((r) => {
      levels[r.id] = r.painLevel;
    });
    setPainLevels(levels);
    setHistory([]);
    setSelectedRegion(null);
    setAnnouncement('Pain levels reset to original values.');
  }, [appState.bodyRegions]);

  const selectedRegionData = bodyRegions.find((r) => r.id === selectedRegion);
  const currentPainLevel = selectedRegion ? painLevels[selectedRegion] || 0 : 0;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Live region for announcements */}
      <LiveRegion aria-live="polite" clearAfter={5000}>
        {announcement}
      </LiveRegion>

      {/* Page Header - Glass Effect */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          <div>
            <h1 className="heading-premium text-xl sm:text-2xl">Body Map</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Tap on any region to update your pain level.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            className="glass-button-ghost flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl px-4 py-3 sm:py-3 text-sm font-medium text-foreground touch-target ripple min-h-[48px]"
            aria-label="Reset all pain levels to original values"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Reset</span>
          </button>
          <button
            className="button-premium flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-3 sm:py-3 text-sm font-semibold text-white touch-target rounded-xl min-h-[48px]"
            aria-label="Save all pain level changes"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Mobile: Pain Level Editor at top when region selected */}
      {selectedRegion && (
        <section
          className="lg:hidden glass-card-luxury p-4 scale-in rounded-2xl"
          aria-labelledby="mobile-editor-heading"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Selected Region</p>
                <h2
                  id="mobile-editor-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  {selectedRegionData?.name}
                </h2>
              </div>
              <span
                className={`text-sm font-medium px-3 py-1.5 rounded-full glass-badge ${
                  currentPainLevel <= 3
                    ? 'glass-badge-success'
                    : currentPainLevel <= 6
                    ? 'glass-badge-warning'
                    : 'glass-badge-error'
                }`}
                aria-label={`Pain level: ${currentPainLevel}, ${getPainLabel(currentPainLevel)}`}
              >
                {currentPainLevel} - {getPainLabel(currentPainLevel)}
              </span>
            </div>

            {/* Slider */}
            <div className="mb-4">
              <label htmlFor={`${sliderId}-mobile`} className="sr-only">
                Pain level for {selectedRegionData?.name}
              </label>
              <input
                id={`${sliderId}-mobile`}
                type="range"
                min="0"
                max="10"
                value={currentPainLevel}
                onChange={(e) => handlePainChange(parseInt(e.target.value))}
                className="w-full h-2"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={currentPainLevel}
                aria-valuetext={`${currentPainLevel} out of 10, ${getPainLabel(currentPainLevel)}`}
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2" aria-hidden="true">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handlePainChange(Math.max(0, currentPainLevel - 1))}
                className="glass-button-ghost flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium text-foreground touch-target ripple min-h-[48px]"
                aria-label={`Decrease pain level to ${Math.max(0, currentPainLevel - 1)}`}
                disabled={currentPainLevel === 0}
              >
                <Minus className="h-5 w-5" aria-hidden="true" />
                Decrease
              </button>
              <button
                onClick={() => handlePainChange(Math.min(10, currentPainLevel + 1))}
                className="glass-button-ghost flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium text-foreground touch-target ripple min-h-[48px]"
                aria-label={`Increase pain level to ${Math.min(10, currentPainLevel + 1)}`}
                disabled={currentPainLevel === 10}
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Increase
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {/* Body Map Visualization - Premium Liquid Glass Container */}
        <section className="lg:col-span-2" aria-labelledby="body-map-heading">
          <VisuallyHidden as="h2" id="body-map-heading">
            Interactive Body Map
          </VisuallyHidden>
          <div className="glass-card-luxury p-4 sm:p-6 md:p-8 relative overflow-hidden rounded-2xl">
            {/* Aurora background effect for body map */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-transparent blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
              <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-[var(--aurora-2)] to-transparent blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '15s', animationDelay: '3s' }} />
              <div className="absolute top-1/3 left-0 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-[var(--aurora-5)] to-transparent blur-3xl opacity-25 animate-pulse" style={{ animationDuration: '12s', animationDelay: '6s' }} />
            </div>

            {/* Specular highlight at top */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[var(--specular-white)] to-transparent opacity-50" aria-hidden="true" />

            <div className="flex justify-center relative z-10">
              <svg
                viewBox="0 0 320 460"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto"
                style={{ touchAction: 'manipulation' }}
                role="img"
                aria-label="Interactive human body diagram showing pain levels for different body regions. Use arrow keys to navigate between regions when focused."
              >
                <title>Body Pain Map</title>
                <desc>An interactive diagram showing a human body outline with clickable regions. Each region can be selected to set a pain level from 0 to 10.</desc>

                {/* Glow definitions */}
                <defs>
                  <filter id="glow-mild" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="glow-moderate" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="glow-severe" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--glass-bg)" />
                    <stop offset="100%" stopColor="var(--glass-bg-subtle)" />
                  </linearGradient>
                </defs>

                {/* Body outline - Glass style (decorative) */}
                <ellipse
                  cx="160"
                  cy="35"
                  rx="30"
                  ry="35"
                  fill="url(#bodyGradient)"
                  stroke="var(--glass-border)"
                  strokeWidth="2"
                  aria-hidden="true"
                />
                {/* Torso */}
                <path
                  d="M 100 70 Q 100 90 90 120 L 90 200 Q 90 220 110 240 L 110 340 Q 110 360 120 370 L 120 440 Q 120 455 135 455 L 145 455 Q 150 455 150 440 L 150 360 Q 150 350 160 340 Q 170 350 170 360 L 170 440 Q 170 455 175 455 L 185 455 Q 200 455 200 440 L 200 370 Q 210 360 210 340 L 210 240 Q 230 220 230 200 L 230 120 Q 220 90 220 70 Z"
                  fill="url(#bodyGradient)"
                  stroke="var(--glass-border)"
                  strokeWidth="2"
                  aria-hidden="true"
                />

                {/* Clickable regions - with glass and glow effects */}
                {bodyRegions.map((region) => {
                  const level = painLevels[region.id] || 0;
                  const isSelected = selectedRegion === region.id;
                  const glowFilter = level <= 3 && level > 0
                    ? 'url(#glow-mild)'
                    : level <= 6 && level > 0
                    ? 'url(#glow-moderate)'
                    : level > 6
                    ? 'url(#glow-severe)'
                    : 'none';

                  return (
                    <rect
                      key={region.id}
                      x={region.x}
                      y={region.y}
                      width={region.width}
                      height={region.height}
                      rx={10}
                      className={`cursor-pointer transition-all duration-300 ${getPainColor(level)} ${
                        isSelected
                          ? 'stroke-[var(--primary)] stroke-[3]'
                          : 'stroke-2 hover:stroke-[var(--primary)]/50'
                      } focus:outline-none focus:stroke-[var(--primary)] focus:stroke-[3]`}
                      style={{
                        filter: isSelected ? 'drop-shadow(0 0 12px var(--glow-primary))' : glowFilter,
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: 'center',
                        transformBox: 'fill-box'
                      }}
                      onClick={() => handleRegionClick(region.id)}
                      onKeyDown={(e) => handleRegionKeyDown(e, region.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.name}. Pain level: ${level} out of 10, ${getPainLabel(level)}. ${isSelected ? 'Selected.' : 'Press Enter to select.'}`}
                      aria-pressed={isSelected}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend - Glass Style */}
            <div
              className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2 sm:gap-4 md:gap-8 relative z-10"
              role="list"
              aria-label="Pain level legend"
            >
              <div className="flex items-center gap-2 glass-panel-subtle rounded-lg px-3 py-2" role="listitem">
                <div className="h-4 w-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] flex-shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">No pain</span>
              </div>
              <div className="flex items-center gap-2 glass-panel-subtle rounded-lg px-3 py-2" role="listitem">
                <div className="h-4 w-4 rounded-lg bg-emerald-500/30 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">Mild (1-3)</span>
              </div>
              <div className="flex items-center gap-2 glass-panel-subtle rounded-lg px-3 py-2" role="listitem">
                <div className="h-4 w-4 rounded-lg bg-amber-500/30 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">Moderate (4-6)</span>
              </div>
              <div className="flex items-center gap-2 glass-panel-subtle rounded-lg px-3 py-2" role="listitem">
                <div className="h-4 w-4 rounded-lg bg-rose-500/30 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">Severe (7-10)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel - Desktop only or collapsible on mobile */}
        <aside className="space-y-4 sm:space-y-6">
          {/* Pain Level Editor - Desktop - Glass Card */}
          <section
            className="hidden lg:block glass-card-luxury p-6 rounded-2xl"
            aria-labelledby="pain-editor-heading"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <h2 id="pain-editor-heading" className="text-lg font-semibold text-foreground">
                  Pain Level Editor
                </h2>
              </div>

              {selectedRegion ? (
                <div className="space-y-4">
                  <div className="glass-panel-subtle rounded-xl p-4">
                    <p className="text-sm text-[var(--text-muted)]">Selected Region</p>
                    <p className="text-xl font-semibold text-foreground">
                      {selectedRegionData?.name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-muted)]">Current Level</span>
                      <span
                        className={`text-sm font-medium glass-badge ${
                          currentPainLevel <= 3
                            ? 'glass-badge-success'
                            : currentPainLevel <= 6
                            ? 'glass-badge-warning'
                            : 'glass-badge-error'
                        }`}
                        aria-live="polite"
                      >
                        {currentPainLevel} - {getPainLabel(currentPainLevel)}
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="mt-3">
                      <label htmlFor={`${sliderId}-desktop`} className="sr-only">
                        Pain level for {selectedRegionData?.name}
                      </label>
                      <input
                        id={`${sliderId}-desktop`}
                        type="range"
                        min="0"
                        max="10"
                        value={currentPainLevel}
                        onChange={(e) =>
                          handlePainChange(parseInt(e.target.value))
                        }
                        className="w-full"
                        aria-valuemin={0}
                        aria-valuemax={10}
                        aria-valuenow={currentPainLevel}
                        aria-valuetext={`${currentPainLevel} out of 10, ${getPainLabel(currentPainLevel)}`}
                      />
                      <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]" aria-hidden="true">
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
                        className="glass-button-ghost flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium text-foreground ripple"
                        aria-label={`Decrease pain level to ${Math.max(0, currentPainLevel - 1)}`}
                        disabled={currentPainLevel === 0}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                        Decrease
                      </button>
                      <button
                        onClick={() =>
                          handlePainChange(Math.min(10, currentPainLevel + 1))
                        }
                        className="glass-button-ghost flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-medium text-foreground ripple"
                        aria-label={`Increase pain level to ${Math.min(10, currentPainLevel + 1)}`}
                        disabled={currentPainLevel === 10}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Increase
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel-subtle rounded-xl border border-dashed border-[var(--glass-border)] p-8 text-center">
                  <Activity className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" aria-hidden="true" />
                  <p className="text-[var(--text-muted)]">
                    Click on a body region to edit its pain level
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Change History - Glass Card with Collapsible */}
          <section className="glass-card-luxury overflow-hidden rounded-2xl" aria-labelledby="history-heading">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 sm:p-6 lg:cursor-default touch-target relative z-10"
              aria-expanded={showHistory}
              aria-controls="history-panel"
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <h2 id="history-heading" className="text-base sm:text-lg font-semibold text-foreground">
                  Change History
                </h2>
                {history.length > 0 && (
                  <span className="glass-badge-primary text-xs" aria-label={`${history.length} changes`}>
                    {history.length}
                  </span>
                )}
              </div>
              <div className="lg:hidden" aria-hidden="true">
                {showHistory ? (
                  <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
                )}
              </div>
            </button>

            <div
              id="history-panel"
              className={`${showHistory ? 'block' : 'hidden'} lg:block border-t border-[var(--glass-border)] lg:border-t-0 relative z-10`}
            >
              {history.length > 0 ? (
                <ul
                  className="p-4 sm:p-6 pt-0 lg:pt-0 space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto"
                  aria-label="List of pain level changes"
                >
                  {history.slice(0, 10).map((entry, index) => {
                    const regionName = bodyRegions.find(
                      (r) => r.id === entry.region
                    )?.name;
                    return (
                      <li
                        key={index}
                        className="flex items-center justify-between glass-panel-subtle rounded-xl p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {regionName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            <time dateTime={entry.timestamp.toISOString()}>
                              {entry.timestamp.toLocaleTimeString()}
                            </time>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-sm font-medium ${
                              entry.from <= 3
                                ? 'text-emerald-500'
                                : entry.from <= 6
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }`}
                            aria-label={`From ${entry.from}`}
                          >
                            {entry.from}
                          </span>
                          <span className="text-[var(--text-muted)]" aria-hidden="true">→</span>
                          <span className="sr-only">to</span>
                          <span
                            className={`text-sm font-semibold ${
                              entry.to <= 3
                                ? 'text-emerald-500'
                                : entry.to <= 6
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }`}
                            aria-label={`to ${entry.to}`}
                          >
                            {entry.to}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="p-4 sm:p-6 pt-0 lg:pt-0 text-sm text-[var(--text-muted)]">
                  No changes made yet. Select a region and adjust the pain level.
                </p>
              )}
            </div>
          </section>

          {/* Summary - Glass Stat Card */}
          <section className="glass-stat-card-premium p-4 sm:p-6 rounded-2xl" aria-labelledby="summary-heading">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              <h2 id="summary-heading" className="text-base sm:text-lg font-semibold text-foreground">
                Summary
              </h2>
            </div>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-[var(--text-muted)]">Active Areas</dt>
                <dd className="text-sm font-semibold text-foreground glass-badge-primary">
                  {Object.values(painLevels).filter((level) => level > 0).length}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-[var(--text-muted)]">Avg Pain Level</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {(
                    Object.values(painLevels).reduce((a, b) => a + b, 0) /
                    Object.keys(painLevels).length
                  ).toFixed(1)}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-[var(--text-muted)]">Highest Pain</dt>
                <dd className="text-sm font-semibold text-rose-500">
                  {Math.max(...Object.values(painLevels))}
                </dd>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                <div
                  className="glass-progress h-3 rounded-full"
                  role="progressbar"
                  aria-valuenow={Math.round(
                    (Object.values(painLevels).filter((level) => level === 0).length /
                      Object.keys(painLevels).length) *
                    100
                  )}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Percentage of pain-free areas"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-cyan-500 transition-all duration-500"
                    style={{
                      width: `${
                        (Object.values(painLevels).filter((level) => level === 0).length /
                          Object.keys(painLevels).length) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                  {Math.round(
                    (Object.values(painLevels).filter((level) => level === 0).length /
                      Object.keys(painLevels).length) *
                    100
                  )}% pain-free areas
                </p>
              </div>
            </dl>
          </section>

          {/* AI Smart Prompts - Glass Style */}
          {smartSuggestions.length > 0 && (
            <section aria-labelledby="smart-tips-heading" className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative" aria-hidden="true">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  <div className="absolute inset-0 text-[var(--primary)] blur-sm opacity-50">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <h2 id="smart-tips-heading" className="text-sm font-medium text-[var(--text-muted)]">
                  Smart Tips
                </h2>
              </div>
              {smartSuggestions.slice(0, 2).map((insight) => (
                <SmartSuggestion
                  key={insight.id}
                  insight={insight}
                  onDismiss={dismissInsight}
                  variant="default"
                />
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
