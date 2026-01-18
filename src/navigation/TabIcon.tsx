/**
 * Tab Icon Component - Movement & Recovery Companion
 *
 * Simple SVG-based icons for tab navigation.
 * In production, would use react-native-vector-icons or custom SVGs.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// ============================================================================
// Types
// ============================================================================

export type TabIconName = 'today' | 'calendar' | 'body' | 'chart' | 'person';

interface TabIconProps {
  name: TabIconName;
  color: string;
  focused: boolean;
  size?: number;
}

// ============================================================================
// Component
// ============================================================================

export function TabIcon({ name, color, focused, size = 24 }: TabIconProps) {
  const strokeWidth = focused ? 2 : 1.5;

  const renderIcon = () => {
    switch (name) {
      case 'today':
        // Home/sun icon
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="12"
              r="5"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={focused ? color : 'none'}
            />
            <Line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth={strokeWidth} />
          </Svg>
        );

      case 'calendar':
        // Calendar icon
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={focused ? `${color}30` : 'none'}
            />
            <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} />
            <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} />
            {focused && (
              <>
                <Circle cx="8" cy="15" r="1" fill={color} />
                <Circle cx="12" cy="15" r="1" fill={color} />
              </>
            )}
          </Svg>
        );

      case 'body':
        // Body/figure icon
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="5"
              r="3"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={focused ? color : 'none'}
            />
            <Path
              d="M12 10L12 16"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M12 16L8 22"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M12 16L16 22"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M8 12L12 10L16 12"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          </Svg>
        );

      case 'chart':
        // Chart/progress icon
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 3V21H21"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            <Path
              d="M7 14L11 10L15 14L21 8"
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {focused && (
              <>
                <Circle cx="7" cy="14" r="2" fill={color} />
                <Circle cx="11" cy="10" r="2" fill={color} />
                <Circle cx="15" cy="14" r="2" fill={color} />
                <Circle cx="21" cy="8" r="2" fill={color} />
              </>
            )}
          </Svg>
        );

      case 'person':
        // Person/profile icon
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="12"
              cy="8"
              r="4"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={focused ? color : 'none'}
            />
            <Path
              d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={focused ? `${color}30` : 'none'}
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderIcon()}</View>;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
