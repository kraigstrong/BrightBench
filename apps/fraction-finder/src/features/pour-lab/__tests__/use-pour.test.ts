import { act, renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

import { SPLASH_STEP } from '@/features/pour-lab/pour-engine';
import { usePour } from '@/features/pour-lab/use-pour';

describe('usePour', () => {
  let appStateListener: ((status: AppStateStatus) => void) | null = null;

  beforeEach(() => {
    // Fakes Date.now and requestAnimationFrame together, so frames advance with the clock.
    jest.useFakeTimers();
    appStateListener = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateListener = listener as (status: AppStateStatus) => void;
      return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function advance(ms: number) {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  }

  it('pours steadily while held and stops the moment it is released', () => {
    const { result } = renderHook(() => usePour(0));

    act(() => result.current.start(1));
    expect(result.current.activeDirection).toBe(1);
    advance(1000);
    expect(result.current.value).toBeCloseTo(0.25, 1);

    act(() => result.current.stop(1));
    const released = result.current.value;
    expect(result.current.activeDirection).toBeNull();
    advance(1000);
    expect(result.current.value).toBe(released);
  });

  it('ignores a release from the other control', () => {
    const { result } = renderHook(() => usePour(0.5));

    act(() => result.current.start(-1));
    act(() => result.current.stop(1));
    expect(result.current.activeDirection).toBe(-1);
    act(() => result.current.stop(-1));
    expect(result.current.activeDirection).toBeNull();
  });

  it('stops pouring when the app leaves the foreground mid-hold', () => {
    const { result } = renderHook(() => usePour(0));

    act(() => result.current.start(1));
    advance(400);
    act(() => appStateListener?.('background'));
    const stopped = result.current.value;

    expect(result.current.activeDirection).toBeNull();
    advance(1000);
    expect(result.current.value).toBe(stopped);
  });

  it('leaves no frame running after unmounting mid-hold', () => {
    const { result, unmount } = renderHook(() => usePour(0));

    act(() => result.current.start(1));
    advance(100);
    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });

  it('counts each fast tap as one splash even when a release never arrives', () => {
    const { result } = renderHook(() => usePour(0));

    // Native Pressable can drop the first onPressOut when the second press lands quickly.
    act(() => result.current.start(1));
    advance(30);
    act(() => result.current.start(1));
    advance(30);
    act(() => result.current.stop(1));

    expect(result.current.value).toBeCloseTo(2 * SPLASH_STEP, 9);
  });
});
