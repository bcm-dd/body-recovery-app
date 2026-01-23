'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner, LoadingListItem, StatCardSkeleton } from '../components/LoadingSpinner';

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

type Stats = typeof mockStats;
type WeeklyProgress = typeof mockWeeklyProgress;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'progress' | 'settings'>('progress');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);

  // Simulate loading stats data
  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
      setWeeklyProgress(mockWeeklyProgress);
      setIsLoadingStats(false);
    };
    loadStats();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Get user info from session or use defaults
  const userName = session?.user?.name || 'Guest User';
  const userEmail = session?.user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const isGuest = !session || (session.user as { isGuest?: boolean })?.isGuest;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="animate-fade-in">
        <header className="screen-header">
          <h1 className="screen-title">Profile</h1>
        </header>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="skeleton" style={{ width: 200, height: 200, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

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
          {userInitials}
        </div>
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{userName}</h2>
          <p className="text-secondary">
            {isGuest ? 'Guest Mode' : userEmail || 'Training for 3 months'}
          </p>
          {isGuest && (
            <p className="text-tertiary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Sign up to save your progress
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Profile sections"
        style={{
          display: 'flex',
          margin: '0 1.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {(['progress', 'settings'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`tabpanel-${tab}`}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setActiveTab(activeTab === 'progress' ? 'settings' : 'progress');
              }
            }}
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

      <div
        role="tabpanel"
        id="tabpanel-progress"
        aria-labelledby="tab-progress"
        hidden={activeTab !== 'progress'}
      >
        {activeTab === 'progress' && (
          <>
            {/* Stats grid */}
          <div className="section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {isLoadingStats ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : stats ? (
                <>
                  <StatCard label="This Month" value={stats.workoutsThisMonth} icon="📅" />
                  <StatCard label="Total Workouts" value={stats.totalWorkouts} icon="💪" />
                  <StatCard label="Current Streak" value={`${stats.currentStreak} days`} icon="🔥" />
                  <StatCard label="Avg Readiness" value={stats.avgReadiness} icon="📊" />
                </>
              ) : null}
            </div>
          </div>

          {/* Weekly chart */}
          <div className="section">
            <h3 className="section-title">This Week</h3>
            <div className="card" style={{ margin: 0 }}>
              {isLoadingStats ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                  <LoadingSpinner size="medium" label="Loading progress..." />
                </div>
              ) : weeklyProgress ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', height: 120 }}>
                  {weeklyProgress.map((day) => (
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
                          transition: 'height 0.5s ease-out',
                        }} />
                      </div>
                      <div className="text-tertiary" style={{ fontSize: '0.625rem', marginTop: '0.5rem' }}>
                        {day.day}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Personal bests */}
          <div className="section">
            <h3 className="section-title">Personal Bests</h3>
            {isLoadingStats ? (
              <>
                <LoadingListItem />
                <LoadingListItem />
                <LoadingListItem />
              </>
            ) : (
              <>
                <div className="list-item">
                  <span style={{ fontSize: '1.5rem' }}>🏋️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>Bench Press</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>185 lbs x 5</div>
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>2 weeks ago</span>
                </div>
                <div className="list-item">
                  <span style={{ fontSize: '1.5rem' }}>🦵</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>Squat</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>225 lbs x 5</div>
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>1 week ago</span>
                </div>
                <div className="list-item">
                  <span style={{ fontSize: '1.5rem' }}>💪</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>Deadlift</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>275 lbs x 3</div>
                  </div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>3 days ago</span>
                </div>
              </>
            )}
          </div>
          </>
        )}
      </div>

      <div
        role="tabpanel"
        id="tabpanel-settings"
        aria-labelledby="tab-settings"
        hidden={activeTab !== 'settings'}
      >
        {activeTab === 'settings' && (
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
            <button
              className="btn btn-secondary btn-full"
              style={{ color: 'var(--error)', opacity: isSigningOut ? 0.7 : 1 }}
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
            >
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
          </>
        )}
      </div>
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
    <button
      type="button"
      className="list-item"
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'var(--bg-primary)',
        border: '1px solid transparent',
      }}
      aria-label={badge ? `${label}: ${badge}` : label}
    >
      <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{icon}</span>
      <div style={{ flex: 1, fontWeight: 500 }}>{label}</div>
      {badge && <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{badge}</span>}
      <span style={{ color: 'var(--text-tertiary)' }} aria-hidden="true">\u2192</span>
    </button>
  );
}
