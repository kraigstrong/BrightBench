import { handleEvents } from '@/lib/double-putt-analytics';
import { doublePuttStore } from '@/lib/double-putt-redis';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  return handleEvents(request, {store: doublePuttStore, appKey: process.env.DOUBLE_PUTT_APP_KEY ?? ''});
}
