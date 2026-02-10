import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ============================================
           MISSION CONTROL DESIGN TOKENS
           Maps to CSS variables in globals.css
           ============================================ */

        // Background & Surface Layers
        'mc-bg': 'var(--mc-bg)',
        'mc-surface': 'var(--mc-surface)',
        'mc-surface-elevated': 'var(--mc-surface-elevated)',
        'mc-card': 'var(--mc-card)',

        // Legacy surface aliases
        'mc-panel': 'var(--mc-panel)',
        'mc-panel-soft': 'var(--mc-panel-soft)',

        // Borders
        'mc-border': 'var(--mc-border)',
        'mc-border-strong': 'var(--mc-border-strong)',
        'mc-line': 'var(--mc-line)',
        'mc-line-strong': 'var(--mc-line-strong)',

        // Text Colors
        'mc-text': 'var(--mc-text)',
        'mc-text-muted': 'var(--mc-text-muted)',
        'mc-text-soft': 'var(--mc-text-soft)',

        // Semantic Status - Success
        'mc-success': 'var(--mc-success)',
        'mc-success-soft': 'var(--mc-success-soft)',
        'mc-green': 'var(--mc-green)',
        'mc-green-soft': 'var(--mc-green-soft)',

        // Semantic Status - Warning
        'mc-warn': 'var(--mc-warn)',
        'mc-warn-soft': 'var(--mc-warn-soft)',
        'mc-amber': 'var(--mc-amber)',
        'mc-amber-soft': 'var(--mc-amber-soft)',

        // Semantic Status - Error
        'mc-error': 'var(--mc-error)',
        'mc-error-soft': 'var(--mc-error-soft)',
        'mc-red': 'var(--mc-red)',
        'mc-red-soft': 'var(--mc-red-soft)',

        // Accent Colors
        'mc-accent': 'var(--mc-accent)',
        'mc-accent-soft': 'var(--mc-accent-soft)',
        'mc-accent-green': 'var(--mc-accent-green)',
        'mc-accent-green-soft': 'var(--mc-accent-green-soft)',

        // Interactive Elements
        'mc-focus': 'var(--mc-focus)',
        'mc-chip-bg': 'var(--mc-chip-bg)',
        'mc-chip-text': 'var(--mc-chip-text)',
        'mc-button-bg': 'var(--mc-button-bg)',
        'mc-button-hover': 'var(--mc-button-hover)',

        // Legacy Tailwind color mappings (for backward compatibility)
        'mc-surface-hover': '#2A2A2A',
        'mc-surface-active': '#333333',

        // Status Colors (legacy mapping)
        'status-active': 'var(--mc-success)',
        'status-idle': 'var(--mc-warn)',
        'status-offline': 'var(--mc-text-muted)',
        'status-success': 'var(--mc-success)',
        'status-warning': 'var(--mc-warn)',
        'status-error': 'var(--mc-error)',

        // Priority Colors (retained from original)
        'priority-p0': '#EF4444',
        'priority-p1': '#F97316',
        'priority-p2': '#3B82F6',
        'priority-p3': '#6B7280',
      },
      fontSize: {
        // Typography Scale
        'mc-display': 'var(--mc-font-display)',
        'mc-h1': 'var(--mc-font-h1)',
        'mc-h2': 'var(--mc-font-h2)',
        'mc-body': 'var(--mc-font-body)',
        'mc-meta': 'var(--mc-font-meta)',
      },
      height: {
        'topnav': '64px',
      },
      minWidth: {
        'column': '288px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
