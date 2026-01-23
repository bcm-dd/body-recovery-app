'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReadinessRing } from './components/ReadinessRing';
import { LoadingSpinner, Skeleton } from './components/LoadingSpinner';

// Mock data - would come from API in production
const mockReadiness = {
  score: 78,
  factors: {
    sleep: 85,
    recovery: 72,
    load: 80,
    body: 75,
  },
  recommendation: 'full' as const,
};

const mockWorkout = {
  id: 'workout-1',
  name: 'Upper Body Strength',
  duration: 45,
  exercises: 6,
  focus: 'Chest, Shoulders, Triceps',
};

export default function TodayPage() {
  const [greeting, setGreeting] = useState('Good morning');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [readinessData, setReadinessData] = useState<typeof mockReadiness | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    setDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }));

    // Simulate API call for readiness data
    const loadReadinessData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReadinessData(mockReadiness);
      setIsLoading(false);
    };

    loadReadinessData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="screen-header">
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{date}</p>
        <h1 className="screen-title">{greeting}</h1>
      </header>

      {/* Readiness Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Readiness</h2>
          {isLoading ? (
            <Skeleton width={100} height={24} borderRadius="var(--radius-full)" />
          ) : readinessData ? (
            <span className={`badge ${getReadinessBadge(readinessData.recommendation)}`}>
              {getReadinessLabel(readinessData.recommendation)}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          {isLoading ? (
            <LoadingSpinner size="large" label="Calculating readiness..." />
          ) : readinessData ? (
            <ReadinessRing
              score={readinessData.score}
              factors={readinessData.factors}
              size={200}
            />
          ) : null}
        </div>
        <p className="text-secondary text-center" style={{ marginTop: '0.5rem' }}>
          {isLoading ? (
            <Skeleton width="80%" height={16} style={{ margin: '0 auto' }} />
          ) : readinessData ? (
            getReadinessMessage(readinessData.recommendation)
          ) : null}
        </p>
      </div>

      {/* Today's Workout */}
      <div className="section">
        <h3 className="section-title">Today's Plan</h3>
        <Link href="/workout" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ margin: 0, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                💪
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {mockWorkout.name}
                </h4>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {mockWorkout.duration} min • {mockWorkout.exercises} exercises
                </p>
              </div>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-tertiary)' }}>→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h3 className="section-title">Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Link href="/body" style={{ textDecoration: 'none' }}>
            <QuickAction icon="🫀" label="Log Pain" color="#EF4444" />
          </Link>
          <Link href="/chat" style={{ textDecoration: 'none' }}>
            <QuickAction icon="💬" label="Ask Coach" color="#3B82F6" />
          </Link>
          <Link href="/workout" style={{ textDecoration: 'none' }}>
            <QuickAction icon="🔄" label="Change Plan" color="#8B5CF6" />
          </Link>
          <Link href="/profile" style={{ textDecoration: 'none' }}>
            <QuickAction icon="📊" label="Progress" color="#10B981" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="section" aria-labelledby="this-week-title">
        <h3 id="this-week-title" className="section-title">This Week</h3>
        <div className="card" style={{ margin: 0 }}>
          <div
            role="group"
            aria-label="Weekly workout progress"
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}
          >
            {[
              { day: 'Monday', abbr: 'M', status: 'completed' },
              { day: 'Tuesday', abbr: 'T', status: 'completed' },
              { day: 'Wednesday', abbr: 'W', status: 'completed' },
              { day: 'Thursday', abbr: 'T', status: 'completed' },
              { day: 'Friday', abbr: 'F', status: 'scheduled' },
              { day: 'Saturday', abbr: 'S', status: 'none' },
              { day: 'Sunday', abbr: 'S', status: 'none' },
            ].map((dayInfo) => (
              <div
                key={dayInfo.day}
                style={{ textAlign: 'center' }}
                role="listitem"
                aria-label={`${dayInfo.day}: ${dayInfo.status === 'completed' ? 'Workout completed' : dayInfo.status === 'scheduled' ? 'Workout scheduled' : 'No workout'}`}
              >
                <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }} aria-hidden="true">
                  {dayInfo.abbr}
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: dayInfo.status === 'completed' ? 'var(--success)' : dayInfo.status === 'scheduled' ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dayInfo.status !== 'none' ? 'white' : 'var(--text-tertiary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {dayInfo.status === 'completed' ? '\u2713' : dayInfo.status === 'scheduled' ? '!' : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="text-secondary text-center" style={{ fontSize: '0.875rem' }}>
            4 workouts completed, 1 scheduled today
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: 12,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      className="quick-action"
    >
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
        }}
      >
        {icon}
      </div>
      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</span>
    </div>
  );
}

function getReadinessBadge(rec: string) {
  switch (rec) {
    case 'full': return 'badge-success';
    case 'moderate': return 'badge-warning';
    default: return 'badge-error';
  }
}

function getReadinessLabel(rec: string) {
  switch (rec) {
    case 'full': return 'Ready to Train';
    case 'moderate': return 'Moderate Day';
    case 'light': return 'Take It Easy';
    default: return 'Rest Day';
  }
}

function getReadinessMessage(rec: string) {
  switch (rec) {
    case 'full': return 'Your body is well-recovered. Full intensity recommended.';
    case 'moderate': return 'Good to train, but listen to your body.';
    case 'light': return 'Consider lighter weights or mobility work today.';
    default: return 'Your body needs rest. Take the day off.';
  }
}
