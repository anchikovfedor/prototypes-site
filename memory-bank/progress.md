# Progress / Active Context

Снимок состояния для продолжения в новой сессии. Обновляется только по запросу.

## Активная работа: прототип «Документы из облака» (`apps/documents-css`)

**Что:** кликабельный экран VK Облако — сетка карточек-стопок документов; тап по стопке →
разворот в детальную сетку превью. В проде — встроенный веб-iframe (платформа vkcom).

**Figma:** файл, узлы состояний и Motion-node — в `apps/documents-css/HANDOFF.md`
§«Источник / вход» (таймлайн тянуть `get_motion_context` **`recursive: true`** — корневой
Smart-Animate символ отдаёт пустой таймлайн). Единый easing `cubic-bezier(0.32, 0.72, 0, 1)`,
активная фаза **500 мс** (0.25 × 2000 мс loop-демо). **Пружины НЕТ** — все элементы на этом easing
(прежняя запись о spring у «Загрузить ещё» была ошибкой). Параметры: превью-фото
`108×145 → 165×220`, `rotate ±4/0 → 0`, `borderWidth 1.5 → 0`, тень → 0; заголовок — `opacity` +
`blur(24px) → 0`; соседние карточки — `opacity 1→0 + blur(0→24px)`; «Загрузить ещё» — морф из
повёрнутой мини-карточки (`rotate 4`, `108×145`, со смещением) + `opacity 0→1`.

**Фаза по воркфлоу (вход → статика → апрув → анимация → ревью → передача):** **ПЕРЕДАЧА ВЫПОЛНЕНА
— задеплоено на Vercel (публичная ссылка работает).** Анимация готова, гейт `review-animations`
пройден (Approve). Морф — на **absolute-CSS-transition** (см. ниже); **фото убраны** (ячейки — серый
токен), применены стаггер «выезда» и мягкий reduced-motion. **Framer-версия (`documents-motion`)
удалена из рабочего дерева** (вернуть из git-истории при необходимости).

**Итоговый стек морфа (после перебора):** пробовали JS-FLIP + клоны-оверлеи (мелькание старого
лейаута, баг порядка, дёрганье) и рассматривали View Transitions (снапшот-кроссфейд, ломает
«выезд из стопки», хуже для реальных фото). **Выбран absolute-CSS-transition** — единое
персистентное дерево: `.docs-stage` (position relative) + все `.doc-card`/`.doc-photo`
`position: absolute` с inline-координатами из `src/layout.ts`; смена `openId` меняет inline-стили
и классы `.is-open`/`.is-dimmed`, морф интерполируется CSS-`transition`. Нет фаз/клонов/unmount →
нет мелькания/бага порядка; заголовок карточки анимируется сам; фото — непрерывный `<img>`
(чёткий морф, не кроссфейд). **Урок:** для shared-element морфа между двумя раскладками —
персистентные абсолютные элементы + CSS-transition, а не ручной FLIP на React-рендерах.

**Ключевые решения / реализация:**
- Платформа **vkcom** (веб), `target="adaptive"` (без рамки телефона), контент до **720px**.
- **Геометрия — `src/layout.ts`, адаптивная:** всё считается из измеренной ширины stage
  (ResizeObserver в `DocumentsPanel`). Карточки/фото абсолютны. Веер — пиксель-перфект по
  Figma-узлу свёрнутого состояния (rotate + общий `skewX(-1.17°)`, origin center).
- **Ячейки документов — без фото** (для передачи в разработку): `.doc-photo` залит токеном
  `var(--vkui--color_background_secondary, #f0f2f5)` (реагирует на тёмную тему). Ранее были реальные
  фото из Figma (`public/photos/` + `photos[]`/`photoFor` в `data.ts`) — всё удалено; в `data.ts`
  остались только `id/title/count`. Вернуть фото — из git-истории.
- **Единая высота карточек:** заголовок — резерв **1 строка**, **по центру** (как в макете),
  ellipsis для длинных («Свидетельство о…»). Приколот к `top` (под зоной превью) → при развороте
  **не уезжает вниз**, а тает `opacity→0 + blur(24px)`. (Расхождение с Figma `fit-content` — сознательное,
  под absolute-морф, согласовано.)
- Обводка фото — реальный `border` (`1.5px белая → 1px subtle`, над фото inset-тень не видна),
  radius `12→24`, тень→0 — всё плавно через `transition`.
- Верхняя (передняя) карточка стопки → **ячейка 0** (реверс веера + z-index). Непарные фото (4+)
  и плитка «Загрузить ещё» стартуют в позиции верхней карточки, `opacity 0→1` → «выезжают».
- Фон страницы — токен **`var(--vkui--color_background, #f6f7f8)`** на `html`/`body`/`.vkuiPanel__in`/
  `.vkuiPanelHeader__in` (`!important` на слоях-перебивках); через токен работает **тёмная тема**
  (был захардкожен `#f6f7f8`). Шрифт заголовков — **VK Sans Display** (бандлится) + `font-smoothing: antialiased`.
- Хедер: `fixed`; «назад» — **`Icon24ChevronLeftOutline`** в `PanelHeaderButton` (`#2c2d2e`, 48px).
- Заголовок хедера — **text-swap** (`CrossfadeTitle`, императивный DOM: 150 мс, `translateY 4px`,
  `blur 2px`, `ease-in-out`, 3 фазы) — параметры transitions.dev по запросу пользователя.
- Данные: Паспорт·2, СНИЛС·12, Свидетельство о рождении·3, ИНН·1, Паспорт·2, + «Загрузить ещё».

**Файлы:** `apps/documents-css/src/` — `App.tsx`, `screens/DocumentsPanel.tsx` (сцена + замер ширины +
`openId`), `components/{DocumentStack,AddTile,CrossfadeTitle}.tsx`, `layout.ts` (адаптивная геометрия +
веер), `data.ts` (`id/title/count`), `DocumentStacks.css`, `fonts.css`, `agentation.css`.
Шрифты — `public/fonts` (`public/photos` удалён вместе с фото). **Удалены** `flip.ts` / `fan.ts` /
`DocumentDetail.tsx` (не нужны при absolute-подходе).

**Статус:** статика + морф собраны и заапрувлены; **задеплоено на Vercel** (публичная ссылка). Сверено
скриншотами (серые ячейки-заглушки вместо фото, центрированные заголовки, заголовок не уезжает вниз,
стаггер «выезда», нет мелькания/клиппинга). **Гейт `review-animations` — Approve** (стаггер + мягкий
reduced-motion применены; `blur 24px` и не-GPU absolute-морф — принятые tradeoff'ы).

**Пост-деплой правки (стекинг/скролл, задеплоены):**
- **`.doc-card` → `isolation: isolate`:** свёрнутая карточка не создавала свой stacking context, и
  z-index её ячеек (`collapsedPhoto` даёт `z: count - i`, у СНИЛС `count=12`) протекал в корень и
  перекрывал фикс-хедер (VKUI `--vkui_internal--z_index_panel_header: 10`) при скролле. Изоляция
  локализует z-index ячеек внутри карточки. `is-open` остаётся `z-index: 3` над соседями.
- **Плитка «Загрузить ещё» — `z: 0` в свёрнутом состоянии** (`DocumentStack.tsx`, `addPos`): раньше
  брала `z: count` из `collapsedPhoto(0)` → при закрытии проступала полупрозрачной поверх контентных
  ячеек (у них `z 1..count`). Теперь всегда под контентом; z-index в `transition` не входит (меняется
  мгновенно), поэтому важно держать его низким на всё время морфа.
- **Скролл наверх при открытии** (`DocumentsPanel.tsx`, `useEffect` по `openId`): `AppRoot`
  `scroll="global"` — скроллится окно; при разворотe stage ужимается, но прокрутка сетки оставалась,
  и документ выглядел «со скроллом». `window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' })`
  (плавность по тумблеру Motion / reduced-motion).

**Жест «свайп от края» для закрытия документа (iOS-style back, задеплоен, 2026-07-02):**
- Свайп от **левого края экрана** вправо закрывает раскрытый документ (в дополнение к кнопке
  «назад»). Собран на **VKUI `Touch`** (`@vkontakte/vkui`), **не** Framer Motion.
- **Commit-only (по решению пользователя):** во время движения пальца **ничего не двигается**; на
  отпускании, если сдвиг прошёл порог (`> 0.35·stageW` **или** флик `shiftX/duration > 0.3` при
  `> 80px`), — закрытие штатным collapse-морфом (`setOpenId(null)`). Недотянул — ничего. Прежний
  вариант с live-follow (transform за пальцем + snap-back) отвергнут пользователем и вырезан.
- **Только при включённом Motion** (`usePrototypeSettings().motion`): при выключенном жеста нет
  (рендерим обычный `div` вместо `Touch`). Это же покрывает `prefers-reduced-motion` (старт от него).
- **Грабли VKUI `Touch`:** `gesture.shiftX` заполняется **только при наличии** `onMove*`-хендлера
  (`Touch.js:109,117` — гейт по `isSlide`, который требует `onMoveX`/`onMove`). Без него `onEnd`
  видит `shiftX = 0` и коммит не срабатывает → нужен **пустой** `onMoveX` (визуально ничего).
- Реализация: `DocumentsPanel.tsx` (обёртка `Touch` над `.docs-bg`, `onStart`/`onMoveX`/`onEnd`,
  зона старта `startX ≤ 24px`, `noSlideClick`); CSS — `touch-action: pan-y` + `user-select: none`
  на `.docs-bg`. Коммиты `315b7bb` (edge-swipe) и `e23129d` (commit-only).

**Жест «щипок» (pinch-to-close) — РЕШЕНО НЕ ДЕЛАТЬ (2026-07-02).** В мобильном Safari двупальцевый
щипок зарезервирован системой (pinch-in → зум-аут → обзор вкладок), надёжно из страницы не
отключить (iOS игнорирует `user-scalable=no`/`maximum-scale`; `gesturestart`+`preventDefault`
хрупкий; обзор вкладок — на уровне хрома браузера). Работал бы в реальном **WKWebView** (нет вкладок
Safari, хост отключает зум) и на десктопном **трекпаде** (`wheel`+`ctrlKey`), но по публичной ссылке
в Safari не проверить. Плюс **VKUI `Touch` не отдаёт мультитач/scale** — для pinch не годится.

## Передача в разработку

**Хостинг мигрирован Vercel → GitHub Pages — ВЫПОЛНЕНО, сайт live** (Vercel и Cloudflare не
подошли — критерии выбора в `techContext.md` §«Деплой»). Механика сборки без изменений: `npm run build:site`
(`scripts/build-site.mjs`) собирает единый `dist/` (лаунчер в корень, прототипы в подпапки),
база — флагом через env `SITE_BASE`; `vite.config` приложений не трогали. **Полное решение и
почему — `techContext.md` → «Деплой».**
- **Хостинг (live):** GitHub Pages через отдельный ПУБЛИЧНЫЙ репо `anchikovfedor/prototypes-site`
  (Model B: исходники в приватном `prototypes`, Actions пушит только `dist/` в ветку `gh-pages`).
  URL — **https://anchikovfedor.github.io/prototypes-site/**. Ветка-триггер — `main`.
  Доступ: SSH deploy key — приватный ключ в secret `ACTIONS_DEPLOY_KEY` (репо `prototypes`),
  публичный — deploy key с write в `prototypes-site`. Pages source — `gh-pages` / root.
- **Vercel** — прежний хостинг; `vercel.json` удалён при структурной чистке (2026-07-02),
  GitHub App Vercel отвязан от репо (2026-07-03).
- **Код:** `apps/documents-css` самодостаточен (зависит только от `@proto/kit`) + `HANDOFF.md`
  (архитектура/тайминги/easing) — разработка поднимает в продуктовый репо, срезая proto-хёрнес.
- **Figma Code Connect** (опц.) — связать компоненты кода ↔ Figma.

**Удалено:** прототип `documents-motion` (Framer `layoutId`) — вырезан из рабочего дерева (в
git-истории остался).
**Полная тема Paradigm — ПОДКЛЮЧЕНА (2026-07-03, commit `ced3654`):** `@vkontakte/vkui-tokens`
в `packages/kit`; `scripts/generate-paradigm-theme.mjs` генерирует
`packages/kit/src/theme/paradigm.css` (paradigmBase/paradigmBaseDark, рескоуп с `:root` на
классы `tokensClassNames`), тема вешается через `ConfigProvider tokensClassNames` в
`PrototypeRoot`. Плейсхолдерные оверрайды `.proto-brand` удалены (класс-хук оставлен). Фон
страницы `#f6f7f8` в `documents-css` — хардкод: токена Background/BackgroundPortal в
`paradigmBase` нет (есть только cloud-вариант).

## Методы (использованные)

- **Артефакты до старта:** для прототипа сначала зафиксировать валидные Figma-узлы по состояниям
  + Motion-узел; геометрию/токены тянуть из них (`get_design_context` / `get_metadata` /
  `get_variable_defs` / `get_motion_context`) — не реконструировать состояние из motion-initial.
- **Скриншот-сверка (обязательно):** headless Chrome снимает dev-сервер, сравниваю 1:1 с
  `get_screenshot` (inline base64) из Figma на той же ширине (375 → карточка 165.5 = дизайн).
  Команда headless Chrome — `--headless=new --no-sandbox --force-device-scale-factor=2
  --window-size=W,H --screenshot=out.png --virtual-time-budget=4000 URL`.
- **CDP-измерения для пиксель-перфекта/диагностики:** Chrome с `--remote-debugging-port`, через
  WebSocket (Node 24 global `WebSocket`) — `Runtime.evaluate` для `getBoundingClientRect`
  (сверка позиций с Figma, центр превью сохраняется при rotate/skew) и `getComputedStyle`
  (какой токен/правило перебивает фон, какой `font-smoothing`/`font-weight`). Так находятся
  «невидимые» расхождения, которые на скрине не видны. Грабли харнесса: НЕ звать `Page.navigate`
  повторно (вкладка из `/json/new?URL` уже грузит URL — иначе контекст рушится); ответ лежит в
  `msg.result.result.value`.
- **Среда:** node через nvm; `npm run dev -w apps/documents-css`. Фоновые dev-серверы в сессии
  Claude нестабильны (среда их гасит) — пользователь поднимает свой сервер.

## Фундамент (сделано ранее)

- Монорепо (npm workspaces): React 19 + VKUI 8 + Vite 8. Node через nvm.
- `packages/kit`: `PrototypeRoot`, dev-переключатель платформы/темы/анимаций, `useStack`,
  `.proto-brand` (placeholder-тема).
- `apps/index` (лаунчер), `apps/_template` (шаблон), `apps/reference` (эталон), `apps/documents-css`.
- Скиллы: `new-prototype`, `frontend-design`, `emil-design-eng` (стандарты анимаций),
  `review-animations` (ревью анимаций) + этапные `proto-static` / `proto-animate` /
  `proto-handoff` (2026-07-02). Воркфлоу-гейт — в проектном `CLAUDE.md` и `conventions.md`.

## Проверено

- `typecheck` + production `build` — зелёные у `documents-css` / `index` / `_template` / `reference`.
- Свёрнутый экран `documents-css` сверён скриншотами 1:1 с Figma (headless Chrome).
- Пост-деплой правки (стекинг/скролл) — `typecheck` зелёный, `build:site` собирается, запушено в
  `deploy-setup` (Vercel auto-deploy).
- GitHub Pages live: `curl` корня и `…/documents-css/` → 200, base `/prototypes-site/`,
  hashed JS-ассет → 200. Action-прогон `success`, deploy-job `success`.
- **Edge-swipe закрытия** (`documents-css`, commit-only) — CDP-драйвер (headless Chrome,
  `dispatchMouseEvent`): тап → открытие, свайп от левого края → закрытие, короткий сдвиг → нет.
  Прогнан на dev **и на публичном URL**; `typecheck` + `build:site` зелёные.

## Миграция хостинга на GitHub Pages — ВЫПОЛНЕНО (2026-07-02)

Сайт live: **https://anchikovfedor.github.io/prototypes-site/** (корень-лаунчер + подпути прототипов
отдают 200, base `/prototypes-site/`, hashed-ассеты резолвятся).
- `deploy.yml` (Model B) закоммичен, Action собирает `dist/` и пушит в `gh-pages` публичного
  `prototypes-site`; Pages включён на `gh-pages` / root. Deploy key настроен, ключи из временных
  папок удалены. **`gh` CLI** установлен и авторизован (`gh auth login`, scope `repo`).
- **Урок про первый деплой:** первый в жизни деплой нового Pages-репо провижинит CDN/DNS и может
  идти **до ~15–20 мин** — **НЕ отменять** (cancel сбрасывает провижининг-таймер). Обычные билды
  7–14 мин, бывают зависания — см. techContext.md → «Деплой».

**Осталось на пользователе (не блокеры):**
- [ ] Проверить доступность сайта из всех рабочих сетей команды.
- [x] Cloudflare: проект удалён ранее; доступ Cloudflare GitHub App отозван (2026-07-03).
- Прочее: скрыть dev-панель (OS/Theme) в prod-сборке; свой домен.

## Структурная чистка и этапные скиллы (2026-07-02)

- **Удалён `vercel.json`** (+ секция `.vercel` из `.gitignore`, упоминания Vercel из
  комментариев `scripts/build-site.mjs`) — хостинг только GitHub Pages.
- **Удалены нерабочие `lint`/`format`** из корневого `package.json` вместе с devDeps
  `eslint`/`prettier` (ESLint 9 падал бы без `eslint.config.js`, prettier был без конфига;
  вернуть, когда линт реально понадобится). `package-lock.json` пересобран (`npm install`),
  smoke-`typecheck` `documents-css` и `_template` — зелёные.
- **Воркфлоу зафиксирован этапными скиллами** `proto-static` / `proto-animate` /
  `proto-handoff` (`.claude/skills/`): скиллы вписаны в `conventions.md` §«Воркфлоу
  реализации» (добавлен шаг 5 «Передача»), в `apps/_template/HANDOFF.md` добавлен блок
  «Статус фаз» с чекбоксами гейтов (одиночный чекбокс апрува из «Источник / вход» переехал
  туда). Тонкие: процедура + чеклист, «почему» остаётся в conventions.
- В `new-prototype/SKILL.md` из списка полей регистрации убрано несуществующее `href`
  (реальные поля `PrototypeEntry`: `dir`/`title`/`description`/`target`/`status`).
- **`review-animations` переведён на русский и адаптирован** (SKILL.md + STANDARDS.md;
  MIT-атрибуция сохранена, upstream-синк вручную). Проектный слой: VKUI-дефолты вне скоупа;
  Block-триггеры «значение не трассируется к Figma Motion/спеке/HANDOFF.md» и «игнор тумблера
  Motion»; принятые tradeoff'ы из HANDOFF.md не пере-блокируют; после Approve — чекбокс в
  «Статус фаз»; определён вход ревью (дифф фазы анимации).
- **Новые стандарты длительностей** (таблица от пользователя): Short 100–200 / Medium 250–400 /
  Long 450–600 / Extra long 700–1000 мс + **сетка 50 мс** — все длительности и задержки кратны
  50 (вне сетки — finding; стаггер — шаг 50 мс; в примерах исправлено 160→150 мс). SKILL.md
  синхронизирован (стандарт №4, триггеры эскалации). Текущий `documents-css` (морф 500 мс,
  CrossfadeTitle 150 мс) в сетке — ре-ревью не блокирует.

## Отвязка интеграций и стабилизация деплоя (2026-07-03)

- **Vercel и Cloudflare GitHub Apps отвязаны** от приватного `prototypes` (вручную,
  github.com → Settings → GitHub Apps): бот Vercel падал красным «Failed to deploy to
  Production» на каждом пуше. Проверить по следующему пушу, что деплойментов от ботов нет.
- **Разобран инцидент с legacy Pages-билдером** (три зависших/упавших билда подряд, live
  отставал ~2 ч): контент ни при чём, лечение — вытеснение зависшего билда через
  `POST /pages/builds`; выводы и план Б (`build_type=workflow`) — в techContext.md → «Деплой».
- **Live сверен по контенту:** корень и `…/documents-css/` отдают свежие hashed-бандлы
  HEAD-коммита `ced3654` (Paradigm-тема).

## Прототип «Карусель карточек — барабан» (`apps/cards-drum`) — ПЕРЕДАН (2026-07-08)

**Что:** вкладка «Важное» (Figma-проект вкладки; ключ файла и SP-номер — в HANDOFF): заголовок с
каунтером, вертикальная карусель белых карточек («барабан») и статичный блок табов.
Вертикальный скролл страницы отключён; жест по области карточек их переключает. Таргет
`mobile-app`. Полный контекст реализации — `apps/cards-drum/HANDOFF.md` (не дублировать).

**Фаза по воркфлоу:** пройдены все гейты (вход → статика-апрув → анимация → `review-animations`
Approve → **передача выполнена**). Live: **https://anchikovfedor.github.io/prototypes-site/cards-drum/**
(деплой сверен по контенту: HEAD `gh-pages` `ff7aa61` = деплой коммита `d708337`, cards-drum
отдаёт собранный бандл `index-BrmS5R23.js`, зарегистрирован в бандле лаунчера, headless-рендер
показывает «Новое из писем»). Статус в `prototypes.ts` — `ready`.

**Ключевые решения (не выводимо из кода):**
- **Механика барабана — без библиотек** (ресёрч: VKUI `Gallery` только горизонтальный;
  Swiper/Embla — лишняя зависимость и всё равно переопределять геометрию). Дискретный
  `activeIndex` + 4 персистентные карточки в одном слоте (роль `active/prev/next/hidden` по
  `(i-active+4)%4`), морф — CSS-transition только `transform/opacity` (паттерн Motion.dev
  «card stack»). Прецедент — absolute-морф `documents-css`.
- **Жест (спека пользователя):** тач **следует за пальцем** (inline-интерполяция ролей, без
  transition во время drag), колесо/трекпад — **триггер по накопленным 100px** с локом на
  время анимации (иначе инерция трекпада пролистывает несколько карт); порог **100px**,
  флик **>0.11 px/мс**; барабан **цикличный**.
- **Контент карточек** (node-id — в HANDOFF, добавлен в макет позже): виден только у активной,
  появляется из `opacity 0 + blur(12px)` (фидбек дизайнера через agentation-тулбар). Тень —
  отдельным слоем `.drum-card__shadow`, гасится через `opacity` (не `box-shadow`-transition).
- **Источник значений анимации — `.claude/skills/review-animations/STANDARDS.md`** (Motion-node
  в Figma нет; зафиксировано пользователем как согласованная спека): 350 мс `--ease-drawer`
  для карточек, 200 мс `--ease-out` для точек пагинации. Reduced-motion/тумблер Motion уважены
  (класс `no-motion`; контент фейдит без blur-движения).
- **Подгонка VKUI под макет перебивкой токенов на элементе** (надёжнее спора специфичностью):
  высоты кнопок через `--vkui--size_button_*_height`, чип 32/паддинг 6/радиус 20. `Button`
  `stretched` в flex-колонке = `flex-grow` → раздувает по высоте, **не использовать**. Аватар
  плейсхолдер — плоский `--vkui--color_icon_tertiary`.
- **Ревью-рекомендации (не блокеры, в HANDOFF):** мягкий opacity-фейд при reduced motion,
  снятие тач-лока по `transitionend` вместо `setTimeout`, проверка blur-в-drag на реальном
  устройстве.

## Cards-drum — доработки после передачи (2026-07-08, поздние)

Живой деплой обновлён: HEAD `gh-pages` = деплой коммита **`7b81500`** (сверено по контенту —
смена бандла + CDN). URL прежний. Ниже — что изменилось относительно первой передачи
(`d708337`); детали значений — в коде и `HANDOFF.md`.

- **Ядро анимации: эксперимент Framer Motion → откат на CSS.** Кратко пробовали FM-spring для
  переключения карточек (коммиты `de4216b`, `ebefc24`), но на скролле были баги → вернули
  **CSS-transition**. Текущая длительность **700 мс, кривая `cubic-bezier(0.32, 0.72, 0, 1)`**
  (значения из фидбека пользователя, **вне STANDARDS** — согласованный отход). Переключение
  теперь **прерываемо**: касание/drag перелистывают в любой момент (CSS ретаргетится с текущей
  позиции), для колеса остался короткий guard **150 мс** (не на всю длину анимации).
- **Новый экран «Все категории» (папка)** (node-id — в HANDOFF). Тап по табу «Все» раскрывает
  полноэкранную сетку из 10 категорий как **iOS-folder**: **Framer Motion** `layoutId`-morph
  панели из иконки + backdrop + каскад плиток. Overlay — **фростед-стекло** `#F0F1F3 30%` +
  `backdrop-blur 40px`. Параметры раскрытия взяты из `motion.dev/examples/react-ios-app-folder`
  (spring `200/22`, stagger `0.035`) — **вне Figma-спеки, согласовано с пользователем как
  эксперимент** (в Figma Motion-node нет). Плитки переиспользуют `.drum-tab*`; тап по ячейке —
  no-op (демонстрируется только раскрытие). Файл `screens/AllCategoriesFolder.tsx`.
- **Framer Motion в зависимостях cards-drum** — теперь **только** для папки и `layoutId`-иконки
  «Все»; ядро барабана снова полностью на CSS.
- **Фон — синий градиент** (Figma-слой `Bg_Light`, node-id — в HANDOFF):
  `linear-gradient(180deg, #1C85FE → #3A95FD → #6DB3F6 → #9ED3F2 → #B9E7F5 → #F0F1F3 49.86%)`
  на `.drum-screen` (полоса 600px сверху) и на фикс-слоях (`html/body/.proto-mobile`) — чтобы
  overscroll вверх открывал синий. Заголовок и каунтер перекрашены под градиент:
  `--vkui--color_text_contrast` (белый) и `--vkui--color_background_contrast_secondary_alpha`.
- **Градиент под статусбар (iOS):** `viewport-fit=cover` + `padding-top: env(safe-area-inset-top)`
  на `.drum-screen` — контент опускается под вырез, фон-градиент доходит до края экрана. На
  десктопе `env()=0` — вёрстка не меняется. `theme-color=#1C85FE` — для плашки браузера.
- **Ховер VKUI-кнопок убран** (нейтрализован hover-слой Tappable: `.vkuiTappable__hoveredBackground`
  / `__hoveredOpacity`).
- **VK Sans в публичном деплое — почин 404.** Проприетарные `.ttf` держим **вне git**
  (`apps/*/src/fonts/*.ttf` в `.gitignore`); подключены **относительным import** из `src/fonts/`
  (Vite хеширует ассет и переписывает путь под подпапочный base — абсолютный `/fonts/` на
  `/prototypes-site/cards-drum/` 404-ил). В CI (`deploy.yml`) шрифты раскладываются из
  **base64-секретов** `VK_SANS_MEDIUM_B64` / `VK_SANS_REGULAR_B64` перед сборкой. Тот же
  паттерн понадобится другим прототипам, если у них тоже пропал VK Sans. Файл на gh-pages
  скачиваем (неизбежно для рендера веб-шрифта), но в git/публичное зеркало не попадает.

## Рамка устройства убрана из кита (2026-07-07)

- **`PhoneFrame` удалён из `@proto/kit`** (решение пользователя): mobile-app занимает весь
  вьюпорт — контейнер `.proto-mobile` вместо мокапа телефона; экспорт и CSS рамки убраны.
  Попутно — сброс дефолтного `margin` у `body` (раньше его прятала рамка). Конвенция «рамку
  не рисуем, `PhoneFrame` не возвращать» — в `conventions.md` §«Таргеты» и скилле
  `new-prototype` §«Не делай». Смотреть в размере телефона = devtools-эмуляция / реальное
  устройство.

## Наведение порядка с ветками (ПРЕДЛОЖЕНИЕ, не выполнено)

**Ситуация:** дефолтная ветка приватного `anchikovfedor/prototypes` — исторически
**`deploy-setup`** (её `deploy.yml` триггерится на `deploy-setup`). Ветка **`main`** — строгий
fast-forward поверх `deploy-setup` (впереди на 13 коммитов, отставание 0): именно на ней CI
(`becf956`), Prettier, CODEOWNERS, `deploy.yml`-триггер-на-`main` (`9dbd689`), публичное
зеркало и оба прототипа этой сессии. Т.е. `main` — фактически целевая mainline, а techContext
уже описывает деплой «на push в `main`». В этой сессии `main` впервые запушена на remote и
деплой с неё отработал успешно.

**Предложение (безопасно, т.к. `main` = ff `deploy-setup`, слияния/конфликтов нет):**
1. Сделать `main` дефолтной веткой на GitHub:
   `gh api -X PATCH repos/anchikovfedor/prototypes --field default_branch=main`
   (или Settings → Branches).
2. Обновить локальный указатель: `git remote set-head origin main`.
3. Убедиться, что `deploy.yml` на `main` триггерится на `main` (уже так), после чего
   **удалить ветку `deploy-setup`** — она станет избыточной:
   `git push origin --delete deploy-setup` (сначала проверить, что на неё не завязаны
   branch-protection/Pages-настройки).
4. Опционально: настроить branch protection на `main` (PR-ревью), т.к. прямой push в неё
   сейчас разрешён только вручную через `! git push`.

**Не выполнять без явного согласия пользователя** (смена дефолт-ветки и удаление ветки —
необратимые действия на стороне GitHub).
