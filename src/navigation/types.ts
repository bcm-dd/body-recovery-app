/**
 * Navigation Types - Movement & Recovery Companion
 *
 * Type definitions for React Navigation.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ============================================================================
// Root Stack
// ============================================================================

export type RootStackParamList = {
  // Main app tabs
  Main: NavigatorScreenParams<MainTabParamList>;

  // Onboarding flow
  Onboarding: undefined;
  OnboardingWelcome: undefined;
  OnboardingHealthPermission: undefined;
  OnboardingFocus: undefined;
  OnboardingInjury: undefined;
  OnboardingExperience: undefined;
  OnboardingFirstSession: undefined;

  // Auth
  Login: undefined;
  Register: undefined;

  // Workout flow (modal)
  WorkoutExecution: { workoutId: string };
  ExerciseDetail: { exerciseId: string };
  ExerciseSwap: { exerciseLogId: string };

  // Body flow (modal)
  InjuryDetail: { injuryId: string };
  InjuryAdd: { bodyRegion?: string };
  PainLog: { workoutId?: string; exerciseLogId?: string; bodyRegion?: string };
  DocumentUpload: undefined;
  DocumentDetail: { documentId: string };

  // Settings
  Settings: undefined;
  NotificationSettings: undefined;
  TrainingPreferences: undefined;
  EquipmentSettings: undefined;
  PrivacySettings: undefined;
  AccountSettings: undefined;

  // AI Chat
  Chat: { workoutId?: string; exerciseLogId?: string } | undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// ============================================================================
// Main Tab Navigator
// ============================================================================

export type MainTabParamList = {
  Today: undefined;
  Plan: undefined;
  Body: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// ============================================================================
// Today Stack
// ============================================================================

export type TodayStackParamList = {
  TodayHome: undefined;
  WorkoutPreview: { workoutId: string };
  MobilitySession: { sessionId: string };
};

// ============================================================================
// Plan Stack
// ============================================================================

export type PlanStackParamList = {
  PlanHome: undefined;
  DayDetail: { date: string };
  EditSession: { sessionId: string };
};

// ============================================================================
// Body Stack
// ============================================================================

export type BodyStackParamList = {
  BodyHome: undefined;
  InjuryList: undefined;
  DocumentVault: undefined;
};

// ============================================================================
// Progress Stack
// ============================================================================

export type ProgressStackParamList = {
  ProgressHome: undefined;
  ExerciseHistory: { exerciseId: string };
  InsightDetail: { insightId: string };
  MilestoneList: undefined;
};

// ============================================================================
// Profile Stack
// ============================================================================

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

// ============================================================================
// Declaration for global type augmentation
// ============================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
