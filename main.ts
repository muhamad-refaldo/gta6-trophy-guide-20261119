// GTA 6 trophy guide, version 2 — the hand-in program.
//
// Node 22, standard library only. It takes the guide in this repository
// (app/ plus screenshots/) and hands it to the grader: it copies both folders
// into the output directory and writes dossier.json there with the vendored
// make.fun library, which is what the judge reads.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader expects.
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it: the
// scorer rebuilds dossier.json with its own copy and compares byte for byte.

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function freshOutputDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function handInGuide(): void {
  freshOutputDir(outDir);
  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handInGuide();
