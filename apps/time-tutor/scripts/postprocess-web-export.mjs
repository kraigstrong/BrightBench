import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const directoryRoutes = ['privacy', 'support'];

async function ensureFile(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}

async function main() {
  for (const route of directoryRoutes) {
    const sourcePath = path.join(distDir, `${route}.html`);
    const targetDir = path.join(distDir, route);
    const targetPath = path.join(targetDir, 'index.html');

    if (!(await ensureFile(sourcePath))) {
      throw new Error(`Expected exported file to exist: ${sourcePath}`);
    }

    await mkdir(targetDir, { recursive: true });
    await copyFile(sourcePath, targetPath);
  }
}

await main();
