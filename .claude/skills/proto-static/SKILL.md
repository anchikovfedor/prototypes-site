---
name: proto-static
description: Static phase of the prototype workflow — build every UI state with zero animation, verify 1:1 against Figma via headless-Chrome screenshots, then request user approval (the hard gate before animation). Use when starting layout work on a prototype or when the user says "статика", "собери вёрстку/состояния", "сверь с макетом".
---

# proto-static — фаза «Статика»

Шаг 2 воркфлоу (`memory-bank/conventions.md` §«Воркфлоу реализации»): вёрстка всех состояний
**без анимаций и переходов** → скриншот-сверка → **апрув пользователя**. Жёсткий гейт: до
апрува статики анимацию не начинать.

## Пререквизит

В `apps/<name>/HANDOFF.md` §«Источник / вход» зафиксированы Figma node-id **каждого**
UI-состояния + Motion-node, и они резолвятся через Figma MCP. Если нет — остановись и
зафиксируй вход (шаг 4 скилла `new-prototype`), не угадывай и не подставляй старые node-id.

## Шаги

1. **Геометрия/токены — только из Figma MCP** (`get_design_context` / `get_metadata` /
   `get_variable_defs`) по узлам из HANDOFF.md. Состояния брать из **рендер-макетов**, не
   реконструировать из initial-кадра Motion-анимации — геометрия плывёт.
2. **Собери все состояния статично.** Никаких `transition`/`animation`/Framer Motion.
   Переключение состояний на этом этапе — мгновенное (клик без анимации).
3. Шрифты и рендеринг — по `memory-bank/conventions.md` §«Шрифты и рендеринг»:
   `-webkit-font-smoothing: antialiased`, кастомные шрифты в `public/fonts/` + `fonts.css`,
   на акцентных текстах семейство задавать явно.
4. **Скриншот-сверка (обязательно), для каждого состояния:**
   - эталон — `get_screenshot` узла из Figma;
   - реализация — headless Chrome с dev-сервера на **той же ширине**:
     ```
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --no-sandbox --force-device-scale-factor=2 \
       --window-size=W,H --screenshot=out.png --virtual-time-budget=4000 URL
     ```
   - сравнить обе картинки визуально (Read), не работать вслепую.
5. **Расхождения мерить через CDP**, не подгонять на глаз: Chrome с
   `--remote-debugging-port`, WebSocket + `Runtime.evaluate` → `getBoundingClientRect`
   (позиции/размеры) и `getComputedStyle` (какой токен/правило перебивает). Грабли: вкладка
   из `/json/new?URL` уже грузит URL — **не** звать `Page.navigate` повторно; значение — в
   `msg.result.result.value`.
6. `npm run typecheck -w apps/<name>` — зелёный.

## Выход (гейт)

- Показать пользователю сравнения скриншотов по всем состояниям и **запросить апрув статики**.
- Чекбокс «Статика заапрувлена» в `HANDOFF.md` §«Статус фаз» отмечать **только после явного
  апрува** пользователя.
- Дальше — фаза анимации: скилл `proto-animate`.

## Не делай

- Не начинай анимацию и не добавляй transition «заодно» — это следующая фаза.
- Не подставляй размеры/цвета/отступы «на глаз» — только Figma MCP / токены VKUI.
- API VKUI 8 сверяй по `.d.ts` в `node_modules/@vkontakte/vkui/dist`, не по памяти.
