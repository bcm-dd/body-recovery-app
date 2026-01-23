'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface WorkoutStats {
  duration: number; // in minutes
  exercisesCompleted: number;
  totalSets: number;
  caloriesBurned?: number;
}

interface WorkoutCompleteProps {
  workoutName: string;
  stats: WorkoutStats;
  onClose?: () => void;
}

// Confetti particle component
function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const colors = [
      'var(--brand-primary)',
      'var(--brand-secondary)',
      'var(--brand-accent)',
      'var(--warning)',
      '#EC4899', // pink
    ];

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-piece"
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: -20,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.id % 3 === 0 ? '50%' : particle.id % 3 === 1 ? '2px' : 0,
            background: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function WorkoutComplete({ workoutName, stats, onClose }: WorkoutCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Hide confetti after animation completes
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Focus the done button when the dialog opens
  useEffect(() => {
    doneButtonRef.current?.focus();
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-complete-title"
      aria-describedby="workout-complete-description"
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-primary)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
      }}
    >
      {/* Confetti animation */}
      {showConfetti && <Confetti />}

      {/* Success checkmark with pulse animation */}
      <div
        aria-hidden="true"
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand-secondary) 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-xl)',
          animation: 'pulse-ring 1.5s ease-out',
          boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
        }}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: 'check-draw 0.5s ease-out 0.3s forwards',
            strokeDasharray: 50,
            strokeDashoffset: 50,
          }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Title */}
      <h1
        id="workout-complete-title"
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-sm)',
          textAlign: 'center',
        }}
      >
        Workout Complete!
      </h1>

      {/* Subtitle */}
      <p
        id="workout-complete-description"
        className="text-secondary"
        style={{
          fontSize: '1rem',
          marginBottom: 'var(--spacing-2xl)',
          textAlign: 'center',
        }}
      >
        Great job finishing {workoutName}
      </p>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--spacing-md)',
          width: '100%',
          maxWidth: 320,
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        <StatBox
          icon="⏱️"
          value={`${stats.duration} min`}
          label="Duration"
        />
        <StatBox
          icon="🏋️"
          value={String(stats.exercisesCompleted)}
          label="Exercises"
        />
        <StatBox
          icon="🔄"
          value={String(stats.totalSets)}
          label="Total Sets"
        />
        <StatBox
          icon="🔥"
          value={stats.caloriesBurned ? `${stats.caloriesBurned}` : '--'}
          label="Calories"
        />
      </div>

      {/* Motivational message */}
      <div
        style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
          width: '100%',
          maxWidth: 320,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>
          {getMotivationalEmoji(stats.exercisesCompleted)}
        </div>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
          {getMotivationalMessage(stats.exercisesCompleted)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button
            ref={doneButtonRef}
            className="btn btn-primary btn-full btn-lg"
            onClick={onClose}
            aria-label="Done, return to dashboard"
          >
            Done
          </button>
        </Link>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: 'var(--spacing-sm)' }}
            aria-label="View your workout progress"
          >
            View Progress
          </button>
        </Link>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div
      role="group"
      aria-label={`${label}: ${value}`}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-md)',
        textAlign: 'center',
        border: '1px solid var(--border-light)',
      }}
    >
      <div aria-hidden="true" style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)' }}>{icon}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-tertiary" style={{ fontSize: '0.75rem' }}>{label}</div>
    </div>
  );
}

function getMotivationalEmoji(exercisesCompleted: number): string {
  if (exercisesCompleted >= 8) return '🏆';
  if (exercisesCompleted >= 6) return '💪';
  if (exercisesCompleted >= 4) return '⭐';
  return '👏';
}

function getMotivationalMessage(_exercisesCompleted: number): string {
  const messages = [
    "Every workout counts. You're building habits that last!",
    "Consistency is key. You showed up and crushed it!",
    "Your future self will thank you for today's effort!",
    "Progress, not perfection. Great work today!",
    "Another step closer to your goals. Keep it up!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
