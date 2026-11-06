import { handleStats } from '@/lib/apex-laps';
import { apexStore } from '@/lib/apex-redis';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return handleStats(request, {store: apexStore, secret: process.env.STATS_SECRET ?? ''});
}
