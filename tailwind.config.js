/** @type {import('tailwindcss').Config} */

function withAlpha(varName) {
  return `color-mix(in srgb, var(--${varName}) calc(<alpha-value> * 100%), transparent)`;
}

export default {
  prefix: 'suprsend-',
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: '.suprsend-root',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: withAlpha('background'),
        foreground: withAlpha('foreground'),
        card: {
          DEFAULT: withAlpha('card'),
          foreground: withAlpha('card-foreground'),
        },
        popover: {
          DEFAULT: withAlpha('popover'),
          foreground: withAlpha('popover-foreground'),
        },
        primary: {
          DEFAULT: withAlpha('primary'),
          foreground: withAlpha('primary-foreground'),
        },
        secondary: {
          DEFAULT: withAlpha('secondary'),
          foreground: withAlpha('secondary-foreground'),
        },
        muted: {
          DEFAULT: withAlpha('muted'),
          foreground: withAlpha('muted-foreground'),
        },
        accent: {
          DEFAULT: withAlpha('accent'),
          foreground: withAlpha('accent-foreground'),
        },
        destructive: {
          DEFAULT: withAlpha('destructive'),
          foreground: withAlpha('destructive-foreground'),
        },
        border: withAlpha('border'),
        input: withAlpha('input'),
        ring: withAlpha('ring'),
        chart: {
          1: withAlpha('chart-1'),
          2: withAlpha('chart-2'),
          3: withAlpha('chart-3'),
          4: withAlpha('chart-4'),
          5: withAlpha('chart-5'),
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
