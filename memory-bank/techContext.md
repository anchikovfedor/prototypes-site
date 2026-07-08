# Tech Context

## Стек

- **React 19** + **TypeScript 5** + **Vite 8**.
- **VKUI 8** (`@vkontakte/vkui` 8.3.0) + `@vkontakte/icons` 3.60.
- **Framer Motion 12** — для кастомных micro-interactions (опционально, в конкретном прототипе).
- **react-router-dom 7** — заявлен в `@proto/kit` для будущего url-deep-linking (см. ниже).

## Среда

- Node ставится через **nvm** (Node 24 LTS). Node не в системном PATH — в скриптах/CI
  при необходимости подгружать nvm: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.

## Монорепо (npm workspaces)

```
packages/kit   — общий слой: тема VKUI, провайдеры, шеллы под таргеты, dev-переключатель, useStack
apps/_template — шаблон прототипа (копируется под новый)
apps/index     — лаунчер со списком прототипов
apps/<name>    — отдельные прототипы (свой package.json, свой dev-сервер)
```

- `@proto/kit` подключается как workspace-пакет с исходниками на TS. В каждом приложении
  `vite.config.ts` содержит `optimizeDeps.exclude: ['@proto/kit']`, чтобы Vite транспилировал
  kit на лету как код проекта.
- CSS подключается сайд-эффектом внутри `packages/kit/src/index.ts`
  (`import './theme/theme.css'`), который `@import`-ит `@vkontakte/vkui/dist/vkui.css`.

## Запуск

```
npm install                      # один раз в корне
npm run dev -w apps/reference    # конкретный прототип на localhost
npm run build -w apps/<name>     # сборка одного прототипа
npm run typecheck -w apps/<name> # проверка типов
npm run build:site               # единый статический сайт в dist/ (для деплоя)
```

## Деплой (публичная ссылка)

Единый статический сайт: `scripts/build-site.mjs` (`npm run build:site`) билдит каждый workspace
`apps/*` с нужным `--base` (index → корень, прототип → `/<name>/`) и склеивает в один `dist/`:
лаунчер в корень, прототипы в подпапки (совпадает с `href` из `prototypes.ts`). База передаётся
**флагом сборки** через env `SITE_BASE` (дефолт `/`); `vite.config` приложений не трогается, dev не
затрагивается. Скрипт пишет `.nojekyll` (нужно для GitHub Pages, чтобы не срезалась папка `_template`).

**Текущее решение хостинга — GitHub Pages через отдельный ПУБЛИЧНЫЙ site-репо** (реализовано в
`.github/workflows/deploy.yml`, закоммичено, **сайт live** —
`https://anchikovfedor.github.io/prototypes-site/`; ход миграции в progress.md → «Миграция … ВЫПОЛНЕНО»).
Ветка `main` того же публичного репо — **зеркало каркаса для дизайнеров** (kit, публичные
прототипы, скиллы, memory-bank; обновляется вручную `scripts/export-public.mjs`), `gh-pages` —
только билд сайта.

- **Причина выбора:** критерий — бесплатно, доступно всей команде, исходники остаются в
  приватном репо. Vercel и Cloudflare Pages не подошли (доступность для команды + ограничения
  бесплатных планов), см. «Отвергнутые варианты» ниже.
- **Модель (Model B, «build-then-publish»):** исходники в приватном `anchikovfedor/prototypes`;
  GitHub Actions на push в `main` → `npm run build:site` c `SITE_BASE=/prototypes-site/`
  → `peaceiris/actions-gh-pages@v4` пушит **только** `dist/` в ветку `gh-pages` публичного
  `anchikovfedor/prototypes-site`; на нём включён Pages. Публичен лишь билд (тот же клиентский код,
  что и так отдаётся браузеру); sourcemaps у Vite по умолчанию **off** → TS-исходники не утекают.
- **URL:** `https://anchikovfedor.github.io/prototypes-site/`.
- **Доступ:** SSH deploy key — приватный ключ в secret `ACTIONS_DEPLOY_KEY` (приватный репо),
  публичный — deploy key с write в `prototypes-site`. Настройка репо/ключа/secret/Pages делалась
  через **`gh` CLI** (scope `repo`).
- **Первый деплой — медленный (важно):** первый в жизни деплой нового Pages-репо провижинит
  CDN/DNS и может идти **до ~15–20 мин** (внутренний job `deploy` висит `in_progress`, хотя
  Actions-сборка и Pages-`build` зелёные, а контент уже в `gh-pages`). **НЕ отменять прогон** —
  cancel сбрасывает провижининг и удлиняет ожидание. Обычные Pages-`build` этого репо — 7–14 мин.
- **Legacy Pages-`build` бывает нестабилен:** билд может упасть с generic «Page build failed.»
  или зависнуть в `building` на десятки минут — контент обычно ни при чём. Лечение — **не ждать
  смерти зависшего билда**: `gh api -X POST repos/anchikovfedor/prototypes-site/pages/builds`
  **вытесняет его** (старый сразу `errored`, новый стартует). Если зависания станут
  регулярными — план Б: перевести Pages на `build_type=workflow`
  (`actions/upload-pages-artifact` + `actions/deploy-pages`); workflow-файл придётся класть
  в `dist/` через `build-site.mjs`, т.к. пуш идёт в `gh-pages`.
- **Пуш без изменений `dist/` не деплоится — это норма:** peaceiris при неизменном контенте не
  создаёт коммит в `gh-pages` («nothing to commit», прогон зелёный) → Pages-`build` не
  запускается, live остаётся прежним. Не путать с пропавшим деплоем.
- **Проверять деплой по контенту, не только по «success».** После пуша Actions-job зеленеет
  быстро, но **CDN Pages ещё несколько минут отдаёт прошлый hashed-бандл** (публичный URL — старый
  `index-*.js`), пока Pages-`build` не станет `built`. Сверять: HEAD ветки `gh-pages` = наш коммит
  (`gh api …/commits/gh-pages`) **и** сменился ли hash JS на публичном URL — а не только `gh run`.
- **Важно про base:** абсолютные литералы к public-ассетам в JS (`'/photos/x.png'`) Vite при
  подпапочном `base` **не переписывает** (в отличие от HTML и CSS `url()`) — на подпапке они 404-ят.
  Для таких ссылок использовать `import.meta.env.BASE_URL`. Именно из-за этого в `documents-css`
  фото были убраны (см. progress.md).

### Отвергнутые варианты хостинга (почему не они)

- **Vercel** — прежний хостинг; `vercel.json` удалён из репо (2026-07-02): Hobby-план запрещает
  коммерческое использование + доступность для команды. GitHub App Vercel отвязан от репо
  (2026-07-03) — до этого бот падал красным «Failed to deploy» на каждом пуше.
- **Cloudflare Pages** — не подошёл по доступности для команды; интеграция GitHub App
  отозвана (2026-07-03).
- **GitHub Pages из приватного репо напрямую** — требует платный GitHub Pro (на Free — только
  публичные репо). Поэтому и выбран обход через отдельный публичный `prototypes-site`.
- **VK Cloud Object Storage** (S3 static, платный) — отклонён по критерию «только бесплатное».

## Навигация и переходы

- Переходы между экранами — **встроенные в VKUI**, на CSS:
  - `View` (`activePanel` + `history`) — push/back между панелями;
  - `Root` (`activeView`) — переключение стеков View;
  - `Epic` (`activeStory` + `tabbar`) — табы;
  - `ModalRoot` + `ModalPage`/`ModalCard` — модалки и шторки;
  - `SplitLayout` + `SplitCol` — многоколоночный большой экран.
- `kit.useStack(initial)` — стек экранов (history + push/back/reset) для `View`.
  Даёт корректные push/back переходы из коробки, без URL.
- Тумблер анимаций: `ConfigProvider.transitionMotionEnabled` (управляется dev-панелью и
  стартует от `prefers-reduced-motion`).

### Планируемое улучшение: url-deep-linking
`react-router-dom` уже в зависимостях `kit`. Когда понадобится адресация конкретного
экрана по URL и браузерная «назад» внутри прототипа — добавить в `kit` обёртку
`useRoutedStack` (синхронизация стека с `useLocation`/`useNavigationType`). Пока не
реализовано осознанно (Simplicity First): на уровне прототипа URL уже уникален.

## Стратегия анимаций: CSS (VKUI) vs Framer Motion

- **По умолчанию — VKUI/CSS.** Все переходы между экранами уже анимированы VKUI; это и есть
  то, что переносится в продакшн без переписывания.
- **Framer Motion — точечно**, для micro-interactions, которых нет в VKUI (пружины, жесты,
  layout-анимации). Пример: `apps/reference/src/components/LikeButton.tsx`.
- Framer-анимации обязаны уважать `prefers-reduced-motion` (`useReducedMotion`) и тумблер
  Motion из `usePrototypeSettings()`.

## Жесты (touch/pointer)

- **VKUI `Touch`** (`@vkontakte/vkui`) — жестовый примитив дизайн-системы (им VKUI делает свой
  swipeBack). `onStart`/`onMoveX`/`onEnd` дают `startX`/`shiftX`/`shiftXAbs`/`duration`; работает и
  мышью, и тачем. Предпочтителен перед Framer Motion, когда жест нужен «в вебвью» без новых
  зависимостей. Пример — edge-swipe закрытия в `documents-css` (см. progress.md).
  - **Грабли:** `gesture.shiftX`/`clientX` пишутся **только пока навешен** `onMoveX`/`onMove`
    (гейт по `isSlide`, `Touch.js:109,117`). Читаешь сдвиг в `onEnd` — всё равно нужен `onMove*`
    (пусть **пустой**), иначе там `0`.
  - **Одна точка** — мультитача/`scale` нет. Для **pinch** не годится (нужны сырые touch-события /
    WebKit `gesturechange` / `wheel`+`ctrlKey`).
- **Pinch в мобильном Safari зарезервирован** (pinch-in → зум-аут → обзор вкладок) и надёжно из
  страницы **не отключается** (iOS игнорит `user-scalable=no`/`maximum-scale`; `gesturestart`+
  `preventDefault` хрупкий; обзор вкладок — на уровне хрома). Кастомный pinch работает в **WKWebView**
  (нет вкладок Safari, хост гасит зум) и на десктоп-**трекпаде** — но не в браузерном Safari.

## Зафиксированные решения (почему так)

- **VKUI 8 + react-router-dom**, а не `@vkontakte/vk-mini-apps-router`: VK-роутер (последний
  1.8.4) поддерживает только VKUI ≤7 и тянет `vk-bridge`. Остаёмся на последнем VKUI 8; для
  URL-навигации, когда понадобится, берём нейтральный react-router (он же ближе команде при
  передаче). Не пытаться «вернуть правильный VK-роутер».
- **Монорепо с независимыми приложениями** (`apps/*`), общий код в `packages/kit`: изоляция
  прототипов и чистая единица для передачи; настройка VKUI не дублируется.
- **Навигация — средствами VKUI**: ключ панели/вью — проп `nav` (не `id`); переходы анимирует
  сам VKUI по смене `activePanel`/`activeView` + `history`.
- **API VKUI 8 сверять по** `node_modules/@vkontakte/vkui/dist/**/*.d.ts`: v8 отличается от
  примеров в интернете (напр. `colorScheme` вместо `appearance`, `nav` вместо `id`).

## Скиллы и инструменты

- Новый прототип — через скилл **`/new-prototype <имя> <таргет>`** (`.claude/skills/new-prototype`).
- Этапы воркфлоу — этапные скиллы (`.claude/skills/`, с 2026-07-02): **`proto-static`**
  (статика + скриншот-сверка), **`proto-animate`** (анимация из Motion-таймлайна),
  **`proto-handoff`** (DoD, деплой, экспорт). Фазы отмечаются чекбоксами в
  `apps/<name>/HANDOFF.md` §«Статус фаз».
- Анимации — скилл **`web-animation-design`** (easing, springs, Framer Motion, reduced-motion).
- **`emil-design-eng`** (Emil Kowalski, MIT, вендорнут) — принципы и конкретные значения motion:
  easing/длительности, «не `ease-in` на UI», «не масштабировать от 0», только `transform/opacity`,
  пружины, асимметричный тайминг, stagger, reduced-motion. Источник motion-вкуса для фазы анимации.
- **`review-animations`** (Emil Kowalski, MIT, вендорнут, `disable-model-invocation`) — строгий
  ревьюер motion-кода (вердикт Block/Approve с `file:line`). **Гейт фазы анимации** в воркфлоу.
  **Переведён на русский и адаптирован под проект (2026-07-02, upstream-синк вручную):** ревьюит
  только кастомный motion (VKUI-дефолты вне скоупа); Block-триггеры — значение не трассируется к
  Figma Motion/спеке/HANDOFF.md, игнор тумблера Motion; длительности — по таблице диапазонов
  (Short 100–200 / Medium 250–400 / Long 450–600 / Extra long 700–1000 мс) и **сетке 50 мс**;
  принятые tradeoff'ы из HANDOFF.md не пере-блокируют; после Approve — чекбокс в «Статус фаз».
- **`agentation`** (npm-пакет, PolyForm Shield, dev-only, **на пробе**) — визуальный фидбек-тулбар:
  клик по элементу рендера → структурный контекст (селектор/путь/computed styles) для агента;
  умеет паузу анимаций для захвата кадра. Подключён в `apps/_template/src/App.tsx` под
  `import.meta.env.DEV` (в прод-сборку не попадает) → во всех новых прототипах. Выпилить =
  удалить импорт + строку рендера + devDependency.
- Figma → код/токены и Code Connect — **Figma MCP-скиллы** (`figma-use`, `figma-code-connect` и др.).
- **`frontend-design`** (официальный Anthropic) вендорнут в `.claude/skills/`, но ценность
  ограничена: эстетику задаёт дизайн-система VKUI.
- **`transitions.dev`** (`github.com/Jakubantalik/transitions.dev`) — каталог готовых CSS-переходов;
  держим **референсом идей**, НЕ ставим как скилл: его `:root`-токены и `t-*`-классы конфликтуют с
  VKUI-токенами и своей дизайн-системой, а переходы экранов уже есть из VKUI.
- **Не ставить** непроверенные community design-скиллы (UI-UX Pro Max, Taste и пр.): навязывают
  generic-эстетику (Tailwind/shadcn) — конфликт с VKUI и риск безопасности.
