import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { apexBoards } from '../src/lib/apex-laps.ts';
import { circuits, ghostThread, ghostThreadCta } from '../src/lib/ghost-thread.ts';

const publicDir = new URL('../public/', import.meta.url);

test('every circuit on the page is one the lap service takes laps for', () => {
  const tracks = new Set(apexBoards.map((board) => board.split('.')[0]));
  assert.deepEqual(
    circuits.map((circuit) => circuit.id),
    ['ardennes', 'swirl', 'snake', 'mirage', 'island', 'harbor'],
  );
  for (const circuit of circuits) assert.ok(tracks.has(circuit.id), `${circuit.id} has a board`);
  assert.ok(circuits.some((circuit) => circuit.name === ghostThread.freeCircuit), 'the free circuit is on the page');
});

test("each circuit's thread runs once round its line, from the start back to it", () => {
  for (const circuit of circuits) {
    const { keyPoints } = circuit;
    assert.equal(keyPoints[0], 0, circuit.id);
    assert.equal(keyPoints.at(-1), 1, circuit.id);
    assert.ok(keyPoints.every((k, i) => i === 0 || k >= keyPoints[i - 1]), `${circuit.id} only moves forward`);
    assert.equal(Math.max(circuit.width, circuit.height), 1000, circuit.id);
    assert.match(circuit.outline, /^M[\d. L-]+Z$/, circuit.id);
    assert.match(circuit.line, /^M[\d. L-]+Z$/, circuit.id);
    assert.ok(circuit.lap > 20 && circuit.lap < 40, `${circuit.id} laps like a good lap`);
  }
});

test('the page offers the beta until the App Store listing is there, then only the App Store', () => {
  assert.deepEqual(ghostThreadCta({ appStoreUrl: '', testFlightUrl: 'https://testflight.apple.com/join/x' }), {
    href: 'https://testflight.apple.com/join/x',
    kind: 'beta',
  });
  assert.deepEqual(
    ghostThreadCta({ appStoreUrl: 'https://apps.apple.com/app/id6822499299', testFlightUrl: 'https://testflight.apple.com/join/x' }),
    { href: 'https://apps.apple.com/app/id6822499299', kind: 'download' },
  );
});

test("the game's logo and icon are in public/", () => {
  for (const path of ['games/ghost-thread/logo.png', 'games/ghost-thread/icon.png']) {
    assert.ok(existsSync(new URL(path, publicDir)), `missing ${path}`);
  }
});

test("the hero's gameplay loop and its poster are in public/", () => {
  for (const path of [ghostThread.video.src, ghostThread.video.poster]) {
    assert.ok(existsSync(new URL(path.replace(/^\//, ''), publicDir)), `missing ${path}`);
  }
});
