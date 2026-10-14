import { handleFriends } from '@/lib/apex-laps';
import { apexStore } from '@/lib/apex-redis';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return handleFriends(request, {store: apexStore, appKey: process.env.APEX_APP_KEY ?? '', playerSalt: process.env.APEX_PLAYER_SALT ?? ''});
}
