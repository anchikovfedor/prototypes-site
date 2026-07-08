#!/usr/bin/env node
// Генерация класс-скоупнутой Paradigm-темы для VKUI из @vkontakte/vkui-tokens.
//
// Зачем: ConfigProvider.tokensClassNames ждёт CSS-классы с токенами
// (как встроенные vkui--vkBase--light в vkui.css), а vkui-tokens поставляет
// paradigmBase/paradigmBaseDark только со скоупом :root. Скрипт берёт
// cssVars/declarations/onlyVariables.css обеих тем, заменяет :root на класс
// и пишет packages/kit/src/theme/paradigm.css (генерируемый файл, не править руками).
//
// Запуск (после обновления @vkontakte/vkui-tokens):
//   node scripts/generate-paradigm-theme.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const themesDir = join(root, 'node_modules', '@vkontakte', 'vkui-tokens', 'themes');
const outFile = join(root, 'packages', 'kit', 'src', 'theme', 'paradigm.css');

const variants = [
  { theme: 'paradigmBase', className: '.vkui--paradigmBase--light' },
  { theme: 'paradigmBaseDark', className: '.vkui--paradigmBase--dark' },
];

const blocks = variants.map(({ theme, className }) => {
  const cssPath = join(themesDir, theme, 'cssVars', 'declarations', 'onlyVariables.css');
  const css = readFileSync(cssPath, 'utf8').trim();
  if (!css.startsWith(':root {')) {
    throw new Error(
      `${cssPath}: ожидался единственный блок ":root { … }", формат пакета изменился`,
    );
  }
  return css.replace(':root {', `${className} {`);
});

const version = JSON.parse(readFileSync(join(themesDir, '..', 'package.json'), 'utf8')).version;

const header = `/*
 * СГЕНЕРИРОВАНО scripts/generate-paradigm-theme.mjs — НЕ ПРАВИТЬ РУКАМИ.
 * Источник: @vkontakte/vkui-tokens@${version}, темы paradigmBase / paradigmBaseDark.
 * Классы подключаются через ConfigProvider.tokensClassNames в PrototypeRoot.
 */
`;

writeFileSync(outFile, `${header}\n${blocks.join('\n\n')}\n`);
console.log(`Записано: ${outFile} (@vkontakte/vkui-tokens@${version})`);
