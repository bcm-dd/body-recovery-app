/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // OLED-optimized dark mode backgrounds
        void: '#000000',
        base: '#0A0A0B',
        surface: '#141416',
        elevated: '#1C1C1F',

        // Primary accent - iOS System Blue
        accent: {
          DEFAULT: '#0A84FF',
          hover: '#409CFF',
          muted: 'rgba(10, 132, 255, 0.12)',
        },

        // Semantic colors - iOS System Colors
        success: '#30D158',
        warning: '#FFD60A',
        error: '#FF453A',
        info: '#64D2FF',

        // Text hierarchy
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A6',
        'text-tertiary': '#636366',

        // Borders
        border: '#2A2A2E',

        // Readiness colors
        readiness: {
          sleep: '#BF5AF2',
          recovery: '#64D2FF',
          load: '#FF9F0A',
          body: '#30D158',
        },

        // Body map colors
        body: {
          severe: '#FF453A',
          moderate: '#FF9F0A',
          mild: '#FFD60A',
          good: '#30D158',
          neutral: '#636366',
        },
      },

      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },

      // iOS HIG Typography Scale
      fontSize: {
        'caption2': ['11px', { lineHeight: '13px', letterSpacing: '0' }],
        'caption1': ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '0' }],
        'subhead': ['15px', { lineHeight: '20px', letterSpacing: '0' }],
        'callout': ['16px', { lineHeight: '21px', letterSpacing: '0' }],
        'body': ['17px', { lineHeight: '22px', letterSpacing: '0' }],
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'title3': ['20px', { lineHeight: '25px', letterSpacing: '0' }],
        'title2': ['22px', { lineHeight: '28px', letterSpacing: '0' }],
        'title1': ['28px', { lineHeight: '34px', letterSpacing: '0' }],
        'hero': ['34px', { lineHeight: '41px', letterSpacing: '0' }],
      },

      // 4px base unit spacing
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },

      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },

      // Animation
      transitionDuration: {
        'instant': '0ms',
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '400ms',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ring-progress': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'ring-progress': 'ring-progress 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
