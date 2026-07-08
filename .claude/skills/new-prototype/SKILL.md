---
name: new-prototype
description: Scaffold a new clickable prototype in this VKUI monorepo — copy apps/_template, rename the package, install deps, and register it in the launcher. Use when the user wants to create or add a new prototype (e.g. "новый прототип", "добавь прототип checkout", "scaffold a prototype").
---

# new-prototype

Создаёт новый прототип по конвенции репозитория (полностью — `memory-bank/conventions.md`).

## Аргументы

- **имя** в kebab-case (обязательно), напр. `checkout-flow`;
- **таргет**: `mobile-app` (дефолт) | `desktop-web` | `adaptive`.

Если пользователь не задал имя или таргет — спроси, не угадывай.

## Шаги

1. Запусти скаффолдер — он копирует `apps/_template`, переименовывает пакет, проставляет
   таргет и ставит зависимости (node не в PATH — скрипт сам подгружает nvm):

   ```
   bash .claude/skills/new-prototype/scaffold.sh <name> <target>
   ```

2. Зарегистрируй прототип в лаунчере: добавь объект в массив `prototypes` в
   `apps/index/src/prototypes.ts` (`dir`, `title`, `description`, `target`,
   `status: 'wip'`). Редактируй через Edit-инструмент, не sed.

3. Проверь: `npm run typecheck -w apps/<name>`, затем `npm run dev -w apps/<name>`.

4. **Зафиксируй вход** перед сборкой экранов: запроси/подтверди Figma node-id на **каждое**
   UI-состояние + Motion-node и впиши их в `apps/<name>/HANDOFF.md` → секция «Источник / вход».
   Узлы из основного файла (не branch/Draft); если не резолвится — переспроси, не угадывай.

5. Напомни про воркфлоу-гейт (`memory-bank/conventions.md`): сначала **статика** всех
   состояний без анимации → **апрув пользователя** → только потом **анимация** → **ревью**
   скиллом `review-animations`. Заполнить остальной `HANDOFF.md` перед передачей.

Шаблон уже включает dev-only фидбек-тулбар `agentation` (`import.meta.env.DEV` в `App.tsx`,
в прод не попадает) — на пробе; в новых прототипах он появляется автоматически.

## Не делай

- Не дублируй настройку VKUI/темы — она в `@proto/kit`.
- Не импортируй в прототип код других прототипов.
- Не начинай анимацию до апрува статики.
- **Не рисуй рамку устройства** (мокап телефона вокруг прототипа) — ни в прототипе, ни в
  ките. Прототип занимает весь вьюпорт; `PhoneFrame` из `@proto/kit` удалён намеренно
  (см. `memory-bank/conventions.md` §Таргеты).
