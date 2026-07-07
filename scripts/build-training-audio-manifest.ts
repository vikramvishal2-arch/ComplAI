import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECURITY_LEARNING_SCENES } from '../src/lib/data/security-learning-scenes';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public/training-narration');
mkdirSync(outDir, { recursive: true });

const scenes = Object.entries(SECURITY_LEARNING_SCENES).flatMap(([moduleId, moduleScenes]) =>
  moduleScenes.map((scene) => ({
    moduleId,
    sceneId: scene.id,
    narration: scene.narration,
  }))
);

const manifest = { generatedAt: new Date().toISOString(), scenes };
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest with ${scenes.length} scenes.`);
