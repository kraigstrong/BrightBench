import { handleEvents } from '@/lib/bigger-fish-analytics';
import { arcadeStore } from '@/lib/bigger-fish-redis';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return handleEvents(request, {store: arcadeStore, appKey: process.env.BIGGER_FISH_APP_KEY ?? ''});
}
