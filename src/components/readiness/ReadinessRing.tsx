/**
 * Readiness Ring Component - Movement & Recovery Companion
 *
 * Circular visualization showing overall readiness score
 * with animated segments for each factor.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
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
// Constants
// ============================================================================

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const { colors, components, animation } = theme;

  // Get size values from theme
  const ringSize = components.readinessRing.size[size];
  const strokeWidth = components.readinessRing.strokeWidth[size];
  const segmentGapDegrees = components.readinessRing.segmentGap;
  const ringAnimationDuration = animation.duration.ring;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = ringSize / 2;

  // Animation values
  const progressAnim = useSharedValue(0);
  const sleepAnim = useSharedValue(0);
  const recoveryAnim = useSharedValue(0);
  const loadAnim = useSharedValue(0);
  const bodyAnim = useSharedValue(0);

  // Get recommendation color from theme
  const getScoreColor = () => {
    switch (recommendation) {
      case 'full':
        return colors.success;
      case 'moderate':
        return colors.warning;
      case 'light':
        return colors.bodyMapModerate; // Orange for light activity
      case 'rest':
        return colors.error;
      default:
        return colors.accent;
    }
  };

  // Animate on mount using theme animation duration
  useEffect(() => {
    const factorDuration = ringAnimationDuration * 0.75; // Factors animate slightly faster

    if (animated) {
      progressAnim.value = withDelay(
        100,
        withTiming(score / 100, {
          duration: ringAnimationDuration,
          easing: Easing.out(Easing.cubic),
        })
      );

      if (factors) {
        sleepAnim.value = withDelay(
          200,
          withTiming(factors.sleep / 100, { duration: factorDuration, easing: Easing.out(Easing.cubic) })
        );
        recoveryAnim.value = withDelay(
          300,
          withTiming(factors.recovery / 100, { duration: factorDuration, easing: Easing.out(Easing.cubic) })
        );
        loadAnim.value = withDelay(
          400,
          withTiming(factors.load / 100, { duration: factorDuration, easing: Easing.out(Easing.cubic) })
        );
        bodyAnim.value = withDelay(
          500,
          withTiming(factors.body / 100, { duration: factorDuration, easing: Easing.out(Easing.cubic) })
        );
      }
    } else {
      progressAnim.value = score / 100;
      if (factors) {
        sleepAnim.value = factors.sleep / 100;
        recoveryAnim.value = factors.recovery / 100;
        loadAnim.value = factors.load / 100;
        bodyAnim.value = factors.body / 100;
      }
    }
  }, [score, factors, animated, ringAnimationDuration]);

  // Animated props for main progress ring
  const mainRingProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressAnim.value);
    return {
      strokeDashoffset,
    };
  });

  // Factor segment calculations using theme values
  const totalGap = segmentGapDegrees * 4;
  const availableDegrees = 360 - totalGap;
  const segmentDegrees = availableDegrees / 4;

  // Inner ring for factors (smaller radius)
  const innerRadius = radius - strokeWidth - 4;
  const innerCircumference = innerRadius * 2 * Math.PI;
  const segmentLength = (segmentDegrees / 360) * innerCircumference;

  const getSegmentOffset = (index: number) => {
    const startAngle = -90 + index * (segmentDegrees + segmentGapDegrees);
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
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={mainRingProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
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
          {score}
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
