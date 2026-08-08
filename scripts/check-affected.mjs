import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const baseArgIndex = args.indexOf('--base');
const base =
  baseArgIndex >= 0
    ? args[baseArgIndex + 1]
    : args.find((arg) => arg.startsWith('--base='))?.slice('--base='.length) ??
      process.env.BASE_REF ??
      'origin/main';
const includeExports = args.includes('--exports');
const dryRun = args.includes('--dry-run');

if (!base || base.startsWith('--')) {
  throw new Error('Pass a git ref after --base.');
}

function gitLines(commandArgs) {
  const output = execFileSync('git', commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();

  return output ? output.split('\n').filter(Boolean) : [];
}

function readWorkspace(relativeDir) {
  const packagePath = join(repoRoot, relativeDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

  return {
    dependencies: {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.optionalDependencies,
      ...packageJson.peerDependencies,
    },
    dir: relativeDir,
    name: packageJson.name,
    scripts: packageJson.scripts ?? {},
  };
}

const workspaceDirs = ['apps', 'packages'].flatMap((parent) =>
  readdirSync(join(repoRoot, parent), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(parent, entry.name))
    .filter((dir) => existsSync(join(repoRoot, dir, 'package.json'))),
);
const workspaces = workspaceDirs.map(readWorkspace);
const workspaceByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));

const changedFiles = new Set([
  ...gitLines(['diff', '--name-only', base + '...HEAD']),
  ...gitLines(['diff', '--name-only']),
  ...gitLines(['diff', '--cached', '--name-only']),
  ...gitLines(['ls-files', '--others', '--exclude-standard']),
]);

const fullPortfolioSignals = [
  '.github/',
  'package.json',
  'package-lock.json',
  'scripts/',
  'turbo.json',
];
const affectsAll = [...changedFiles].some((file) =>
  fullPortfolioSignals.some((signal) => file === signal || file.startsWith(signal)),
);
const selected = new Set(
  affectsAll
    ? workspaces.map((workspace) => workspace.name)
    : workspaces
        .filter((workspace) =>
          [...changedFiles].some(
            (file) => file === workspace.dir || file.startsWith(workspace.dir + '/'),
          ),
        )
        .map((workspace) => workspace.name),
);

const queue = [...selected];
while (queue.length) {
  const changedName = queue.shift();

  for (const workspace of workspaces) {
    if (!selected.has(workspace.name) && workspace.dependencies[changedName]) {
      selected.add(workspace.name);
      queue.push(workspace.name);
    }
  }
}

const selectedWorkspaces = [...selected]
  .map((name) => workspaceByName.get(name))
  .filter(Boolean)
  .sort((left, right) => left.name.localeCompare(right.name));
const verifiable = selectedWorkspaces.filter((workspace) => workspace.scripts.verify);

console.log(
  changedFiles.size
    ? 'Changed files considered: ' + changedFiles.size
    : 'No changes found relative to ' + base + '.',
);
console.log(
  verifiable.length
    ? 'Verifying: ' + verifiable.map((workspace) => workspace.name).join(', ')
    : 'No affected workspace exposes a verify script.',
);

function run(command, commandArgs) {
  console.log('\n> ' + [command, ...commandArgs].join(' '));
  if (dryRun) {
    return;
  }

  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const workspace of verifiable) {
  run('npm', ['run', 'verify', '-w', workspace.name]);
}

if (includeExports) {
  for (const workspace of selectedWorkspaces.filter(
    (candidate) => candidate.dir.startsWith('apps/') && candidate.scripts['web:export'],
  )) {
    run('npm', ['run', 'web:export', '-w', workspace.name]);
  }
}
