// All user-facing text lives here so other languages can be added later.
export const en = {
  appName: 'Orderrite',
  hello: {
    title: 'Hello from Orderrite',
    subtitle: 'Project setup is working.',
    apiChecking: 'Checking the API…',
    apiConnected: 'API connected ✓',
    apiError: "Can't reach the API right now. Is it running?",
    retry: 'Try again',
  },
} as const;

export type Translations = typeof en;
