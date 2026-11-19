// GTA 6 trophy guide, version 3 — the hand-in program.
//
// Node 22, standard library only. It takes the finished guide in this
// repository — the static app under app/ and the screenshots under
// screenshots/ — and hands it to the grader: both folders are copied into
// the output directory, and dossier.json is written there with the vendored
// make.fun library, which is what the judge reads.
//
// Run it outside the grader like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader expects.
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it: the
// scorer rebuilds dossier.json with its own copy and compares byte for byte.
//
// Why version 3 exists: version 2 deleted the output directory itself with
// rmSync(dir, { recursive: true, force: true }) before recreating it. In the
// grader /output is a bind mount, and removing a mount point fails with
// EBUSY ("Device or resource busy"), so the hand-in was rejected. This
// version never touches the output directory itself: it only removes what is
// inside it, one child at a time, and then makes sure the directory exists.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty the output directory without ever removing the directory itself, so
// the call is safe when the directory is a mount point: create it if it is
// missing, then delete each entry inside it and leave the directory in place.
function emptyOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const child of readdirSync(dir)) {
    rmSync(join(dir, child), { recursive: true, force: true });
  }
}

function handInGuide(): void {
  emptyOutputDir(outDir);
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
