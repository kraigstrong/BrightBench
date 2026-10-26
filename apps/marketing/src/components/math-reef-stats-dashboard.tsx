'use client';

import { type CSSProperties, type FormEvent, useEffect, useEffectEvent, useRef, useState } from 'react';
import { palette, radii, spacing } from '@education/design';

import {
  type Dashboard,
  type LevelRow,
  type StatsResponse,
  summarize,
  worldTitles,
} from '@/lib/math-reef-dashboard';

// Math Reef's anonymous analytics, read from GET /api/math-reef/stats: one tab of the stats viewer
// (stats-viewer.tsx). The viewer holds the key, which is sent only as a Bearer header, and locks
// when it's rejected. The tab loads once on opening, then again as the filters change.

type Filters = { from: string; to: string; channel: string; appVersion: string };

const channelOptions: [value: string, label: string][] = [
  ['testflight', 'TestFlight'],
  ['appstore', 'App Store'],
  ['debug', 'Debug builds'],
  ['all', 'All channels'],
];

const cell: CSSProperties = { padding: `${spacing.xs}px ${spacing.sm}px`, textAlign: 'right', whiteSpace: 'nowrap' };
const headCell: CSSProperties = {
  ...cell,
  color: palette.inkMuted,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
};
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

/** The counts, with the response's status (`stats` is null unless it's OK). */
async function fetchStats(params: URLSearchParams, secret: string, signal: AbortSignal) {
  const response = await fetch(`/api/math-reef/stats?${params}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${secret}` },
    signal,
  });
  return { status: response.status, stats: response.ok ? ((await response.json()) as StatsResponse) : null };
}

export function MathReefStatsDashboard({ secret, onUnauthorized }: { secret: string; onUnauthorized: () => void }) {
  const [filters, setFilters] = useState<Filters>({ from: '', to: '', channel: 'testflight', appVersion: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ stats: StatsResponse; dashboard: Dashboard } | null>(null);
  /** The request in flight. A newer one aborts it, so only the latest filters ever update the page,
   * and so does the viewer locking, so a late answer changes nothing. */
  const pending = useRef<AbortController | null>(null);

  /** State changes only in the callbacks, once the answer is in, so the first load can start from an effect. */
  function request(next: Filters) {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const params = new URLSearchParams();
    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);
    if (next.channel !== 'all') params.set('channel', next.channel);
    if (next.appVersion.trim()) params.set('appVersion', next.appVersion.trim());
    fetchStats(params, secret, controller.signal)
      .then(
        ({ status, stats }) => {
          if (controller.signal.aborted) return;
          if (status === 401) {
            onUnauthorized();
          } else if (status === 400) {
            setError('Check the dates: "to" can’t be before "from", and the range can be at most a year.');
          } else if (!stats) {
            setError(`Couldn’t load the counts (status ${status}). Try again in a moment.`);
          } else {
            setResult({ stats, dashboard: summarize(stats) });
          }
        },
        () => {
          if (controller.signal.aborted) return;
          setError('Couldn’t reach brightbench.app. Check your connection and try again.');
        },
      )
      .finally(() => {
        if (pending.current === controller) {
          pending.current = null;
          setLoading(false);
        }
      });
  }

  function load(next: Filters) {
    setLoading(true);
    setError('');
    request(next);
  }

  const loadFirst = useEffectEvent(() => request(filters));
  useEffect(() => {
    loadFirst();
    return () => pending.current?.abort();
  }, []);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    load(filters);
  }

  function update(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === 'channel') load(next);
  }

  const dashboard = result?.dashboard;
  const stats = result?.stats;
  const channelLabel = channelOptions.find(([value]) => value === (stats?.channel ?? filters.channel))?.[1] ?? 'All channels';

  return (
    <div style={{ display: 'grid', gap: spacing.lg }}>
      <form onSubmit={applyFilters} style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
          From
          <input type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} style={field} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
          To
          <input type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} style={field} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
          Channel
          <select value={filters.channel} onChange={(event) => update('channel', event.target.value)} style={field}>
            {channelOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 14 }}>
          App version
          <input placeholder="All" value={filters.appVersion} onChange={(event) => update('appVersion', event.target.value)} style={{ ...field, width: 90 }} data-1p-ignore />
        </label>
        <button type="submit" style={button} disabled={loading}>{loading ? 'Loading…' : 'Update'}</button>
      </form>

      {error && <p role="alert" style={{ color: palette.danger, margin: 0 }}>{error}</p>}

      {stats && dashboard && (
        <>
          <p style={{ color: palette.inkMuted, margin: 0 }}>
            {stats.from} to {stats.to} (UTC) · {channelLabel} · {stats.appVersion === 'all' ? 'all versions' : `version ${stats.appVersion}`}
          </p>

          <div style={{ display: 'grid', gap: spacing.md, gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }}>
            <StatTile label="New installs" value={dashboard.installs} />
            <StatTile label="Played a round" value={dashboard.firstRounds} />
            <StatTile label="Rounds recorded" value={dashboard.rounds} />
            <StatTile label="Hit a locked level" value={dashboard.paywallShown} />
            <StatTile
              label="Grown-up opened unlock"
              value={dashboard.unlockScreenShown}
              note={lockedLevelShare(dashboard.unlockScreenRatio)}
            />
            <StatTile label="Unlocked" value={dashboard.unlocked} note={lockedLevelShare(dashboard.unlockRatio)} />
          </div>

          {dashboard.installs + dashboard.rounds + dashboard.paywallShown + dashboard.unlockScreenShown + dashboard.unlocked === 0 && (
            <p style={{ ...card, margin: 0 }}>No counts for these filters yet.</p>
          )}

          {dashboard.worlds.map((world) => {
            const active = world.levels.filter(hasData);
            return (
              <section key={world.world} style={card}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 24, margin: 0 }}>{worldTitles[world.world]}</h2>
                  <span style={{ color: palette.inkMuted }}>Crowns: {world.silver} silver · {world.gold} gold</span>
                </div>
                {active.length === 0 ? (
                  <p style={{ color: palette.inkMuted, margin: 0 }}>No play in this world yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', fontSize: 14, width: '100%' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${palette.ring}` }}>
                          <th style={{ ...headCell, textAlign: 'left' }}>Level</th>
                          <th style={headCell}>Started</th>
                          <th style={headCell}>Passed</th>
                          <th style={{ ...headCell, textAlign: 'left' }}>Pass rate</th>
                          <th style={headCell}>Finished</th>
                          <th style={headCell}>Quit</th>
                          <th style={headCell}>Left app</th>
                          <th style={headCell}>Avg ★</th>
                          <th style={{ ...headCell, textAlign: 'left' }}>Where kids stop</th>
                        </tr>
                      </thead>
                      <tbody>
                        {world.levels.map((row) => (
                          <LevelTableRow key={row.level} row={row} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

function hasData(row: LevelRow) {
  return row.started + row.passed + row.finished + row.quit + row.abandoned > 0;
}

function lockedLevelShare(ratio: number | null): string | undefined {
  return ratio === null ? undefined : `${Math.round(ratio * 100)}% of the locked-level count (not a per-player rate)`;
}

function StatTile({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div style={{ ...card, alignContent: 'start', gap: 4, padding: spacing.md }}>
      <span style={{ color: palette.inkMuted, fontSize: 13, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 800 }}>{value.toLocaleString()}</span>
      {note && <span style={{ color: palette.inkMuted, fontSize: 13 }}>{note}</span>}
    </div>
  );
}

function LevelTableRow({ row }: { row: LevelRow }) {
  const muted = !hasData(row);
  const percent = row.passRate === null ? null : Math.round(row.passRate * 100);
  return (
    <tr style={{ borderBottom: `1px solid ${palette.surfaceMuted}`, color: muted ? palette.inkMuted : palette.ink }}>
      <td style={{ ...cell, textAlign: 'left', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{row.level}</td>
      <td style={cell}>{row.started}</td>
      <td style={cell}>{row.passed}</td>
      <td style={{ ...cell, textAlign: 'left' }}>
        {percent === null ? (
          '–'
        ) : (
          <span
            title={`${row.passed} of ${row.started} players passed`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
            <span style={{ background: palette.surfaceMuted, borderRadius: 4, display: 'inline-block', height: 8, width: 72 }}>
              <span
                style={{
                  background: palette.teal,
                  borderRadius: 4,
                  display: 'block',
                  height: 8,
                  width: `${Math.min(percent, 100)}%`,
                }}
              />
            </span>
            {percent}%
          </span>
        )}
      </td>
      <td style={cell}>{row.finished}</td>
      <td style={cell}>{row.quit}</td>
      <td style={cell}>{row.abandoned}</td>
      <td style={cell}>{row.averageStars === null ? '–' : row.averageStars.toFixed(1)}</td>
      <td style={{ ...cell, textAlign: 'left' }}>
        {row.stopPoints.length === 0
          ? '–'
          : row.stopPoints.map((stop) => `after ${stop.correct} of ${stop.target} (${stop.count}×)`).join(', ')}
      </td>
    </tr>
  );
}
