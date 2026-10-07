import { AccessibilityInfo } from 'react-native';

jest.mock('@/state/app-state', () => ({
  useAppState: jest.fn(() => ({ settings: { reducedMotion: false, soundEnabled: false } })),
}));

type MotionModule = typeof import('@/lib/use-reduce-motion');
type Rntl = typeof import('@testing-library/react-native/pure');

// The hook keeps the OS answer at module level, so each test loads a fresh copy. The
// renderer loads alongside it (the `pure` entry, which registers no test hooks) so both
// share one React instance.
function freshModule() {
  let loaded: (MotionModule & Pick<Rntl, 'act' | 'renderHook'>) | undefined;
  jest.isolateModules(() => {
    const { act, renderHook } = jest.requireActual<Rntl>('@testing-library/react-native/pure');
    loaded = { ...jest.requireActual<MotionModule>('@/lib/use-reduce-motion'), act, renderHook };
  });
  return loaded!;
}

async function renderFirstValue({ act, renderHook, useReduceMotion }: ReturnType<typeof freshModule>) {
  const values: boolean[] = [];
  const { result, unmount } = renderHook(() => {
    const value = useReduceMotion();
    values.push(value);
    return value;
  });
  await act(async () => {});
  const settled = result.current;
  unmount();
  return { first: values[0], settled };
}

describe('useReduceMotion with the OS preference on', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('only learns it after the first render when nothing primed it', async () => {
    const motion = freshModule();

    // A route transition configured on this first render would still animate.
    expect(await renderFirstValue(motion)).toEqual({ first: false, settled: true });
  });

  it('knows it from the first render once the app has primed it at launch', async () => {
    const motion = freshModule();
    motion.primeSystemReduceMotion();
    await motion.act(async () => {});

    expect(await renderFirstValue(motion)).toEqual({ first: true, settled: true });
  });
});
