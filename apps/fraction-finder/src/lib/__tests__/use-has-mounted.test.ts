import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { useHasMounted } from '@/lib/use-has-mounted';

function renderValues() {
  const values: boolean[] = [];
  const { result } = renderHook(() => {
    const value = useHasMounted();
    values.push(value);
    return value;
  });
  return { first: values[0], latest: result.current };
}

describe('useHasMounted', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('matches the static web render first, then turns on in the browser', () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    expect(renderValues()).toEqual({ first: false, latest: true });
  });

  it('is on from the first render on native, where nothing is pre-rendered', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    expect(renderValues()).toEqual({ first: true, latest: true });
  });
});
