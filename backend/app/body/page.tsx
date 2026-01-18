'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner, LoadingListItem } from '../components/LoadingSpinner';
import { NoInjuriesTracked } from '../components/EmptyState';

const bodyRegions = [
  { id: 'neck', label: 'Neck', x: 50, y: 8 },
  { id: 'left_shoulder', label: 'L Shoulder', x: 30, y: 18 },
  { id: 'right_shoulder', label: 'R Shoulder', x: 70, y: 18 },
  { id: 'chest', label: 'Chest', x: 50, y: 25 },
  { id: 'upper_back', label: 'Upper Back', x: 50, y: 22 },
  { id: 'left_arm', label: 'L Arm', x: 20, y: 35 },
  { id: 'right_arm', label: 'R Arm', x: 80, y: 35 },
  { id: 'lower_back', label: 'Lower Back', x: 50, y: 40 },
  { id: 'core', label: 'Core', x: 50, y: 38 },
  { id: 'left_hip', label: 'L Hip', x: 38, y: 48 },
  { id: 'right_hip', label: 'R Hip', x: 62, y: 48 },
  { id: 'left_thigh', label: 'L Thigh', x: 38, y: 60 },
  { id: 'right_thigh', label: 'R Thigh', x: 62, y: 60 },
  { id: 'left_knee', label: 'L Knee', x: 38, y: 72 },
  { id: 'right_knee', label: 'R Knee', x: 62, y: 72 },
  { id: 'left_calf', label: 'L Calf', x: 38, y: 82 },
  { id: 'right_calf', label: 'R Calf', x: 62, y: 82 },
  { id: 'left_ankle', label: 'L Ankle', x: 38, y: 92 },
  { id: 'right_ankle', label: 'R Ankle', x: 62, y: 92 },
];

const initialMockInjuries = [
  { id: '1', region: 'right_shoulder', severity: 'moderate', description: 'Rotator cuff strain', daysAgo: 5 },
  { id: '2', region: 'lower_back', severity: 'mild', description: 'Muscle tightness', daysAgo: 2 },
];

// Set to true to simulate empty state
const SIMULATE_NO_INJURIES = false;

type Severity = 'mild' | 'moderate' | 'severe';
type Injury = {
  id: string;
  region: string;
  severity: string;
  description: string;
  daysAgo: number;
};

export default function BodyPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [painSeverity, setPainSeverity] = useState<Severity>('mild');
  const [focusedRegionIndex, setFocusedRegionIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Simulate loading injuries data
  useEffect(() => {
    const loadInjuries = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setInjuries(SIMULATE_NO_INJURIES ? [] : initialMockInjuries);
      setIsLoading(false);
    };
    loadInjuries();
  }, []);

  // Handle escape key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showLogModal) {
      setShowLogModal(false);
    }
  }, [showLogModal]);

  // Focus trap and escape handling for modal
  useEffect(() => {
    if (showLogModal) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      // Focus the modal content
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLogModal, handleKeyDown]);

  // Handle keyboard navigation in body map
  const handleBodyMapKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedRegion(bodyRegions[index].id);
      setShowLogModal(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return '#EF4444';
      case 'moderate': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="screen-header">
        <h1 className="screen-title">Body Map</h1>
        <p className="screen-subtitle">Tap a region to log pain or view injuries</p>
      </header>

      {/* Body visualization */}
      <div className="card" style={{ padding: '2rem' }}>
        <svg
          viewBox="0 0 100 100"
          style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'block' }}
          role="img"
          aria-label="Interactive body map. Use Tab to navigate between body regions and Enter to select."
        >
          <title>Body Map</title>
          <desc>Interactive diagram showing body regions. Select a region to log pain or view injuries.</desc>

          {/* Simple body outline */}
          <ellipse cx="50" cy="7" rx="8" ry="7" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="40" y="14" width="20" height="30" rx="3" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="22" y="16" width="8" height="25" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="70" y="16" width="8" height="25" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="35" y="44" width="12" height="35" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="53" y="44" width="12" height="35" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="35" y="79" width="12" height="18" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />
          <rect x="53" y="79" width="12" height="18" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" aria-hidden="true" />

          {/* Injury markers */}
          {injuries.map(injury => {
            const region = bodyRegions.find(r => r.id === injury.region);
            if (!region) return null;
            return (
              <circle
                key={injury.id}
                cx={region.x}
                cy={region.y}
                r="4"
                fill={getSeverityColor(injury.severity)}
                opacity="0.8"
                style={{ cursor: 'pointer' }}
                aria-hidden="true"
                onClick={() => {
                  setSelectedRegion(injury.region);
                }}
              />
            );
          })}

          {/* Tap targets - keyboard accessible */}
          {bodyRegions.map((region, index) => (
            <circle
              key={region.id}
              cx={region.x}
              cy={region.y}
              r="6"
              fill={focusedRegionIndex === index ? 'var(--brand-primary)' : 'transparent'}
              fillOpacity={focusedRegionIndex === index ? 0.3 : 0}
              stroke={focusedRegionIndex === index ? 'var(--brand-primary)' : 'transparent'}
              strokeWidth="2"
              style={{ cursor: 'pointer', outline: 'none' }}
              tabIndex={0}
              role="button"
              aria-label={`${region.label} region. Press Enter to log pain.`}
              onClick={() => {
                setSelectedRegion(region.id);
                setShowLogModal(true);
              }}
              onKeyDown={(e) => handleBodyMapKeyDown(e, index)}
              onFocus={() => setFocusedRegionIndex(index)}
              onBlur={() => setFocusedRegionIndex(-1)}
              className="body-region-target"
            />
          ))}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Mild</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Severe</span>
          </div>
        </div>
      </div>

      {/* Active injuries */}
      <div className="section">
        <h3 className="section-title">Active Issues ({injuries.length})</h3>
        {isLoading ? (
          <>
            <LoadingListItem />
            <LoadingListItem />
          </>
        ) : injuries.length === 0 ? (
          <NoInjuriesTracked />
        ) : (
          injuries.map(injury => {
            const region = bodyRegions.find(r => r.id === injury.region);
            return (
              <div key={injury.id} className="list-item">
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${getSeverityColor(injury.severity)}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: getSeverityColor(injury.severity),
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{region?.label}</div>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {injury.description} • {injury.daysAgo}d ago
                  </div>
                </div>
                <span className={`badge badge-${injury.severity === 'severe' ? 'error' : injury.severity === 'moderate' ? 'warning' : 'success'}`}>
                  {injury.severity}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Log pain modal */}
      {showLogModal && selectedRegion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setShowLogModal(false)}
        >
          <div
            ref={modalRef}
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              width: '100%',
              maxWidth: 430,
            }}
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              // Focus trap: cycle focus within modal
              if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                  'button, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                  const firstElement = focusableElements[0] as HTMLElement;
                  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
                  if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                  } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                  }
                }
              }
            }}
          >
            <h3 id="modal-title" style={{ fontWeight: 600, marginBottom: '1rem' }}>
              Log Pain - {bodyRegions.find(r => r.id === selectedRegion)?.label}
            </h3>

            <fieldset style={{ border: 'none', padding: 0, marginBottom: '1rem' }}>
              <legend className="section-title" style={{ marginBottom: '0.5rem' }}>Severity</legend>
              <div style={{ display: 'flex', gap: '0.5rem' }} role="group" aria-label="Pain severity selection">
                {(['mild', 'moderate', 'severe'] as Severity[]).map(severity => (
                  <button
                    key={severity}
                    ref={severity === 'mild' ? closeButtonRef : undefined}
                    className={`btn ${painSeverity === severity ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                    onClick={() => setPainSeverity(severity)}
                    aria-pressed={painSeverity === severity}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor="pain-description" className="sr-only">
              Pain description (optional)
            </label>
            <textarea
              id="pain-description"
              className="input"
              placeholder="Describe the pain (optional)"
              aria-label="Describe the pain (optional)"
              rows={3}
              style={{ marginBottom: '1rem', resize: 'none' }}
            />

            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                // Would save to API
                setShowLogModal(false);
                setSelectedRegion(null);
              }}
            >
              Log Pain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
