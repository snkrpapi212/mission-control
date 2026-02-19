import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wanda's Mission Control Palette
        // Base Colors (Dark Mode)
        'mc-bg': '#0F0F0F',              // Main background
        'mc-surface': '#1A1A1A',         // Cards, sidebar
        'mc-surface-hover': '#2A2A2A',   // Hover states
        'mc-surface-active': '#333333',  // Active/focused
        'mc-border': '#333333',          // Dividers
        
        // Text Colors
        'mc-text': '#F5F5F5',            // Primary text
        'mc-text-muted': '#9CA3AF',      // Secondary labels
        'mc-text-subtle': '#6B7280',     // Tertiary
        
        // Status Colors
        'status-active': '#22C55E',      // Online green
        'status-idle': '#F59E0B',        // Idle amber
        'status-offline': '#6B7280',     // Offline gray
        'status-success': '#10B981',     // Success teal
        'status-warning': '#F59E0B',     // Warning amber
        'status-error': '#EF4444',       // Error red
        
        // Priority Colors
        'priority-p0': '#EF4444',        // Critical red
        'priority-p1': '#F97316',        // High orange
        'priority-p2': '#3B82F6',        // Medium blue
        'priority-p3': '#6B7280',        // Low gray
        
        // Accent Colors
        'accent-primary': '#0EA5E9',     // Cyan
        'accent-secondary': '#8B5CF6',   // Purple
      },
      height: {
        'topnav': '64px',                // TopNav fixed height
      },
      minWidth: {
        'column': '288px',               // Min width for kanban column
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
