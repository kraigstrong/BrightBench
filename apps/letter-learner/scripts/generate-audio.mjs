import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EdgeTTS } from 'node-edge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const contentPath = path.join(__dirname, 'audio-content.json');
const audioRoot = path.join(appRoot, 'assets', 'audio');

const force = process.argv.includes('--force');
const voice = process.env.LETTER_LEARNER_TTS_VOICE ?? 'en-US-AriaNeural';

const tts = new EdgeTTS({
  voice,
  lang: 'en-US',
  outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
  pitch: '+0%',
  rate: '-8%',
  volume: '+0%',
  timeout: 20000,
});

const groupFolders = {
  name: 'names',
  sound: 'sounds',
  digraph: 'digraphs',
  ui: 'ui',
};

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 1500;

function destinationForKey(key) {
  const [group, id] = key.split(':');
  const folder = groupFolders[group];

  if (!folder || !id) {
    throw new Error(`Invalid audio key: ${key}`);
  }

  return path.join(audioRoot, folder, `${id}.mp3`);
}

async function fileExists(filepath) {
  try {
    await stat(filepath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const entries = JSON.parse(await readFile(contentPath, 'utf8'));
  let generated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const filepath = destinationForKey(entry.key);
    await mkdir(path.dirname(filepath), { recursive: true });

    if (!force && (await fileExists(filepath))) {
      skipped += 1;
      continue;
    }

    process.stdout.write(`Generating ${entry.key}... `);
    await generateWithRetry(entry.text, filepath);
    generated += 1;
    process.stdout.write('done\n');
  }

  process.stdout.write(`Audio complete: ${generated} generated, ${skipped} skipped.\n`);
}

async function generateWithRetry(text, filepath) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await tts.ttsPromise(text, filepath);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) {
        break;
      }

      process.stdout.write(`retry ${attempt}/${MAX_ATTEMPTS - 1}... `);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }

  throw lastError;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
