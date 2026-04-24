export function sample<T>(items: readonly T[]) {
  if (!items.length) {
    throw new Error('Cannot sample an empty list.');
  }

  return items[Math.floor(Math.random() * items.length)] as T;
}

export function shuffle<T>(items: readonly T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T];
  }

  return result;
}

export function takeRandom<T>(items: readonly T[], count: number, exclude: readonly T[] = []) {
  const excluded = new Set(exclude);
  return shuffle(items.filter((item) => !excluded.has(item))).slice(0, count);
}

export function makeRoundId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
