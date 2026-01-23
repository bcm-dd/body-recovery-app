/**
 * Readiness Ring Component (Web) - Movement & Recovery Companion
 *
 * Web-specific version without react-native-reanimated.
 * Uses CSS transitions for animations.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui';
import type { ReadinessRecommendation } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ReadinessRingProps {
  score: number;
  factors?: {
    sleep: number;
    recovery: number;
    load: number;
    body: number;
  };
  recommendation: ReadinessRecommendation;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  accessibilityLabel?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ReadinessRing({
  score,
  factors,
  recommendation,
  size = 'md',
  animated = true,
  accessibilityLabel,
}: ReadinessRingProps) {
  const { theme } = useTheme();
  const { colors, components } = theme;
  const [displayedScore, setDisplayedScore] = useState(animated ? 0 : score);

  // Get size values
  const ringSize = components.readinessRing.size[size];
  const strokeWidth = components.readinessRing.strokeWidth[size];
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = ringSize / 2;

  // Get recommendation color
  const getScoreColor = () => {
    switch (recommendation) {
      case 'full':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'light':
        return '#F97316'; // Orange
      case 'rest':
        return colors.error;
      default:
        return colors.accent;
    }
  };

  // Animate score on mount
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    }
    setDisplayedScore(score);
    return undefined;
  }, [score, animated]);

  // Calculate stroke dash offset
  const strokeDashoffset = circumference * (1 - displayedScore / 100);

  // Factor segment calculations
  const innerRadius = radius - strokeWidth - 4;
  const innerCircumference = innerRadius * 2 * Math.PI;
  const segmentGap = 8; // degrees
  const totalGap = segmentGap * 4;
  const availableDegrees = 360 - totalGap;
  const segmentDegrees = availableDegrees / 4;
  const segmentLength = (segmentDegrees / 360) * innerCircumference;

  const getSegmentOffset = (index: number) => {
    const startAngle = -90 + index * (segmentDegrees + segmentGap);
    return (startAngle / 360) * innerCircumference;
  };

  // Build accessibility description
  const recommendationText = {
    full: 'full workout',
    moderate: 'moderate workout',
    light: 'light activity',
    rest: 'rest day',
  }[recommendation];

  const defaultAccessibilityLabel = `Readiness score: ${score} out of 100. Recommendation: ${recommendationText}.${
    factors
      ? ` Sleep: ${factors.sleep}%, Recovery: ${factors.recovery}%, Load: ${factors.load}%, Body: ${factors.body}%.`
      : ''
  }`;

  return (
    <View
      style={[styles.container, { width: ringSize, height: ringSize }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: score }}
    >
      <Svg width={ringSize} height={ringSize}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={getScoreColor()} stopOpacity={1} />
            <Stop offset="100%" stopColor={getScoreColor()} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>

        {/* Background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.readinessBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Main progress ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
          // @ts-ignore - web style
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />

        {/* Factor segments (inner ring) */}
        {factors && (
          <G>
            {/* Sleep segment */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              stroke={colors.readinessSleep}
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={`${segmentLength * (factors.sleep / 100)} ${innerCircumference}`}
              strokeDashoffset={-getSegmentOffset(0)}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Recovery segment */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              stroke={colors.readinessRecovery}
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={`${segmentLength * (factors.recovery / 100)} ${innerCircumference}`}
              strokeDashoffset={-getSegmentOffset(1)}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Load segment */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              stroke={colors.readinessLoad}
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={`${segmentLength * (factors.load / 100)} ${innerCircumference}`}
              strokeDashoffset={-getSegmentOffset(2)}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Body segment */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              stroke={colors.readinessBody}
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={`${segmentLength * (factors.body / 100)} ${innerCircumference}`}
              strokeDashoffset={-getSegmentOffset(3)}
              strokeLinecap="round"
              opacity={0.8}
            />
          </G>
        )}
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text variant="h1" style={{ color: getScoreColor() }}>
          {displayedScore}
        </Text>
        <Text variant="caption" color="secondary">
          readiness
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
