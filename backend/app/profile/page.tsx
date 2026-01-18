'use client';

import { useState } from 'react';

const mockStats = {
  workoutsThisMonth: 12,
  totalWorkouts: 87,
  currentStreak: 4,
  longestStreak: 14,
  avgReadiness: 72,
  injuriesTracked: 3,
};

const mockWeeklyProgress = [
  { day: 'Mon', completed: true, readiness: 82 },
  { day: 'Tue', completed: true, readiness: 78 },
  { day: 'Wed', completed: false, readiness: 65 },
  { day: 'Thu', completed: true, readiness: 75 },
  { day: 'Fri', completed: true, readiness: 80 },
  { day: 'Sat', completed: false, readiness: 70 },
  { day: 'Sun', completed: false, readiness: 85 },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'progress' | 'settings'>('progress');

  return (
    <div className="animate-fade-in">
      <header className="screen-header">
        <h1 className="screen-title">Profile</h1>
      </header>

      {/* User info */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'white',
          fontWeight: 700,
        }}>
          JD
        </div>
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>John Doe</h2>
          <p className="text-secondary">Training for 3 months</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        margin: '0 1.5rem',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {(['progress', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'progress' ? (
        <>
          {/* Stats grid */}
          <div className="section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <StatCard label="This Month" value={mockStats.workoutsThisMonth} icon="📅" />
              <StatCard label="Total Workouts" value={mockStats.totalWorkouts} icon="💪" />
              <StatCard label="Current Streak" value={`${mockStats.currentStreak} days`} icon="🔥" />
              <StatCard label="Avg Readiness" value={mockStats.avgReadiness} icon="📊" />
            </div>
          </div>

          {/* Weekly chart */}
          <div className="section">
            <h3 className="section-title">This Week</h3>
            <div className="card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', height: 120 }}>
                {mockWeeklyProgress.map((day, i) => (
                  <div key={day.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      flex: 1,
                      width: '60%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}>
                      <div style={{
                        height: `${day.readiness}%`,
                        background: day.completed
                          ? 'var(--brand-primary)'
                          : 'var(--bg-tertiary)',
                        borderRadius: 4,
                        minHeight: 8,
                      }} />
                    </div>
                    <div className="text-tertiary" style={{ fontSize: '0.625rem', marginTop: '0.5rem' }}>
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personal bests */}
          <div className="section">
            <h3 className="section-title">Personal Bests</h3>
            <div className="list-item">
              <span style={{ fontSize: '1.5rem' }}>🏋️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Bench Press</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>185 lbs × 5</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>2 weeks ago</span>
            </div>
            <div className="list-item">
              <span style={{ fontSize: '1.5rem' }}>🦵</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Squat</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>225 lbs × 5</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>1 week ago</span>
            </div>
            <div className="list-item">
              <span style={{ fontSize: '1.5rem' }}>💪</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Deadlift</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>275 lbs × 3</div>
              </div>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>3 days ago</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Settings */}
          <div className="section">
            <h3 className="section-title">Account</h3>
            <SettingsItem icon="👤" label="Edit Profile" />
            <SettingsItem icon="🔔" label="Notifications" />
            <SettingsItem icon="🏥" label="Health Connections" badge="2 connected" />
          </div>

          <div className="section">
            <h3 className="section-title">Preferences</h3>
            <SettingsItem icon="🏠" label="Home Gym Equipment" />
            <SettingsItem icon="⏰" label="Workout Reminders" />
            <SettingsItem icon="📏" label="Units" badge="Imperial" />
            <SettingsItem icon="🌙" label="Dark Mode" badge="Auto" />
          </div>

          <div className="section">
            <h3 className="section-title">Support</h3>
            <SettingsItem icon="❓" label="Help & FAQ" />
            <SettingsItem icon="💬" label="Contact Support" />
            <SettingsItem icon="📜" label="Privacy Policy" />
          </div>

          <div className="section">
            <button className="btn btn-secondary btn-full" style={{ color: 'var(--error)' }}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: 12,
      padding: '1rem',
    }}>
      <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{label}</div>
    </div>
  );
}

function SettingsItem({ icon, label, badge }: { icon: string; label: string; badge?: string }) {
  return (
    <div className="list-item">
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <div style={{ flex: 1, fontWeight: 500 }}>{label}</div>
      {badge && <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{badge}</span>}
      <span style={{ color: 'var(--text-tertiary)' }}>→</span>
    </div>
  );
}
