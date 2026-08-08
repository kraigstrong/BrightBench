import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(readFileSync(resolve(appRoot, 'package.json'), 'utf8'));
const appJson = JSON.parse(readFileSync(resolve(appRoot, 'app.json'), 'utf8')).expo;
const xcodeProject = readFileSync(
  resolve(appRoot, 'ios/TimeTutor.xcodeproj/project.pbxproj'),
  'utf8',
);

function uniqueMatches(pattern) {
  return [...new Set([...xcodeProject.matchAll(pattern)].map((match) => match[1]))];
}

const xcodeVersions = uniqueMatches(/MARKETING_VERSION = ([^;]+);/g);
const xcodeBuilds = uniqueMatches(/CURRENT_PROJECT_VERSION = ([^;]+);/g);
const expectedVersion = packageJson.version;
const expectedBuild = String(appJson.ios.buildNumber);
const errors = [];

if (appJson.version !== expectedVersion) {
  errors.push(
    'app.json version ' + appJson.version + ' does not match package.json ' + expectedVersion,
  );
}
if (xcodeVersions.length !== 1 || xcodeVersions[0] !== expectedVersion) {
  errors.push(
    'Xcode MARKETING_VERSION values (' +
      (xcodeVersions.join(', ') || 'missing') +
      ') do not match ' +
      expectedVersion,
  );
}
if (xcodeBuilds.length !== 1 || xcodeBuilds[0] !== expectedBuild) {
  errors.push(
    'Xcode CURRENT_PROJECT_VERSION values (' +
      (xcodeBuilds.join(', ') || 'missing') +
      ') do not match app.json build ' +
      expectedBuild,
  );
}

const audioDir = resolve(appRoot, 'assets/audio/ui');
const audioFiles = readdirSync(audioDir).filter((file) => file.endsWith('.mp3'));
const credits = readFileSync(resolve(audioDir, 'CREDITS.md'), 'utf8').trim();
if (!audioFiles.length) {
  errors.push('No release audio files were found.');
}
if (!credits) {
  errors.push('Audio credits are empty.');
}
const uncreditedAudio = audioFiles.filter((file) => !credits.includes('`' + file + '`'));
if (uncreditedAudio.length) {
  errors.push('Audio credits do not name: ' + uncreditedAudio.join(', '));
}

if (errors.length) {
  console.error('Time Tutor release metadata failed:');
  for (const error of errors) {
    console.error('- ' + error);
  }
  process.exit(1);
}

console.log(
  'Time Tutor release metadata is consistent: v' +
    expectedVersion +
    ' build ' +
    expectedBuild +
    '; ' +
    audioFiles.length +
    ' credited UI audio files.',
);
console.log(
  'Human gates remain: physical-device audio/haptics, privacy/legal review, release notes, and App Store submission.',
);
