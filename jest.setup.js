/**
 * Jest Setup - Movement & Recovery Companion
 *
 * Global mocks and setup for React Native testing.
 */

// =============================================================================
// Mock react-native-reanimated
// =============================================================================
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock does not handle useSharedValue properly, so we override it
  Reanimated.default.call = () => {};

  return Reanimated;
});

// =============================================================================
// Mock react-native-haptic-feedback
// =============================================================================
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    selection: 'selection',
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },
}));

// =============================================================================
// Mock react-native-mmkv
// =============================================================================
const mockMmkvStorage = new Map();

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key) => mockMmkvStorage.get(key)),
    set: jest.fn((key, value) => mockMmkvStorage.set(key, value)),
    delete: jest.fn((key) => mockMmkvStorage.delete(key)),
    contains: jest.fn((key) => mockMmkvStorage.has(key)),
    getAllKeys: jest.fn(() => Array.from(mockMmkvStorage.keys())),
    clearAll: jest.fn(() => mockMmkvStorage.clear()),
  })),
}));

// =============================================================================
// Mock react-native-gesture-handler
// =============================================================================
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
    GestureDetector: View,
    Gesture: {
      Tap: jest.fn(() => ({})),
      Pan: jest.fn(() => ({})),
      Pinch: jest.fn(() => ({})),
      Rotation: jest.fn(() => ({})),
      Fling: jest.fn(() => ({})),
      LongPress: jest.fn(() => ({})),
      ForceTouch: jest.fn(() => ({})),
      Native: jest.fn(() => ({})),
      Manual: jest.fn(() => ({})),
      Race: jest.fn(() => ({})),
      Simultaneous: jest.fn(() => ({})),
      Exclusive: jest.fn(() => ({})),
    },
  };
});

// =============================================================================
// Mock react-native-health
// =============================================================================
jest.mock('react-native-health', () => ({
  default: {
    isAvailable: jest.fn((callback) => callback(null, true)),
    initHealthKit: jest.fn((permissions, callback) => callback(null)),
    getStepCount: jest.fn((options, callback) => callback(null, { value: 8000 })),
    getSleepSamples: jest.fn((options, callback) => callback(null, [])),
    getHeartRateVariabilitySamples: jest.fn((options, callback) => callback(null, [])),
    getRestingHeartRateSamples: jest.fn((options, callback) => callback(null, [])),
  },
  HealthKitPermissions: {
    Steps: 'Steps',
    SleepAnalysis: 'SleepAnalysis',
    HeartRateVariability: 'HeartRateVariability',
    RestingHeartRate: 'RestingHeartRate',
  },
}));

// =============================================================================
// Mock react-native-health-connect
// =============================================================================
jest.mock('react-native-health-connect', () => ({
  initialize: jest.fn(() => Promise.resolve(true)),
  requestPermission: jest.fn(() => Promise.resolve(true)),
  readRecords: jest.fn(() => Promise.resolve({ records: [] })),
  getSdkStatus: jest.fn(() => Promise.resolve(3)), // SDK_AVAILABLE
}));

// =============================================================================
// Mock @react-native-community/netinfo
// =============================================================================
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
}));

// =============================================================================
// Mock react-native-safe-area-context
// =============================================================================
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
  };
});

// =============================================================================
// Mock react-native-screens
// =============================================================================
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => true),
  Screen: 'Screen',
  ScreenContainer: 'ScreenContainer',
  NativeScreen: 'NativeScreen',
  NativeScreenContainer: 'NativeScreenContainer',
}));

// =============================================================================
// Mock @react-navigation
// =============================================================================
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// =============================================================================
// Mock AsyncStorage (fallback for Zustand persist)
// =============================================================================
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// =============================================================================
// Silence Warnings
// =============================================================================
global.console.warn = jest.fn();
global.console.error = jest.fn();

// =============================================================================
// Reset Zustand Stores Between Tests
// =============================================================================
const { act } = require('@testing-library/react-native');

beforeEach(() => {
  // Clear MMKV storage mock
  mockMmkvStorage.clear();
});

// =============================================================================
// Mock timers helpers
// =============================================================================
global.flushPromises = () => new Promise((resolve) => setImmediate(resolve));

// =============================================================================
// Date Mock Helper
// =============================================================================
const RealDate = Date;

global.mockDate = (isoDate) => {
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        return new RealDate(isoDate);
      }
      return new RealDate(...args);
    }

    static now() {
      return new RealDate(isoDate).getTime();
    }
  };
};

global.restoreDate = () => {
  global.Date = RealDate;
};

afterEach(() => {
  global.restoreDate();
});
