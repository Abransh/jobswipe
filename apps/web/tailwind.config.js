/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      /* ===== PREMIUM COLOR SYSTEM ===== */
      colors: {
        // Semantic color mapping (for components)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Premium neutral gray scale
        gray: {
          50: 'hsl(var(--color-gray-50))',
          100: 'hsl(var(--color-gray-100))',
          200: 'hsl(var(--color-gray-200))',
          300: 'hsl(var(--color-gray-300))',
          400: 'hsl(var(--color-gray-400))',
          500: 'hsl(var(--color-gray-500))',
          600: 'hsl(var(--color-gray-600))',
          700: 'hsl(var(--color-gray-700))',
          800: 'hsl(var(--color-gray-800))',
          900: 'hsl(var(--color-gray-900))',
        },

        // Apple-inspired semantic colors
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          light: 'hsl(var(--color-success-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          light: 'hsl(var(--color-warning-light))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          light: 'hsl(var(--color-error-light))',
        },
        purple: {
          DEFAULT: 'hsl(var(--color-purple))',
          light: 'hsl(var(--color-purple-light))',
        },

        // Backwards compatibility (JobSwipe brand colors - use sparingly)
        jobswipe: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },

      /* ===== PREMIUM SPACING (8-Point Grid) ===== */
      spacing: {
        '1': 'var(--space-1)',   // 4px
        '2': 'var(--space-2)',   // 8px
        '3': 'var(--space-3)',   // 12px
        '4': 'var(--space-4)',   // 16px
        '5': 'var(--space-5)',   // 20px
        '6': 'var(--space-6)',   // 24px
        '8': 'var(--space-8)',   // 32px
        '10': 'var(--space-10)', // 40px
        '12': 'var(--space-12)', // 48px
        '16': 'var(--space-16)', // 64px
        '20': 'var(--space-20)', // 80px
        '24': 'var(--space-24)', // 96px
      },

      /* ===== PREMIUM BORDER RADIUS ===== */
      borderRadius: {
        'sm': 'var(--radius-sm)',     // 6px
        'md': 'var(--radius-md)',     // 10px
        'lg': 'var(--radius-lg)',     // 14px
        'xl': 'var(--radius-xl)',     // 20px
        '2xl': 'var(--radius-2xl)',   // 28px
        'full': 'var(--radius-full)', // 9999px
      },

      /* ===== PREMIUM BOX SHADOWS ===== */
      boxShadow: {
        'minimal': 'var(--shadow-minimal)',
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'modal': 'var(--shadow-modal)',
        'premium': 'var(--shadow-premium)',
      },

      /* ===== PREMIUM TYPOGRAPHY ===== */
      fontSize: {
        'display': ['var(--font-size-display)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tighter)' }],
        'title-1': ['var(--font-size-title-1)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)' }],
        'title-2': ['var(--font-size-title-2)', { lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)' }],
        'title-3': ['var(--font-size-title-3)', { lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--letter-spacing-tight)' }],
        'headline': ['var(--font-size-headline)', { lineHeight: 'var(--line-height-snug)' }],
        'body': ['var(--font-size-body)', { lineHeight: 'var(--line-height-relaxed)' }],
        'callout': ['var(--font-size-callout)', { lineHeight: 'var(--line-height-normal)' }],
        'subhead': ['var(--font-size-subhead)', { lineHeight: 'var(--line-height-normal)' }],
        'footnote': ['var(--font-size-footnote)', { lineHeight: 'var(--line-height-normal)' }],
        'caption': ['var(--font-size-caption)', { lineHeight: 'var(--line-height-normal)' }],
      },

      fontWeight: {
        'ultralight': 'var(--font-weight-ultralight)',
        'light': 'var(--font-weight-light)',
        'regular': 'var(--font-weight-regular)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },

      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'snug': 'var(--line-height-snug)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
        'loose': 'var(--line-height-loose)',
      },

      letterSpacing: {
        'tighter': 'var(--letter-spacing-tighter)',
        'tight': 'var(--letter-spacing-tight)',
        'normal': 'var(--letter-spacing-normal)',
        'wide': 'var(--letter-spacing-wide)',
      },

      /* ===== PREMIUM FONT FAMILIES ===== */
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'var(--font-jetbrains-mono)',
          '"SF Mono"',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
      },

      /* ===== PREMIUM ANIMATIONS ===== */
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'quick': 'var(--duration-quick)',
        'smooth': 'var(--duration-smooth)',
        'slow': 'var(--duration-slow)',
      },

      transitionTimingFunction: {
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
        'spring': 'var(--ease-spring)',
      },

      keyframes: {
        // Premium entrance animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        // Premium shimmer effect
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },

        // Accordion animations (Radix UI)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },

        // Pulse (for loading states)
        'pulse-premium': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },

      animation: {
        'fade-in': 'fade-in var(--duration-smooth) var(--ease-out)',
        'slide-in-up': 'slide-in-up var(--duration-smooth) var(--ease-out)',
        'slide-in-down': 'slide-in-down var(--duration-smooth) var(--ease-out)',
        'slide-in-left': 'slide-in-left var(--duration-smooth) var(--ease-out)',
        'slide-in-right': 'slide-in-right var(--duration-smooth) var(--ease-out)',
        'scale-in': 'scale-in var(--duration-smooth) var(--ease-out)',
        'shimmer': 'shimmer 2s infinite linear',
        'accordion-down': 'accordion-down var(--duration-quick) var(--ease-out)',
        'accordion-up': 'accordion-up var(--duration-quick) var(--ease-out)',
        'pulse-premium': 'pulse-premium 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      /* ===== Z-INDEX SYSTEM ===== */
      zIndex: {
        'base': 'var(--z-base)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
      },

      /* ===== BACKDROP BLUR ===== */
      backdropBlur: {
        'premium': '20px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
