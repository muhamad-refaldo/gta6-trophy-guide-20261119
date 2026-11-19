// GTA VI Trophy Case File — entry program.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-frontend.ts. Node 22, standard library only.
//
// The output directory is treated with care: in the grader it is a bind
// mount, so removing the directory itself fails with EBUSY and the run
// fails. This program never removes it — it creates the directory when it
// is missing and clears only the entries inside it, one by one.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The caps the gate holds the entry to: the dossier text cap, at most four
// screenshots of at most 256 KiB each, and the app's file, byte and path
// limits from the bounty rules.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv && fromEnv.length > 0 ? fromEnv : '/output';
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

// Empty a directory without touching the directory itself: list its
// entries and remove each one. Safe on a bind mount, where removing the
// mount point itself would throw EBUSY.
function clearChildren(path: string): void {
  for (const entry of readdirSync(path)) {
    rmSync(join(path, entry), { recursive: true, force: true });
  }
}

function copyTree(source: string, target: string): void {
  ensureDir(target);
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
    }
  }
}

function main(): void {
  const out = outputDir();
  ensureDir(out);
  clearChildren(out);

  const appSource = join(REPO_ROOT, 'app');
  const shotsSource = join(REPO_ROOT, 'screenshots');
  if (!existsSync(appSource) || !statSync(appSource).isDirectory()) {
    throw new Error('main: app/ is missing from the repository');
  }
  copyTree(appSource, join(out, 'app'));
  if (existsSync(shotsSource) && statSync(shotsSource).isDirectory()) {
    copyTree(shotsSource, join(out, 'screenshots'));
  }

  const dossier = buildDossier(out, DOSSIER_CAPS);
  writeFileSync(join(out, 'dossier.json'), dossier);
  console.log(`main: wrote dossier.json (${dossier.length} bytes) to ${out}`);
}

main();
