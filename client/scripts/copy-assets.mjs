import { cpSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const publicDir = resolve(root, 'public');
const targets = [
  resolve(root, '../src/Our.Umbraco.PersonalAppearance.v17/wwwroot'),
  resolve(root, '../src/Our.Umbraco.PersonalAppearance.v18/wwwroot'),
];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
  mkdirSync(target, { recursive: true });
  cpSync(dist, target, { recursive: true });
  cpSync(publicDir, target, { recursive: true });
  console.log(`Copied client assets -> ${target}`);
}
