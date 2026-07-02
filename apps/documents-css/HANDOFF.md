# Handoff — Документы из облака (CSS)

## Что это

Экран «Документы из облака» (VK Облако): 2-колоночная сетка карточек-стопок документов.
Тап по стопке разворачивает её hero-переходом «на месте» — карточка растёт на всю ширину,
превью «разъезжаются»/«выезжают» в сетку фото, остальные карточки гаснут, заголовок хедера
меняется на имя документа. Вся анимация — **чистые CSS-`transition`** поверх абсолютно
позиционированных **персистентных** элементов (не пересоздаются при морфе).
Таргет: **`adaptive`** (платформа vkcom, web-iframe в проде), контент до **720px**, без рамки
телефона. Источник: Figma `<figma-file-key>` (<internal-ticket>); свёрнутое — `2813:69546`,
motion — `2797:53377`.

## Архитектура анимации (важно)

Единое дерево: `.docs-stage` (position relative, ширина из JS, высота анимируется), внутри все
`.doc-card` и `.doc-photo` — `position: absolute` с inline-координатами из `src/layout.ts`.
Смена `openId` меняет inline-стили и классы (`.is-open` / `.is-dimmed`), а браузер интерполирует
переход CSS-`transition`. **Нет** фаз/клонов/двух лейаутов/unmount → нет мелькания, нет бага
порядка, заголовок карточки анимируется сам, фото — один непрерывный `<img>` (чёткий морф).

Геометрия **адаптивная**: `layout.ts` считает всё из измеренной ширины stage (ResizeObserver в
`DocumentsPanel`, до 720). Веер сверен пиксель-перфект с Figma `2813:69546`.

> Почему так: до этого перебрали JS-FLIP + клоны (мелькание/порядок/дёрганье) и рассматривали
> View Transitions (снапшот-кроссфейд, ломает «выезд из стопки» и хуже для реальных фото).
> Absolute-CSS-transition оказался и надёжнее, и лучше для непрерывного `<img>`.

## Анимации

Единый easing/длительность для всего морфа: **`cubic-bezier(0.32, 0.72, 0, 1)`, 500 мс**
(из Figma-таймлайна: `times [0,0.25,1]` над 2 с ⇒ активная фаза 0.25×2000 = 500 мс).

| Переход / эффект | Как | Файл |
| ---------------- | --- | ---- |
| Hero-разворот стопки: рост карточки + разъезд фото в сетку + рамка `1.5px→1px`, radius `12→24`, тень→0 | CSS `transition` (left/top/width/height/transform/opacity/border/box-shadow/border-radius) | `DocumentStacks.css`, геометрия `layout.ts` |
| «Выезд» непарных фото (4+) и плитки «Загрузить ещё» | стартуют в позиции ВЕРХНЕЙ карточки стопки, `opacity 0→1` → в свою ячейку | `layout.ts` (`collapsedPhoto`/`expandedPhoto`) |
| Гашение остальных карточек | `opacity→0` + `blur(24px)` (`.is-dimmed`) | `DocumentStacks.css` |
| Заголовок карточки (имя+счётчик) при развороте | `opacity→0` + `blur(24px)`; приколот к `top` (под зоной превью) → **не уезжает вниз** | `DocumentStacks.css` |
| Заголовок хедера (Документы ↔ имя) | **text-swap** (transitions.dev): 150 мс, `translateY 4px`, `blur 2px`, `ease-in-out`, 3 фазы | `components/CrossfadeTitle.tsx` |

- Верхняя (передняя) карточка стопки → **ячейка 0** (реверс веера + z-index).
- Обводка — реальный `border` (не inset-тень: над фото тень не видна), меняется плавно.
- **Reduced-motion / тумблер Motion:** класс `.no-motion` (от `usePrototypeSettings().motion`) **+**
  `@media (prefers-reduced-motion: reduce)` — оба выключают transition (переключение мгновенное).

## Вёрстка / статика

- Карточки **единой высоты**: заголовок — резерв **1 строка** (name + counter, по центру, ellipsis);
  длинные имена обрезаются («Свидетельство о…»). Расхождение с Figma `fit-content`-строками — сознательное
  (нужно для absolute-морфа), согласовано с пользователем.
- Веер превью — пиксель-перфект (rotate + общий `skewX(-1.17°)`, origin center).
- Фон `#f6f7f8` (значение макета) на `html`/`body`/`.vkuiPanel__in`/`.vkuiPanelHeader__in` через `!important`.
- Шрифт заголовков — **VK Sans Display** (бандлится: `public/fonts` + `src/fonts.css`) + `font-smoothing: antialiased`.
- Кнопка «назад» — `Icon24ChevronLeftOutline` в `PanelHeaderButton` (тёмная `#2c2d2e`, 48px).

## Фото

- **Реальные** ассеты документов из Figma → `public/photos/` (7 шт., png/jpg). Маппинг на документы —
  `src/data.ts` (`photos: string[]`, под нехватку счётчика повторяются по кругу, `photoFor`).
- В `.doc-photo` — `<img object-fit: cover>`; серый `#e1e3e6` — плейсхолдер под загрузку.

## Данные (мок)

`src/data.ts`: Паспорт·2, СНИЛС·12, Свидетельство о рождении·3, ИНН·1, Паспорт·2 + плитка «Загрузить ещё».
Кнопки «+»/«назад»/плитка — без бизнес-логики (фокус — разворот).

## Файлы

`src/`: `App.tsx` (PrototypeRoot vkcom/adaptive + dev-тулбар `Agentation`), `screens/DocumentsPanel.tsx`
(сцена, замер ширины, `openId`), `components/{DocumentStack,AddTile,CrossfadeTitle}.tsx`,
`layout.ts` (адаптивная геометрия + веер), `data.ts`, `DocumentStacks.css`, `fonts.css`, `agentation.css`.
Ассеты — `public/photos`, шрифты — `public/fonts`. Лаунчер — `apps/index/src/prototypes.ts`.

## Гейты / TODO

- Ревью анимаций — прогнать скилл **`review-animations`** (гейт качества motion, вердикт Approve).
- Второй способ — восстановить `documents-motion` (Framer `layoutId`) из git-истории.
- Опц.: если «выезд всех фото из стопки» на реальных фото слишком busy — стаггер или лишние проявлять на месте.

## Как запустить

`npm run dev -w apps/documents-css` (Node через nvm). Тумблер Motion и тема — в dev-панели.
