// Leonida Platinum Atlas — entry program (Node 22, standard library only).
// Copies app/ and screenshots/ to the output directory and writes
// dossier.json with the vendored make.fun library (vendor/makefun-frontend.ts,
// left byte-for-byte as supplied). Before copying, it validates the trophy
// data (exactly 55 trophies with the official 1/2/6/46 grade split) and
// pre-checks the screenshot count (3-4), so a broken entry fails here
// instead of at the scorer.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- data validation: 55 trophies, official grade distribution ----------
const data = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const trophies = data.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error('trophies.json must contain exactly 55 trophies, found ' + (trophies?.length ?? 'none'));
}
const grades: Record<string, number> = {};
for (const t of trophies) {
  for (const field of ['name', 'description', 'grade', 'guide', 'stage', 'sources']) {
    if (!t[field]) throw new Error('trophy id ' + t.id + ' is missing field ' + field);
  }
  grades[t.grade] = (grades[t.grade] ?? 0) + 1;
}
const expected: Record<string, number> = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
for (const [grade, n] of Object.entries(expected)) {
  if (grades[grade] !== n) throw new Error('grade ' + grade + ': expected ' + n + ', found ' + (grades[grade] ?? 0));
}

// --- screenshot pre-check: 3-4 images ------------------------------------
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f)) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error('screenshots/ must hold 3-4 images, found ' + shots.length);
}

// --- copy and write the dossier -------------------------------------------
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log('dossier written: 55 trophies validated, ' + shots.length + ' screenshots');
