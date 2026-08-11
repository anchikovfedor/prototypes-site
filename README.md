# Prototypes

Кликабельные прототипы на **React + VKUI**: показывают правильные анимации и переходы между
экранами, чтобы передавать их сразу в разработку.

Контекст проекта — в [`memory-bank/`](./memory-bank): зачем (projectbrief), стек и запуск
(techContext), токены/Figma (designContext), конвенции (conventions), текущее состояние и
следующие шаги (progress).

## Онбординг дизайнера (с нуля)

Чек-лист «Перед первым прототипом». После установки — самопроверка окружения одной
командой: `node scripts/doctor.mjs`.

**Софт:**

1. **Node через nvm.** Установи [nvm](https://github.com/nvm-sh/nvm), затем в корне репо:
   `nvm install` (версия берётся из `.nvmrc`). Node не обязан быть в системном PATH —
   скиллы и скрипты подгружают nvm сами.
2. **Зависимости:** `npm install` — один раз в корне (монорепо, npm workspaces).
3. **Google Chrome** — обязателен для фазы статики: `proto-static` сверяет вёрстку с Figma
   headless-скриншотами.
4. **`gh` CLI** ([cli.github.com](https://cli.github.com)) + `gh auth login` — нужен на
   фазе передачи (`proto-handoff` проверяет деплой).
5. **Агент:** [Claude Code](https://claude.com/claude-code) (CLI или десктоп). Скиллы
   воркфлоу уже в репо (`.claude/skills/`), разрешения на частые команды — в
   `.claude/settings.json`, подхватятся сами. Работаешь в Codex — точка входа `AGENTS.md`.
6. **Figma MCP (обязательно для воркфлоу):** подключи Figma-коннектор к Claude
   (claude.ai → Settings → Connectors → Figma). Без него не работает главное правило проекта —
   «значения анимаций берутся только из Figma Motion, не на глаз».

**Доступы (запросить у владельца репо — @anchikovfedor):**

- push-права в этот репозиторий (ветка на прототип → PR);
- доступ к продуктовым Figma-файлам — ссылки из `apps/<name>/HANDOFF.md` должны резолвиться;
- файлы шрифта **VK Sans Display** (`.ttf`) — проприетарные, в git не хранятся: положи в
  `apps/<name>/src/fonts/`; без них прототипы **молча** работают на системном шрифте
  (детали: `memory-bank/conventions.md` §«Шрифты и рендеринг»).

**Первый прототип:** в Claude Code набери `/new-prototype <имя> <таргет>` — скилл скопирует
шаблон, поставит зависимости и зарегистрирует прототип в лаунчере. Дальше воркфлоу
(жёсткие гейты, детали — `memory-bank/conventions.md`):
вход (Figma-состояния + Motion-node) → **статика** (`proto-static`) → апрув →
**анимация** (`proto-animate`) → **ревью** (`/review-animations`, нужен вердикт Approve) →
**передача** (`proto-handoff`).

### Windows

Работаем из **WSL2** (Ubuntu) — нативные Windows-шеллы не потянут скиллы (bash, rsync,
BSD-совместимые команды). Внутри WSL: nvm/node, `npm install`, Linux-Chrome
(`google-chrome`), `.ttf` — в файловой системе WSL. Оговорка про скриншот-сверку:
Linux-Chrome рендерит текст иначе, чем macOS (freetype ≠ CoreText) — сверяй **геометрию**,
а не начертание глифов. iOS-часть нативного трека без Mac недоступна (симулятор и сборка —
только macOS).

## Быстрый старт

```bash
npm install                       # один раз
npm run dev -w apps/reference     # запустить эталонный прототип
```

Открой адрес из вывода Vite (обычно http://localhost:5173). Внизу справа — dev-панель:
переключение платформы (iOS / Android / VKCOM), темы (light / dark) и анимаций (Motion).

> Корневой `npm run dev` (без `-w`) поднимает **лаунчер** (`apps/index`) — это каталог
> прототипов для задеплоенного сайта; локально ссылки из него не работают. Конкретный
> прототип запускай его собственным dev-сервером: `npm run dev -w apps/<name>`.

## Структура

```
packages/kit   — общий слой: тема, провайдеры (PrototypeRoot), шеллы, dev-панель, useStack
apps/index     — лаунчер со списком прототипов
apps/_template — шаблон для нового прототипа
apps/reference — эталон: табы + push + модальная шторка + Framer Motion
```

## Команды

```bash
npm run dev -w apps/<name>        # dev-сервер прототипа (hot reload)
npm run build -w apps/<name>      # production-сборка
npm run typecheck -w apps/<name>  # проверка типов
npm run build                     # собрать все приложения
```

## Новый прототип

Основной путь — скилл `/new-prototype <имя> <таргет>` в Claude Code. Вручную — см.
[`memory-bank/conventions.md`](./memory-bank/conventions.md): скопировать `apps/_template`,
переименовать в `package.json`, `npm install`, дописать строку в `apps/index/src/prototypes.ts`.

## Совместная работа

Ветка на прототип → PR в `main`. Прототипы изолированы (`apps/<name>`), поэтому конфликты
почти исключены; общие точки — `apps/index/src/prototypes.ts` и `package-lock.json`
(лечится rebase + `npm install`). Общий слой (`packages/kit`, `.claude/skills/`,
`memory-bank/`) меняется через ревью владельца.

## Передача в разработку

Прототип на стеке продукта (React + VKUI), переносится визуально-анимационный слой. Детали и
тайминги — в `apps/<name>/HANDOFF.md`. Прототип не содержит бэкенда/реального стейта — это
демонстрация поведения, а не готовый продакшн.
