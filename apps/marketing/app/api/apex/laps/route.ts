import { handleLaps } from '@/lib/apex-laps';
import { apexStore } from '@/lib/apex-redis';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return handleLaps(request, {store: apexStore, appKey: process.env.APEX_APP_KEY ?? ''});
}
