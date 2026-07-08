#!/usr/bin/env node
// Сборка единого статического сайта для публичного деплоя.
//
// Модель: лаунчер apps/index собирается в корень сайта, каждый прототип — в подпапку
// со своим base. Префикс сайта задаётся через env SITE_BASE (дефолт '/'): для
// кастомного домена — корень '/', для GitHub Pages проектного репо — '/<repo>/'
// (например '/prototypes/'). base передаётся флагом vite build, поэтому vite.config
// приложений не трогаем и dev-режим не затрагивается.

import { execFileSync } from 'node:child_process';
import { readdirSync, rmSync, mkdirSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = join(root, 'apps');
const outDir = join(root, 'dist');

const apps = readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Префикс пути сайта. Кастомный домен — '/', GitHub Pages подпапка — '/<repo>/'.
const cleaned = (process.env.SITE_BASE ?? '/').replace(/^\/+|\/+$/g, '');
const sitePrefix = cleaned ? `/${cleaned}/` : '/';

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of apps) {
  // index — корень сайта, остальные приложения — подпапка с тем же именем.
  const base = name === 'index' ? sitePrefix : `${sitePrefix}${name}/`;
  console.log(`\n▸ build ${name} (base ${base})`);

  execFileSync('npm', ['run', 'build', '-w', `apps/${name}`, '--', `--base=${base}`], {
    cwd: root,
    stdio: 'inherit',
  });

  const appDist = join(appsDir, name, 'dist');
  if (!existsSync(appDist)) {
    throw new Error(`нет dist после сборки apps/${name}`);
  }

  const dest = name === 'index' ? outDir : join(outDir, name);
  cpSync(appDist, dest, { recursive: true });
}

// GitHub Pages: не прогонять артефакт через Jekyll (иначе папка _template с ведущим '_'
// игнорируется).
writeFileSync(join(outDir, '.nojekyll'), '');

console.log(`\n✓ сайт собран в ${outDir}`);
