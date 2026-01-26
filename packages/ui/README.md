# @app/ui

Shared UI components for the Body Recovery Companion App. Built with Tamagui for cross-platform support.

## Purpose

This package provides reusable UI components that work across React Native and web:

- **Primitives**: Core building blocks (Button, Card, Text, Input, Sheet)
- **Components**: Complex UI elements (BodyMap, ExerciseCard, ReadinessRing, ChartCard)
- **Theme**: Design tokens, color schemes, and Tamagui configuration
- **Hooks**: Shared UI logic (useTheme, useReducedMotion)

## Installation

This package is part of the monorepo and is installed automatically. To use it in another package:

```json
{
  "dependencies": {
    "@app/ui": "workspace:*"
  }
}
```

## Usage

### Setup Theme Provider

```tsx
import { TamaguiProvider } from '@app/ui';
import { config } from '@app/ui/theme';

function App() {
  return (
    <TamaguiProvider config={config}>
      <YourApp />
    </TamaguiProvider>
  );
}
```

### Use Primitive Components

```tsx
import { Button, Card, Text, Input, Sheet } from '@app/ui';

function MyScreen() {
  return (
    <Card>
      <Text variant="heading">Welcome</Text>
      <Text variant="body">Enter your details below</Text>

      <Input
        placeholder="Your name"
        onChangeText={setName}
      />

      <Button
        variant="primary"
        size="lg"
        onPress={handleSubmit}
      >
        Get Started
      </Button>
    </Card>
  );
}
```

### Use Complex Components

```tsx
import { BodyMap, ExerciseCard, ReadinessRing, Toast } from '@app/ui';

// Interactive body map
<BodyMap
  regions={bodyRegions}
  onRegionPress={handleRegionPress}
  highlightedRegions={['lower_back', 'hip_left']}
/>

// Exercise card with set logging
<ExerciseCard
  exercise={exercise}
  prescription={prescription}
  onComplete={handleComplete}
  onSwap={handleSwap}
/>

// Readiness visualization
<ReadinessRing
  score={85}
  factors={readinessFactors}
/>

// Toast notifications
<Toast
  message="Workout complete!"
  type="success"
  visible={showToast}
/>
```

### Use Theme and Hooks

```tsx
import { useTheme, useReducedMotion } from '@app/ui';
import { tokens } from '@app/ui/theme';

function ThemedComponent() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <View
      style={{
        backgroundColor: theme.background,
        // Skip animations if user prefers reduced motion
        transition: reducedMotion ? 'none' : 'all 0.3s',
      }}
    >
      <Text>Using {theme.name} theme</Text>
    </View>
  );
}
```

### Use Tamagui Utilities

```tsx
import { styled, Stack, XStack, YStack, Theme } from '@app/ui';

// Create styled components
const CustomCard = styled(Card, {
  padding: '$4',
  borderRadius: '$lg',
  variants: {
    highlighted: {
      true: {
        borderColor: '$primary',
        borderWidth: 2,
      },
    },
  },
});

// Use layout components
function Layout() {
  return (
    <YStack flex={1} padding="$4" gap="$3">
      <XStack justifyContent="space-between">
        <Text>Left</Text>
        <Text>Right</Text>
      </XStack>
    </YStack>
  );
}
```

## API Reference

### Primitives

| Component | Description |
|-----------|-------------|
| `Button` | Pressable button with variants and sizes |
| `Card` | Container with elevation and padding |
| `Text` | Typography with semantic variants |
| `Input` | Text input with validation states |
| `Sheet` | Bottom sheet / modal component |

### Components

| Component | Description |
|-----------|-------------|
| `BodyMap` | Interactive SVG body diagram |
| `BodyRegion` | Individual body region touchable |
| `ExerciseCard` | Exercise display with set logging |
| `SetLogger` | Reps/weight input for sets |
| `ReadinessRing` | Circular readiness score display |
| `ChartCard` | Data visualization card |
| `Toast` | Notification toasts |
| `Banner` | Info/warning banners |

### Theme

| Export | Description |
|--------|-------------|
| `config` | Tamagui configuration |
| `tokens` | Design tokens (colors, spacing, etc.) |
| `lightTheme` | Light mode theme values |
| `darkTheme` | Dark mode theme values |

### Hooks

| Hook | Description |
|------|-------------|
| `useTheme` | Access current theme values |
| `useReducedMotion` | Check reduced motion preference |

## Design Tokens

```typescript
import { tokens } from '@app/ui/theme';

// Spacing scale
tokens.space.$1  // 4px
tokens.space.$2  // 8px
tokens.space.$4  // 16px

// Border radius
tokens.radii.$sm  // 4px
tokens.radii.$md  // 8px
tokens.radii.$lg  // 16px

// Colors (theme-aware)
tokens.colors.primary
tokens.colors.background
tokens.colors.text
tokens.colors.success
tokens.colors.warning
tokens.colors.error
```

## Package Structure

```
src/
  index.ts              # Main entry point
  theme/
    index.ts            # Theme exports
    config.ts           # Tamagui configuration
    tokens.ts           # Design tokens
  primitives/
    index.ts            # Primitive exports
    Button.tsx
    Card.tsx
    Text.tsx
    Input.tsx
    Sheet.tsx
  components/
    index.ts            # Component exports
    BodyMap/
      BodyMap.tsx
      BodyRegion.tsx
    ExerciseCard/
      ExerciseCard.tsx
      SetLogger.tsx
    ReadinessRing/
    ChartCard/
    Toast.tsx
    Banner.tsx
  hooks/
    index.ts            # Hook exports
    useTheme.ts
    useReducedMotion.ts
```

## Accessibility

All components are built with accessibility in mind:

- Proper semantic roles and labels
- Keyboard navigation support
- Screen reader announcements
- Respects reduced motion preferences
- Sufficient color contrast ratios

## Testing

Components can be tested with React Testing Library:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@app/ui';

test('Button calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Button onPress={onPress}>Click me</Button>
  );

  fireEvent.press(getByText('Click me'));
  expect(onPress).toHaveBeenCalled();
});
```
