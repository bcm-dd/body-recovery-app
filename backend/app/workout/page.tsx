'use client';

import { useState } from 'react';
import Link from 'next/link';

const mockExercises = [
  { id: '1', name: 'Bench Press', sets: 4, reps: 8, weight: 135, completed: false },
  { id: '2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 50, completed: false },
  { id: '3', name: 'Shoulder Press', sets: 3, reps: 10, weight: 40, completed: false },
  { id: '4', name: 'Lateral Raises', sets: 3, reps: 12, weight: 15, completed: false },
  { id: '5', name: 'Tricep Pushdowns', sets: 3, reps: 12, weight: 40, completed: false },
  { id: '6', name: 'Overhead Tricep Extension', sets: 3, reps: 12, weight: 30, completed: false },
];

export default function WorkoutPage() {
  const [exercises, setExercises] = useState(mockExercises);
  const [isStarted, setIsStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = (completedCount / exercises.length) * 100;

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

        <div className="section">
          <h3 className="section-title">Exercises</h3>
          {exercises.map((exercise, i) => (
            <div key={exercise.id} className="list-item">
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{exercise.name}</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {exercise.sets} × {exercise.reps} @ {exercise.weight} lbs
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem 1.5rem', position: 'sticky', bottom: 80, background: 'var(--bg-primary)' }}>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setIsStarted(true)}>
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
      <div style={{
        height: 4,
        background: 'var(--bg-tertiary)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {Array.from({ length: exercise.sets }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: i < currentSet - 1 ? 'var(--success)' : i === currentSet - 1 ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: i < currentSet ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              {i < currentSet - 1 ? '✓' : i + 1}
            </div>
          ))}
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
