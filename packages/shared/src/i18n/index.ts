import { en } from './en.ts';

export const translations = { en } as const;
export type Language = keyof typeof translations;
export { en };
