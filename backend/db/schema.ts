/**
 * Database Schema - Movement & Recovery Companion
 *
 * Drizzle ORM schema for Vercel Postgres.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences),
  bodyModel: one(bodyModels),
  injuries: many(injuries),
  workouts: many(workouts),
  healthSnapshots: many(healthSnapshots),
  documents: many(documents),
  painLogs: many(painLogs),
}));

// ============================================================================
// User Preferences
// ============================================================================

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  notificationSettings: jsonb('notification_settings').default('{}'),
  trainingPreferences: jsonb('training_preferences').default('{}'),
  equipmentByLocation: jsonb('equipment_by_location').default('{}'),
  uiPreferences: jsonb('ui_preferences').default('{}'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Body Models
// ============================================================================

export const bodyModels = pgTable('body_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  data: jsonb('data').notNull(), // Full body model JSON
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// Injuries
// ============================================================================

export const injuries = pgTable('injuries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bodyRegion: varchar('body_region', { length: 50 }).notNull(),
  description: text('description'),
  severity: varchar('severity', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  constraints: jsonb('constraints').default('[]'),
  clinicalNotes: text('clinical_notes'),
  startDate: date('start_date').notNull(),
  resolvedDate: date('resolved_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userStatusIdx: index('idx_injuries_user_status').on(table.userId, table.status),
}));

export const injuriesRelations = relations(injuries, ({ one }) => ({
  user: one(users, {
    fields: [injuries.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Documents
// ============================================================================

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  filename: varchar('filename', { length: 255 }),
  blobUrl: text('blob_url').notNull(),
  extractedData: jsonb('extracted_data'),
  confirmed: boolean('confirmed').default(false),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Workouts
// ============================================================================

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('planned'),
  plannedDuration: integer('planned_duration'),
  actualDuration: integer('actual_duration'),
  readinessScore: integer('readiness_score'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('idx_workouts_user_date').on(table.userId, table.date),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exerciseLogs: many(exerciseLogs),
}));

// ============================================================================
// Exercise Logs
// ============================================================================

export const exerciseLogs = pgTable('exercise_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id').references(() => workouts.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: varchar('exercise_id', { length: 100 }).notNull(),
  orderIndex: integer('order_index').notNull(),
  prescribedWeight: decimal('prescribed_weight', { precision: 5, scale: 2 }),
  prescribedReps: integer('prescribed_reps'),
  prescribedSets: integer('prescribed_sets'),
  completedSets: jsonb('completed_sets').default('[]'),
  difficulty: varchar('difficulty', { length: 20 }),
  notes: text('notes'),
  skipped: boolean('skipped').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workoutIdx: index('idx_exercise_logs_workout').on(table.workoutId),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  workout: one(workouts, {
    fields: [exerciseLogs.workoutId],
    references: [workouts.id],
  }),
}));

// ============================================================================
// Pain Logs
// ============================================================================

export const painLogs = pgTable('pain_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  workoutId: uuid('workout_id').references(() => workouts.id, { onDelete: 'set null' }),
  exerciseLogId: uuid('exercise_log_id').references(() => exerciseLogs.id, { onDelete: 'set null' }),
  bodyRegion: varchar('body_region', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  painType: varchar('pain_type', { length: 50 }),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
}, (table) => ({
  userRegionIdx: index('idx_pain_logs_user_region').on(table.userId, table.bodyRegion),
}));

export const painLogsRelations = relations(painLogs, ({ one }) => ({
  user: one(users, {
    fields: [painLogs.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [painLogs.workoutId],
    references: [workouts.id],
  }),
}));

// ============================================================================
// Health Snapshots
// ============================================================================

export const healthSnapshots = pgTable('health_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  sleepDuration: decimal('sleep_duration', { precision: 4, scale: 2 }),
  sleepQuality: integer('sleep_quality'),
  hrv: decimal('hrv', { precision: 5, scale: 2 }),
  restingHr: integer('resting_hr'),
  steps: integer('steps'),
  activeCalories: integer('active_calories'),
  readinessScore: integer('readiness_score'),
  rawData: jsonb('raw_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userDateIdx: uniqueIndex('idx_health_user_date').on(table.userId, table.date),
}));

export const healthSnapshotsRelations = relations(healthSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [healthSnapshots.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Exercise Library (reference data)
// ============================================================================

export const exercises = pgTable('exercises', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  musclesPrimary: jsonb('muscles_primary').notNull(),
  musclesSecondary: jsonb('muscles_secondary').default('[]'),
  equipment: jsonb('equipment').default('[]'),
  movementPattern: varchar('movement_pattern', { length: 50 }),
  jointActions: jsonb('joint_actions').default('[]'),
  contraindications: jsonb('contraindications').default('[]'),
  substitutes: jsonb('substitutes').default('[]'),
  progressions: jsonb('progressions').default('[]'),
  videoUrl: text('video_url'),
  cues: text('cues'),
  commonMistakes: text('common_mistakes'),
});
