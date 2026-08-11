#!/usr/bin/env node
// Регистрирует прототип в apps/index/src/prototypes.ts (идемпотентно).
// usage: node register.mjs <kebab-name> [mobile-app|desktop-web|adaptive]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [name, target = 'mobile-app'] = process.argv.slice(2);
if (!name) {
  console.error('usage: register.mjs <kebab-name> [target]');
  process.exit(1);
}

const file = join(dirname(fileURLToPath(import.meta.url)), '../../../apps/index/src/prototypes.ts');
const src = readFileSync(file, 'utf8');

if (src.includes(`dir: '${name}'`)) {
  console.log(`launcher: apps/${name} уже в prototypes.ts — пропускаю`);
  process.exit(0);
}

const entry = `  {
    dir: '${name}',
    title: '${name}',
    description: 'TODO: короткое описание прототипа',
    target: '${target}',
    status: 'wip',
  },
`;

const idx = src.lastIndexOf('];');
if (idx === -1) {
  console.error('register: не нашёл закрывающую «];» в prototypes.ts — допиши запись вручную');
  process.exit(1);
}
writeFileSync(file, src.slice(0, idx) + entry + src.slice(idx));
console.log(`launcher: apps/${name} зарегистрирован (title/description — поправить)`);
