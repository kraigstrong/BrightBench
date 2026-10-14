import { verifyGameCenterIdentity } from '@/lib/apex-identity';
import { handleFriendGhost, handleGhost } from '@/lib/apex-laps';
import { apexStore } from '@/lib/apex-redis';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return handleGhost(request, {
    store: apexStore, appKey: process.env.APEX_APP_KEY ?? '', playerSalt: process.env.APEX_PLAYER_SALT ?? '',
    bundleID: 'com.kraigstrong.apex', verify: (identity, player, bundle) => verifyGameCenterIdentity(identity, player, bundle),
  });
}
export async function GET(request: Request) {
  return handleFriendGhost(request, {store: apexStore, appKey: process.env.APEX_APP_KEY ?? '', playerSalt: process.env.APEX_PLAYER_SALT ?? ''});
}
