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

        // Primary accent - Warm earth tones for Tend brand
        accent: {
          DEFAULT: '#C4A484',  // Warm sand
          hover: '#D4B494',
          muted: 'rgba(196, 164, 132, 0.12)',
        },

        // Secondary accent - Deeper earth
        secondary: {
          DEFAULT: '#8B7355',
          hover: '#9B8365',
          muted: 'rgba(139, 115, 85, 0.12)',
        },

        // Semantic colors - Warm, softer palette
        good: '#7CB98B',      // Soft green (replaces success)
        caution: '#D4A84B',   // Warm amber (replaces warning)
        concern: '#C97B7B',   // Soft red (replaces error)
        healing: '#9BB5C9',   // Calm blue

        // Legacy aliases for compatibility
        success: '#7CB98B',
        warning: '#D4A84B',
        error: '#C97B7B',
        info: '#9BB5C9',

        // Text hierarchy
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A6',
        'text-tertiary': '#636366',

        // Borders
        border: '#2A2A2E',

        // Readiness colors - Updated for Tend brand
        readiness: {
          sleep: '#9BB5C9',   // Calm blue (healing)
          recovery: '#7CB98B', // Soft green (good)
          load: '#D4A84B',    // Warm amber (caution)
          body: '#C4A484',    // Warm sand (accent)
        },

        // Body map colors - Updated for Tend brand
        body: {
          severe: '#C97B7B',   // Soft red (concern)
          moderate: '#D4A84B', // Warm amber (caution)
          mild: '#C4A484',     // Warm sand (accent)
          good: '#7CB98B',     // Soft green (good)
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

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
