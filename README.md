# Prototypes

Кликабельные прототипы на **React + VKUI**: показывают правильные анимации и переходы между
экранами, чтобы передавать их сразу в разработку.

Контекст проекта — в [`memory-bank/`](./memory-bank): зачем (projectbrief), стек и запуск
(techContext), токены/Figma (designContext), конвенции (conventions), текущее состояние и
следующие шаги (progress).

## Онбординг дизайнера (с нуля)

1. **Node через nvm.** Установи [nvm](https://github.com/nvm-sh/nvm), затем в корне репо:
   `nvm install` (версия берётся из `.nvmrc`). Node не обязан быть в системном PATH —
   скиллы и скрипты подгружают nvm сами.
2. **Зависимости:** `npm install` — один раз в корне (монорепо, npm workspaces).
3. **Claude Code:** установи [Claude Code](https://claude.com/claude-code) (CLI или
   десктоп-приложение). Скиллы воркфлоу уже в репо (`.claude/skills/`), подхватятся сами.
4. **Figma MCP (обязательно для воркфлоу):** подключи Figma-коннектор к Claude
   (claude.ai → Settings → Connectors → Figma). Без него не работает главное правило проекта —
   «значения анимаций берутся только из Figma Motion, не на глаз».
5. **Первый прототип:** в Claude Code набери `/new-prototype <имя> <таргет>` — скилл скопирует
   шаблон, поставит зависимости и подскажет следующий шаг.
6. **Воркфлоу** (жёсткие гейты, детали — `memory-bank/conventions.md`):
   вход (Figma-состояния + Motion-node) → **статика** (`proto-static`) → апрув →
   **анимация** (`proto-animate`) → **ревью** (`/review-animations`, нужен вердикт Approve) →
   **передача** (`proto-handoff`).

> Файлы фирменных шрифтов (VK Sans Display) не хранятся в git — проприетарные. Есть доступ —
> положи `.ttf` в `apps/<name>/public/fonts/`; без них прототипы работают на системном шрифте.
> Детали: `memory-bank/conventions.md` §«Шрифты и рендеринг».

## Быстрый старт

```bash
npm install                       # один раз
npm run dev -w apps/reference     # запустить эталонный прототип
```

Открой адрес из вывода Vite (обычно http://localhost:5173). Внизу справа — dev-панель:
переключение платформы (iOS / Android / VKCOM), темы (light / dark) и анимаций (Motion).

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
