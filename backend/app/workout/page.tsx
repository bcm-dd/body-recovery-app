'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { WorkoutComplete } from '../components/WorkoutComplete';

const mockExercises = [
  { id: '1', name: 'Bench Press', sets: 4, reps: 8, weight: 135, completed: false },
  { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 50, completed: false },
  { id: '3', name: 'Shoulder Press', sets: 3, reps: 10, weight: 40, completed: false },
  { id: '4', name: 'Lateral Raises', sets: 3, reps: 12, weight: 15, completed: false },
  { id: '5', name: 'Tricep Pushdowns', sets: 3, reps: 12, weight: 40, completed: false },
  { id: '6', name: 'Overhead Tricep Extension', sets: 3, reps: 12, weight: 30, completed: false },
];

// Set to true to simulate no scheduled workout scenario
const SIMULATE_NO_WORKOUT = false;

export default function WorkoutPage() {
  const [exercises, setExercises] = useState(mockExercises);
  const [isStarted, setIsStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasScheduledWorkout, setHasScheduledWorkout] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = (completedCount / exercises.length) * 100;
  const allCompleted = completedCount === exercises.length && exercises.length > 0;
  const totalSets = exercises.reduce((sum, e) => sum + e.sets, 0);

  // Simulate loading workout data
  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setHasScheduledWorkout(!SIMULATE_NO_WORKOUT);
      setIsLoading(false);
    };
    loadWorkout();
  }, []);

  // Check if workout is complete
  useEffect(() => {
    if (allCompleted && isStarted && !showComplete) {
      // Small delay before showing completion screen
      const timer = setTimeout(() => {
        setShowComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, isStarted, showComplete]);

  const handleCompleteSet = () => {
    const exercise = exercises[currentExercise];
    if (currentSet >= exercise.sets) {
      // Move to next exercise
      setExercises(prev => prev.map((e, i) =>
        i === currentExercise ? { ...e, completed: true } : e
      ));
      if (currentExercise < exercises.length - 1) {
        setCurrentExercise(prev => prev + 1);
        setCurrentSet(1);
      }
    } else {
      setCurrentSet(prev => prev + 1);
    }
  };

  const handleStartWorkout = () => {
    setIsStarted(true);
    setWorkoutStartTime(new Date());
  };

  const getWorkoutDuration = () => {
    if (!workoutStartTime) return 0;
    return Math.round((new Date().getTime() - workoutStartTime.getTime()) / 60000);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size="large" label="Loading workout..." />
      </div>
    );
  }

  // Show empty state when no workout is scheduled
  if (!hasScheduledWorkout) {
    return (
      <div className="animate-fade-in">
        <header className="screen-header">
          <Link href="/" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Back
          </Link>
          <h1 className="screen-title">Workout</h1>
        </header>
        <EmptyState
          icon="📅"
          title="No Workout Scheduled"
          description="You don't have a workout planned for today. Take a rest day or browse our workout library."
          action={{
            label: 'Browse Workouts',
            onClick: () => setHasScheduledWorkout(true),
          }}
          secondaryAction={{
            label: 'Create Custom Workout',
            variant: 'ghost',
          }}
        />
      </div>
    );
  }

  // Show workout complete celebration
  if (showComplete) {
    return (
      <WorkoutComplete
        workoutName="Upper Body Strength"
        stats={{
          duration: getWorkoutDuration() || 45,
          exercisesCompleted: exercises.length,
          totalSets: totalSets,
          caloriesBurned: 320,
        }}
        onClose={() => setShowComplete(false)}
      />
    );
  }

  if (!isStarted) {
    return (
      <div className="animate-fade-in">
        <header className="screen-header">
          <Link href="/" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Back
          </Link>
          <h1 className="screen-title">Upper Body Strength</h1>
          <p className="screen-subtitle">45 min • 6 exercises</p>
        </header>

        <section className="section" aria-labelledby="exercises-title">
          <h3 id="exercises-title" className="section-title">Exercises</h3>
          <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {exercises.map((exercise, i) => (
              <li
                key={exercise.id}
                className="list-item"
                style={{ cursor: 'default' }}
                aria-label={`Exercise ${i + 1}: ${exercise.name}, ${exercise.sets} sets of ${exercise.reps} reps at ${exercise.weight} pounds`}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{exercise.name}</div>
                  <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {exercise.sets} x {exercise.reps} @ {exercise.weight} lbs
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div style={{ padding: '1rem 1.5rem', position: 'sticky', bottom: 80, background: 'var(--bg-primary)' }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleStartWorkout}>
            Start Workout
          </button>
        </div>
      </div>
    );
  }

  const exercise = exercises[currentExercise];

  return (
    <div className="animate-fade-in">
      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Workout progress: ${completedCount} of ${exercises.length} exercises completed`}
        style={{
          height: 4,
          background: 'var(--bg-tertiary)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--brand-primary)',
          transition: 'width 0.3s',
        }} />
      </div>

      <header className="screen-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-secondary">{currentExercise + 1} of {exercises.length}</span>
          <button
            className="btn btn-ghost"
            onClick={() => setIsStarted(false)}
            style={{ padding: '0.5rem' }}
          >
            End
          </button>
        </div>
        <h1 className="screen-title">{exercise.name}</h1>
      </header>

      {/* Current exercise */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏋️</div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.5rem',
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{exercise.weight}</div>
            <div className="text-secondary">lbs</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{exercise.reps}</div>
            <div className="text-secondary">reps</div>
          </div>
        </div>

        {/* Set indicators */}
        <div
          role="group"
          aria-label={`Set ${currentSet} of ${exercise.sets}`}
          style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          {Array.from({ length: exercise.sets }).map((_, i) => {
            const isCompleted = i < currentSet - 1;
            const isCurrent = i === currentSet - 1;
            return (
              <div
                key={i}
                role="listitem"
                aria-label={`Set ${i + 1}: ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isCurrent ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                {isCompleted ? '\u2713' : i + 1}
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={handleCompleteSet}>
          {currentSet >= exercise.sets ? 'Complete Exercise' : `Complete Set ${currentSet}`}
        </button>
      </div>

      {/* Quick actions */}
      <div className="section">
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/chat" style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn btn-secondary btn-full">
              💬 Ask Coach
            </button>
          </Link>
          <Link href="/body" style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn btn-secondary btn-full">
              🫀 Log Pain
            </button>
          </Link>
        </div>
      </div>

      {/* Up next */}
      {currentExercise < exercises.length - 1 && (
        <div className="section">
          <h3 className="section-title">Up Next</h3>
          <div className="list-item">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{exercises[currentExercise + 1].name}</div>
              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                {exercises[currentExercise + 1].sets} × {exercises[currentExercise + 1].reps}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
