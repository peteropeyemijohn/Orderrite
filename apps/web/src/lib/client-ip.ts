import 'server-only';
import { headers } from 'next/headers';

/** The visitor's IP as seen by our hosting (Vercel sets x-forwarded-for). */
export async function getVisitorIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined;
}
