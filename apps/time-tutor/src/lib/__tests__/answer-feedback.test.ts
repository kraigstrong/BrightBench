import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { FEEDBACK_AUDIO_MANIFEST } from '@/config/audio-manifest';

// The shared jest setup hands back a player whose seekTo() returns undefined,
// which is enough for render tests but swallows playback here. These tests need
// a player that actually resolves so play() is reached.
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    loop: false,
    pause: jest.fn(),
    play: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

type AnswerFeedbackModule = typeof import('@/lib/answer-feedback');
type MockPlayer = {
  loop: boolean;
  pause: jest.Mock;
  play: jest.Mock;
  seekTo: jest.Mock;
};

const createAudioPlayerMock = createAudioPlayer as unknown as jest.Mock;
const notificationAsyncMock = Haptics.notificationAsync as unknown as jest.Mock;

// Each test gets a fresh copy so the module's cached players and round-robin
// cursor don't leak between cases.
function loadAnswerFeedback(): AnswerFeedbackModule {
  let loaded: AnswerFeedbackModule | undefined;

  jest.isolateModules(() => {
    loaded = jest.requireActual<AnswerFeedbackModule>('@/lib/answer-feedback');
  });

  return loaded as AnswerFeedbackModule;
}

function playersCreatedFor(asset: unknown): MockPlayer[] {
  return createAudioPlayerMock.mock.calls
    .map((call, index) => ({
      asset: call[0],
      player: createAudioPlayerMock.mock.results[index]?.value as MockPlayer,
    }))
    .filter((entry) => entry.asset === asset)
    .map((entry) => entry.player);
}

function flushAsyncWork() {
  return new Promise<void>((resolve) => setImmediate(resolve));
}

describe('answer feedback audio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerRoundCompleteFeedback', () => {
    it('plays the starless summary sound when no stars were earned', async () => {
      loadAnswerFeedback().triggerRoundCompleteFeedback(0, true);
      await flushAsyncWork();

      const [player] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.roundNone);

      expect(player.play).toHaveBeenCalledTimes(1);
      expect(notificationAsyncMock).toHaveBeenCalledWith('warning');
    });

    it.each([1, 2, 3])(
      'plays no summary sound at %i stars because the per-star dings carry the result',
      async (earnedStars) => {
        loadAnswerFeedback().triggerRoundCompleteFeedback(earnedStars, true);
        await flushAsyncWork();

        expect(createAudioPlayerMock).not.toHaveBeenCalled();
        expect(notificationAsyncMock).toHaveBeenCalledWith('success');
      },
    );

    it('plays nothing when sound effects are disabled', async () => {
      loadAnswerFeedback().triggerRoundCompleteFeedback(0, false);
      await flushAsyncWork();

      expect(createAudioPlayerMock).not.toHaveBeenCalled();
      expect(notificationAsyncMock).toHaveBeenCalledWith('warning');
    });
  });

  describe('playStarRevealDing', () => {
    it('rotates through a pool so overlapping dings do not cut each other off', async () => {
      const { playStarRevealDing } = loadAnswerFeedback();

      await playStarRevealDing(true);
      await playStarRevealDing(true);
      await playStarRevealDing(true);

      const pool = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.starDing);

      expect(pool).toHaveLength(3);
      for (const player of pool) {
        expect(player.play).toHaveBeenCalledTimes(1);
      }

      // A fourth ding wraps back to the first player, which has finished by then.
      await playStarRevealDing(true);

      expect(pool[0].play).toHaveBeenCalledTimes(2);
      expect(pool[1].play).toHaveBeenCalledTimes(1);
      expect(createAudioPlayerMock).toHaveBeenCalledTimes(3);
    });

    it('stays silent when sound effects are disabled', async () => {
      await loadAnswerFeedback().playStarRevealDing(false);

      expect(createAudioPlayerMock).not.toHaveBeenCalled();
    });
  });

  describe('mode tap and crown', () => {
    it('plays the mode tap click and the crown flourish', async () => {
      const { playCrownSound, playModeTapSound } = loadAnswerFeedback();

      playModeTapSound(true);
      playCrownSound(true);
      await flushAsyncWork();

      const [tapPlayer] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.modeTap);
      const [crownPlayer] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.crown);

      expect(tapPlayer.play).toHaveBeenCalledTimes(1);
      expect(crownPlayer.play).toHaveBeenCalledTimes(1);
    });

    it('stays silent when sound effects are disabled', async () => {
      const { playCrownSound, playModeTapSound } = loadAnswerFeedback();

      playModeTapSound(false);
      playCrownSound(false);
      await flushAsyncWork();

      expect(createAudioPlayerMock).not.toHaveBeenCalled();
    });
  });

  describe('mode tap latency', () => {
    it('builds the tap player up front when prewarmed', () => {
      const { prewarmInstantSounds } = loadAnswerFeedback();

      prewarmInstantSounds(true);

      expect(playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.modeTap)).toHaveLength(1);
    });

    it('prewarms nothing when sound effects are disabled', () => {
      const { prewarmInstantSounds } = loadAnswerFeedback();

      prewarmInstantSounds(false);

      expect(createAudioPlayerMock).not.toHaveBeenCalled();
    });

    // The whole point of the prewarm: the click must not wait on the audio-mode
    // setup or a seekTo() round-trip while the router renders the next screen.
    it('plays synchronously once prewarmed, with nothing awaited first', () => {
      const { playModeTapSound, prewarmInstantSounds } = loadAnswerFeedback();

      prewarmInstantSounds(true);
      const [tapPlayer] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.modeTap);

      playModeTapSound(true);

      // No flushAsyncWork() — if play() needed a microtask it would fail here.
      expect(tapPlayer.play).toHaveBeenCalledTimes(1);
      expect(tapPlayer.seekTo).not.toHaveBeenCalled();
    });

    it('rewinds after playback rather than before the next press', () => {
      jest.useFakeTimers();

      try {
        const { playModeTapSound, prewarmInstantSounds } = loadAnswerFeedback();

        prewarmInstantSounds(true);
        const [tapPlayer] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.modeTap);

        playModeTapSound(true);
        expect(tapPlayer.seekTo).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);
        expect(tapPlayer.seekTo).toHaveBeenCalledWith(0);

        // A second press still plays immediately off the same player.
        playModeTapSound(true);
        expect(tapPlayer.play).toHaveBeenCalledTimes(2);
      } finally {
        jest.useRealTimers();
      }
    });

    it('still plays when a press arrives before any prewarm', async () => {
      const { playModeTapSound } = loadAnswerFeedback();

      playModeTapSound(true);
      await flushAsyncWork();

      const [tapPlayer] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.modeTap);

      expect(tapPlayer.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('suspense roll', () => {
    it('plays the drum roll once instead of looping', async () => {
      const { startSuspenseLoop } = loadAnswerFeedback();

      await startSuspenseLoop(true);

      const [player] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.suspenseRoll);

      expect(player.play).toHaveBeenCalledTimes(1);
      expect(player.loop).toBe(false);
    });

    it('can be cut short, and stopping without starting is a no-op', async () => {
      const { startSuspenseLoop, stopSuspenseLoop } = loadAnswerFeedback();

      await stopSuspenseLoop();
      expect(createAudioPlayerMock).not.toHaveBeenCalled();

      await startSuspenseLoop(true);
      await stopSuspenseLoop();

      const [player] = playersCreatedFor(FEEDBACK_AUDIO_MANIFEST.suspenseRoll);

      expect(player.pause).toHaveBeenCalledTimes(1);
    });
  });
});
