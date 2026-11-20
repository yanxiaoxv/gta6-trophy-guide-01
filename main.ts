// Leonida Platinum Atlas — entry program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// What this program does, and nothing more:
//   1. Copies the finished static guide from app/ and the maker's screenshots from screenshots/
//      into the output directory (MAKEFUN_OUTPUT_DIR locally, /output in the grader).
//   2. Sanity-checks the trophy data before handing in: app/data/trophies.json must parse and
//      carry 55 trophies, each with a non-blank guide, so a broken data file fails here loudly
//      instead of failing the sealed gate quietly.
//   3. Writes dossier.json with buildDossier from vendor/makefun-frontend.ts, byte for byte the
//      library the scorer uses — that file is vendored unchanged on purpose.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const EXPECTED_TROPHY_COUNT = 55;

function checkTrophyData(): number {
  const dataPath = join(repoRoot, 'app', 'data', 'trophies.json');
  const parsed = JSON.parse(readFileSync(dataPath, 'utf8'));
  const trophies = Array.isArray(parsed) ? parsed : parsed.trophies;
  if (!Array.isArray(trophies)) throw new Error('trophies.json: no trophies array found');
  if (trophies.length !== EXPECTED_TROPHY_COUNT) {
    throw new Error(`trophies.json: expected ${EXPECTED_TROPHY_COUNT} trophies, found ${trophies.length}`);
  }
  for (const trophy of trophies) {
    if (typeof trophy.name !== 'string' || trophy.name.trim() === '') {
      throw new Error('trophies.json: a trophy is missing its official name');
    }
    if (typeof trophy.guide !== 'string' || trophy.guide.trim() === '') {
      throw new Error(`trophies.json: trophy "${trophy.name}" has no guide`);
    }
  }
  return trophies.length;
}

// The gate wants 3 or 4 screenshots, the first by name being the cover. Count them here so a
// missing or extra screenshot fails this run with a clear message instead of a scorer detail.
function checkScreenshots(): number {
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(shotsDir)) throw new Error('screenshots/: directory is missing');
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith('.') && /\.(png|jpe?g)$/i.test(name));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`screenshots/: expected 3 or 4 images, found ${shots.length}`);
  }
  return shots.length;
}

const trophyCount = checkTrophyData();
const screenshotCount = checkScreenshots();

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Leonida Platinum Atlas handed in: ${trophyCount} trophies, ${screenshotCount} screenshots, dossier written to ${outputDir}`);
