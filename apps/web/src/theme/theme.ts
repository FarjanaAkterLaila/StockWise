export const theme = {
  colors: {
    background: '#ffffff',
    backgroundApp: '#f8fafc',
    backgroundSubtle: '#f8fafc',
    backgroundSidebar: '#0b1120',
    backgroundSidebarHover: 'rgba(255, 255, 255, 0.05)',
    backgroundSidebarActive: '#4f46e5',
    backgroundHeader: '#ffffff',

    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    border: '#e2e8f0',
    borderCard: '#edf2f7',
    borderSidebar: 'rgba(255, 255, 255, 0.08)',

    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#eef2ff',
    primaryBorder: '#c7d2fe',

    success: '#059669',
    successHover: '#047857',
    successLight: '#ecfdf5',
    successBorder: '#a7f3d0',

    warning: '#d97706',
    warningLight: '#fffbeb',
    warningBorder: '#fde68a',

    danger: '#e11d48',
    dangerLight: '#fff1f2',
    dangerBorder: '#fecdd3',

    info: '#0284c7',
    infoLight: '#f0f9ff',
    infoBorder: '#bae6fd',
  },

  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
  },

  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
    md: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
    lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
    card: '0 2px 5px rgba(15, 23, 42, 0.03), 0 0 0 1px rgba(15, 23, 42, 0.05)',
  },

  media: {
    mobile: '@media (max-width: 640px)',
    tablet: '@media (max-width: 992px)',
    desktopLg: '@media (max-width: 1200px)',
  },
};

export type AppTheme = typeof theme;
