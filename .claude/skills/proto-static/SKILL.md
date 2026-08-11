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

0. **Гейт шрифтов.** Если дизайн использует кастомный шрифт (VK Sans Display и т.п.) —
   проверь, что файлы лежат в `apps/<name>/src/fonts/` (`ls apps/<name>/src/fonts/*.ttf`).
   Их нет в git (проприетарные); при отсутствии браузер **молча** падает на системный
   стек — сверять статику с таким рендером нельзя. Файлов нет → остановись и попроси
   пользователя положить их (где взять — README §«Перед первым прототипом»). Быстрая
   самопроверка окружения целиком: `node scripts/doctor.mjs`.
1. **Геометрия/токены — только из Figma MCP** (`get_design_context` / `get_metadata` /
   `get_variable_defs`) по узлам из HANDOFF.md. Состояния брать из **рендер-макетов**, не
   реконструировать из initial-кадра Motion-анимации — геометрия плывёт.
2. **Собери все состояния статично.** Никаких `transition`/`animation`/Framer Motion.
   Переключение состояний на этом этапе — мгновенное (клик без анимации).
3. Шрифты и рендеринг — по `memory-bank/conventions.md` §«Шрифты и рендеринг»:
   `-webkit-font-smoothing: antialiased`, кастомные шрифты в `src/fonts/` + `fonts.css`
   с **относительным** `url('./fonts/…')` (не `public/` и не абсолютный `/fonts/…` — на
   подпапочном base будет 404), на акцентных текстах семейство задавать явно.
> **Делегирование.** Шаги 4–5 (скриншот-сверка + CDP-замеры) выполняет субагент
> `proto-static-verify`: собери манифест состояний `[{state, figmaNodeId, url, width,
> height}]` из HANDOFF.md §Источник/вход и делегируй ему (Agent tool,
> `subagent_type: proto-static-verify`). Процедура ниже — источник истины для субагента;
> апрув (§Выход) остаётся в основном треде.

4. **Скриншот-сверка (обязательно), для каждого состояния:**
   - эталон — `get_screenshot` узла из Figma;
   - реализация — headless Chrome с dev-сервера на **той же ширине**:
     ```
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --no-sandbox --force-device-scale-factor=2 \
       --window-size=W,H --screenshot=out.png --virtual-time-budget=4000 URL
     ```
   - сравнить обе картинки визуально (Read), не работать вслепую.
   - На Linux/WSL (Windows-окружение) Chrome рендерит текст иначе, чем macOS
     (freetype ≠ CoreText): сверяй **геометрию** (позиции, размеры, отступы), а не
     начертание глифов; путь к Chrome там свой (см. README §Windows).
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

- Не сверяй скриншоты, пока не пройден шаг 0 (шрифты): фоллбэк молчаливый и внешне похож.
- Не начинай анимацию и не добавляй transition «заодно» — это следующая фаза.
- Не подставляй размеры/цвета/отступы «на глаз» — только Figma MCP / токены VKUI.
- API VKUI 8 сверяй по `.d.ts` в `node_modules/@vkontakte/vkui/dist`, не по памяти.
