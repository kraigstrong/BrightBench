// Packs the press kit's downloads into public/press/bigger-fish-press-kit.zip, with a plain-text fact sheet.
// Runs before `next dev` and `next build`; the zip is generated, never committed.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { descriptions, facts, features, game } from '../src/lib/game.ts';
import { pressKitFiles, pressKitZip, zipPath } from '../src/lib/press-assets.ts';
import { contactEmail, productionOrigin, readEnv } from '../src/lib/site.ts';
import { createZip } from './zip.ts';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

export function factSheet(): string {
  const lines = [
    `${game.name}: ${game.tagline}`,
    '',
    game.oneLiner,
    '',
    ...facts.map((fact) => `${fact.label}: ${fact.value}`),
    `Website: ${productionOrigin.replace('https://', '')}`,
    `Press contact: ${contactEmail(readEnv())}`,
    '',
    'Short description',
    descriptions.short,
    '',
    'Long description',
    ...descriptions.long.flatMap((paragraph) => [paragraph, '']),
    'Features',
    ...features.map((feature) => `- ${feature}`),
    '',
  ];
  return lines.join('\n');
}

export function buildPressKit(): Buffer {
  return createZip([
    { data: Buffer.from(factSheet(), 'utf8'), name: 'Bigger Fish press kit/Fact sheet.txt' },
    ...pressKitFiles.map((asset) => ({ data: readFileSync(join(publicDir, asset.file)), name: zipPath(asset) })),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const zip = buildPressKit();
  writeFileSync(join(publicDir, pressKitZip), zip);
  console.log(`Press kit: ${pressKitZip} (${(zip.length / 1e6).toFixed(1)} MB, ${pressKitFiles.length + 1} files)`);
}
