// TEMPORARY plain styles for Phase 2. Phase 3 replaces this file with the
// real design system (colours, fonts, spacing). Screens must not hard-code
// colours or sizes; they import them from here.
export const plain = {
  color: {
    background: '#ffffff',
    text: '#171717',
    muted: '#666666',
    border: '#d4d4d4',
    primary: '#171717',
    primaryText: '#ffffff',
    error: '#b91c1c',
    demoBackground: '#fef3c7',
    demoText: '#78350f',
  },
  // "bottom" is extra room below the last item, on top of the device's safe area.
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, bottom: 40 },
  radius: 16,
  font: { body: 16, small: 14, title: 26 },
} as const;
