'use client';

import { useState } from 'react';

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

const mockInjuries = [
  { id: '1', region: 'right_shoulder', severity: 'moderate', description: 'Rotator cuff strain', daysAgo: 5 },
  { id: '2', region: 'lower_back', severity: 'mild', description: 'Muscle tightness', daysAgo: 2 },
];

type Severity = 'mild' | 'moderate' | 'severe';

export default function BodyPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [painSeverity, setPainSeverity] = useState<Severity>('mild');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return '#EF4444';
      case 'moderate': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const injuredRegions = mockInjuries.map(i => i.region);

  return (
    <div className="animate-fade-in">
      <header className="screen-header">
        <h1 className="screen-title">Body Map</h1>
        <p className="screen-subtitle">Tap a region to log pain or view injuries</p>
      </header>

      {/* Body visualization */}
      <div className="card" style={{ padding: '2rem' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'block' }}>
          {/* Simple body outline */}
          <ellipse cx="50" cy="7" rx="8" ry="7" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="40" y="14" width="20" height="30" rx="3" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="22" y="16" width="8" height="25" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="70" y="16" width="8" height="25" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="35" y="44" width="12" height="35" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="53" y="44" width="12" height="35" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="35" y="79" width="12" height="18" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />
          <rect x="53" y="79" width="12" height="18" rx="2" fill="var(--bg-tertiary)" stroke="var(--border)" strokeWidth="0.5" />

          {/* Injury markers */}
          {mockInjuries.map(injury => {
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
                onClick={() => {
                  setSelectedRegion(injury.region);
                }}
              />
            );
          })}

          {/* Tap targets */}
          {bodyRegions.map(region => (
            <circle
              key={region.id}
              cx={region.x}
              cy={region.y}
              r="6"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedRegion(region.id);
                setShowLogModal(true);
              }}
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
        <h3 className="section-title">Active Issues ({mockInjuries.length})</h3>
        {mockInjuries.map(injury => {
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
        })}
      </div>

      {/* Log pain modal */}
      {showLogModal && selectedRegion && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowLogModal(false)}>
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: '16px 16px 0 0',
              padding: '1.5rem',
              width: '100%',
              maxWidth: 430,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
              Log Pain - {bodyRegions.find(r => r.id === selectedRegion)?.label}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: '0.5rem' }}>Severity</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['mild', 'moderate', 'severe'] as Severity[]).map(severity => (
                  <button
                    key={severity}
                    className={`btn ${painSeverity === severity ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                    onClick={() => setPainSeverity(severity)}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="input"
              placeholder="Describe the pain (optional)"
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
