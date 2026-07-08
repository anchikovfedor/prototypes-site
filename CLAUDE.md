# CLAUDE.md — Prototypes

Проектный контекст — в [`memory-bank/`](./memory-bank) (projectbrief, techContext,
designContext, conventions). Прочитать перед работой. Файл самодостаточен — личных
глобальных правил не требует.

## Что это

Монорепо кликабельных прототипов на **React + VKUI 8**. Цель — демонстрация анимаций и
переходов между экранами и передача в разработку. Подробно: `memory-bank/projectbrief.md`.

## Правила работы

- Отвечай на русском. Имена переменных/функций/компонентов — на английском.
- **Сначала диагностика, потом правки.** Не меняй код, пока пользователь явно не разрешил;
  делай только то, что попросили, без «улучшений» сверх задачи.
- Если информации недостаточно или возможны несколько интерпретаций — остановись и спроси,
  не выбирай молча.
- **Значения анимации (easing, длительности, задержки, смещения, blur, opacity…) — только из
  таймлайна Figma Motion или спеки дизайнера.** Подставлять «на глаз», по аналогии или из
  памяти запрещено — см. `memory-bank/conventions.md` §«Источник значений анимации».
- Минимум кода под задачу прототипа; без абстракций «на будущее» (см. projectbrief §Границы).

## Среда

- Node только через **nvm**, не в системном PATH. Перед node-командами:
  `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.
- Команды с сетью / установкой пакетов — запускать вне песочницы.

## Команды

```
npm run dev -w apps/<name>        # dev-сервер прототипа (hot reload)
npm run build -w apps/<name>      # production-сборка
npm run typecheck -w apps/<name>  # проверка типов
```

## Конвенции (кратко; полностью — memory-bank/conventions.md)

- Новый прототип — скилл `/new-prototype <имя> <таргет>` (копия `apps/_template` →
  переименовать → `npm install` → строка в `apps/index/src/prototypes.ts`).
- Воркфлоу прототипа — жёсткий гейт: вход (Figma-состояния + Motion-node) → **статика** →
  апрув → **анимация** → ревью. Этапные скиллы: `proto-static` / `proto-animate` /
  `proto-handoff`. Motion-стандарты — скилл `emil-design-eng`, ревью анимаций —
  `review-animations` (вердикт Approve обязателен).
- Прототип **не импортирует** код других прототипов; общее — только из `@proto/kit`.
- Переходы — встроенные VKUI (`View`/`Root`/`Epic`/`ModalRoot`/`SplitLayout`) + `useStack`.
  Framer Motion — точечно для micro-interactions, обязан уважать `prefers-reduced-motion`
  и тумблер Motion из `usePrototypeSettings()`.
- API VKUI 8 сверять по `.d.ts` в `node_modules/@vkontakte/vkui/dist` — не угадывать.
