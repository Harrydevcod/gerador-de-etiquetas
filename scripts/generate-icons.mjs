import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const buildDir = join(root, 'build');
const svgBuf = readFileSync(join(buildDir, 'icon.svg'));

mkdirSync(buildDir, { recursive: true });

await Promise.all([
  sharp(svgBuf).resize(256, 256).png().toFile(join(buildDir, 'icon.png')),
  sharp(svgBuf).resize(64,  64 ).png().toFile(join(buildDir, 'icon-64.png')),
  sharp(svgBuf).resize(32,  32 ).png().toFile(join(buildDir, 'icon-32.png')),
  sharp(svgBuf).resize(16,  16 ).png().toFile(join(buildDir, 'icon-16.png')),
]);

console.log('✓ build/icon.png (256 · 64 · 32 · 16) gerado com sucesso');
