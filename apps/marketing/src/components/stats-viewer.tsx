'use client';

import { type ComponentType, type CSSProperties, type FormEvent, type KeyboardEvent, useState } from 'react';
import { palette, radii, spacing } from '@education/design';

import ApexStats from '@/components/apex-stats';
import BiggerFishStats from '@/components/bigger-fish-stats';
import DoublePuttStats from '@/components/double-putt-stats';
import { MathReefStatsDashboard } from '@/components/math-reef-stats-dashboard';
import { type StatsGameId, statsGames } from '@/lib/stats-games';

// Every game's anonymous analytics behind one key, the stats secret, with a tab per game. The key
// lives only in this component's state (a password field a password manager can fill), is sent by
// each tab only as a Bearer header, and is gone when the page locks, closes or reloads.

type PanelProps = { secret: string; onUnauthorized: () => void };

const panels: Record<StatsGameId, ComponentType<PanelProps>> = {
  'bigger-fish': BiggerFishStats,
  'double-putt': DoublePuttStats,
  apex: ApexStats,
  'math-reef': MathReefStatsDashboard,
};

const tabId = (game: StatsGameId) => `stats-tab-${game}`;
const panelId = (game: StatsGameId) => `stats-panel-${game}`;

const field: CSSProperties = {
  border: `1px solid ${palette.ring}`,
  borderRadius: radii.sm,
  color: palette.ink,
  font: 'inherit',
  padding: '8px 12px',
};
const button: CSSProperties = {
  background: palette.ink,
  border: 'none',
  borderRadius: radii.pill,
  color: palette.white,
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: 700,
  padding: '10px 18px',
};
const card: CSSProperties = {
  background: palette.surface,
  border: `1px solid ${palette.ring}`,
  borderRadius: radii.xl,
  display: 'grid',
  gap: spacing.md,
  padding: spacing.xl,
};
const tab = (selected: boolean): CSSProperties => ({
  background: 'none',
  borderColor: selected ? palette.teal : 'transparent',
  borderStyle: 'solid',
  borderWidth: '0 0 3px',
  color: selected ? palette.ink : palette.inkMuted,
  cursor: 'pointer',
  font: 'inherit',
  fontWeight: 700,
  marginBottom: -1,
  padding: `${spacing.sm}px ${spacing.md}px`,
});

export function StatsViewer({ initialGame }: { initialGame: StatsGameId }) {
  const [secret, setSecret] = useState('');
  const [game, setGame] = useState(initialGame);
  /** The tabs opened since unlocking. Each stays mounted, hidden while another is chosen, so
   * going back to it shows its report and filters as they were, without loading it again. */
  const [opened, setOpened] = useState<StatsGameId[]>([]);
  const [error, setError] = useState('');

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The key is read from the form, not state: a password manager can fill the field without firing onChange.
    const key = String(new FormData(event.currentTarget).get('password') ?? '').trim();
    if (!key) return;
    setError('');
    setOpened([game]);
    setSecret(key);
  }

  /** Forgets the key and unmounts every tab, which drops its report and aborts its request. */
  function lock(message = '') {
    setSecret('');
    setOpened([]);
    setError(message);
  }

  function choose(next: StatsGameId) {
    setGame(next);
    setOpened((current) => (current.includes(next) ? current : [...current, next]));
    // The address follows the tab, for a reload or a bookmark, without a navigation.
    const params = new URLSearchParams(window.location.search);
    params.set('game', next);
    window.history.replaceState(null, '', `?${params}`);
  }

  /** Arrow keys, Home and End move between the tabs (the WAI-ARIA tabs pattern). */
  function moveBetweenTabs(event: KeyboardEvent<HTMLButtonElement>) {
    const index = statsGames.findIndex(({ id }) => id === game);
    const last = statsGames.length - 1;
    const targets: Record<string, number> = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      End: last,
      Home: 0,
    };
    const next = statsGames[targets[event.key] ?? -1]?.id;
    if (!next) return;
    event.preventDefault();
    choose(next);
    document.getElementById(tabId(next))?.focus();
  }

  if (!secret) {
    return (
      <main>
        {/* A sign-in form as 1Password's website design guide describes one (1password.dev/web/compatible-website-design):
            POST, so a submit before the page's script loads, or 1Password clicking the button, can't put the key in the
            URL; a label tied to each field by `for`; and the key called a password, which is what a password manager
            looks for. */}
        <form id="stats-sign-in" onSubmit={unlock} method="post" style={{ ...card, margin: '0 auto', maxWidth: 440 }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Stats</h1>
          <p style={{ color: palette.inkMuted, margin: 0 }}>Sign in to see each game’s anonymous usage counts.</p>
          {/* A username, prefilled and hidden the way the guide's example hides one, so the password manager saves and
              matches one item for every game. */}
          <input type="text" name="username" id="username" autoComplete="username" defaultValue="brightbench-stats" aria-hidden="true" tabIndex={-1} style={{ display: 'none' }} />
          <label htmlFor="password" style={{ fontWeight: 700 }}>Password</label>
          <input type="password" name="password" id="password" autoComplete="current-password" required style={field} />
          {error && <p role="alert" style={{ color: palette.danger, margin: 0 }}>{error}</p>}
          <button type="submit" style={{ ...button, justifySelf: 'start' }}>Sign in</button>
          <p style={{ color: palette.inkMuted, fontSize: 14, margin: 0 }}>
            The password stays in this page’s memory and is sent in an authorization header, never a URL or local storage.
          </p>
        </form>
      </main>
    );
  }

  return (
    <main style={{ display: 'grid', gap: spacing.lg }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Stats</h1>
        <button type="button" onClick={() => lock()} style={{ ...button, background: palette.surfaceMuted, color: palette.ink }}>
          Lock
        </button>
      </header>

      <div role="tablist" aria-label="Games" style={{ borderBottom: `1px solid ${palette.ring}`, display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
        {statsGames.map(({ id, name }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={tabId(id)}
            aria-selected={id === game}
            aria-controls={panelId(id)}
            tabIndex={id === game ? 0 : -1}
            onClick={() => choose(id)}
            onKeyDown={moveBetweenTabs}
            style={tab(id === game)}>
            {name}
          </button>
        ))}
      </div>

      {statsGames.map(({ id }) => {
        const Panel = panels[id];
        return (
          // minWidth 0: a grid item otherwise grows to its widest chart, and every paragraph with it.
          <div key={id} role="tabpanel" id={panelId(id)} aria-labelledby={tabId(id)} hidden={id !== game} style={{ minWidth: 0 }}>
            {opened.includes(id) && <Panel secret={secret} onUnauthorized={() => lock('That password didn’t work.')} />}
          </div>
        );
      })}
    </main>
  );
}
