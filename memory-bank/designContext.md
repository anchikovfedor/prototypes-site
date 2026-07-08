# Design Context

## Источник дизайна

Figma со **своей дизайн-системой поверх VKUI** (не дефолтный VKUI-кит). Значит токены
прототипа должны соответствовать вашей системе, а не палитре VKUI из коробки.

## Как VKUI работает с токенами

- Токены — это CSS custom properties вида `--vkui--color_background_accent`,
  `--vkui--font_family_base` и т.д. (см. `node_modules/@vkontakte/vkui/dist/vkui.css`).
- Наборы токенов подключаются классами через `ConfigProvider.tokensClassNames`
  (по умолчанию `vkui--vkBase--light`, `vkui--vkIOS--light`, `vkui--vkCom--light` и тёмные).

## Текущее состояние (placeholder)

`packages/kit/src/theme/theme.css` определяет класс `.proto-brand`, который вешается на
контейнер `AppRoot` и переопределяет **отдельные** токены (акцентный цвет). Остальные токены
наследуются из дефолтного набора VKUI. Этого достаточно, чтобы показать механизм; это **не**
полная дизайн-система.

## Полный пайплайн Figma → тема VKUI (когда нужна вся система)

1. **Вытянуть переменные из Figma** через Figma MCP: `get_variable_defs` (и `get_design_context`
   для контекста). Получаем цвета/типографику/радиусы/отступы как именованные значения.
2. **Смаппить в токены VKUI.** Два пути:
   - **Точечный (быстрый):** расширить `.proto-brand` в `theme.css`, переопределив нужные
     `--vkui--*` переменные значениями из Figma. Подходит, пока расхождений немного.
   - **Полный (правильный):** сгенерировать кастомную тему через `@vkontakte/vkui-tokens`
     (описание темы → сборка CSS-классов токенов), подключить классы через
     `ConfigProvider.tokensClassNames` вместо дефолтных.
3. **Зафиксировать соответствие** «Figma-переменная → VKUI-токен» в этом файле, чтобы
   обновление было воспроизводимым.

## Процесс обновления

При изменении дизайн-системы в Figma — заново выполнить шаг 1–2 и обновить тему в
`packages/kit`. Тема общая: меняется в одном месте, применяется ко всем прототипам.

## Code Connect (опционально)

Для связки VKUI-компонентов кода с компонентами Figma можно использовать Figma Code Connect
(через Figma MCP), чтобы при передаче разработке маппинг компонент↔макет был явным.

## Маппинг токенов — «Документы из облака» (`apps/documents-css`, vkcom)

Дизайн использует Paradigm-токены, которых нет в дефолтном VKUI. С 2026-07-03 полная тема
Paradigm подключена глобально (`@vkontakte/vkui-tokens` → `ConfigProvider tokensClassNames`
в `PrototypeRoot`; детали — progress.md). Таблица ниже — точечные значения, применявшиеся
напрямую до темы; фон страницы `#f6f7f8` остаётся хардкодом (токена
Background/BackgroundPortal в `paradigmBase` нет, есть только cloud-вариант):

| Назначение | Значение | VKUI-токен | Примечание |
| ---------- | -------- | ---------- | ---------- |
| Фон страницы | `#f6f7f8` | `--vkui--color_background` (живой токен = `#edeef0`, не совпадает) | значение макета хардкодом; ставится на `html`/`body`/`.vkuiPanel__in`/`.vkuiPanelHeader__in` через `!important` (иначе при pull-to-refresh/оверскролле проступают белый `--color_background_content` и серый `html`) |
| Плитка превью | `#e1e3e6` | `--vkui--color_background_tertiary` = `#fafbfc` на vkcom | токен белёсый → явный серый |
| Обводка detail-превью | `rgba(0,16,61,0.08)` | `--vkui--color_image_border_alpha` | detail-карточки 1px, radius 24 (узел развёрнутого состояния — см. HANDOFF) |
| Иконка «назад» | `#2c2d2e` | `--vkui--color_icon_primary` (перебивает `--vkui--color_panel_header_icon` = `#2688eb`) | сама иконка — `Icon24ChevronLeftOutline` в `PanelHeaderButton` (`PanelHeaderBack` берёт иконку от платформы, её не задать) |
| Рамка превью-веера | white, 1.5px | `--vkui--color_stroke_contrast` | |
| Имя / счётчик / accent | `#2c2d2e` / `#87898f` / `#0070f0` | `--vkui--color_text_primary` / `_secondary` / `_accent` | |
| Подсказка в Add-плитке | `#528fdf` | `--vkui--color_text_link_visited` | |
| Шрифт заголовков | VK Sans Display Medium | — | бандлится (`public/fonts` + `src/fonts.css`) + `font-smoothing: antialiased` — см. conventions «Шрифты и рендеринг» |

Веер превью (`src/layout.ts`, ранее `fan.ts`) выровнен попиксельно по Figma-узлу свёрнутого
состояния (см. `apps/documents-css/HANDOFF.md` §«Источник / вход»): позиция = left/top
НЕповёрнутого прямоугольника в зоне 165.5×180, плюс `rotate` и общий `skewX(-1.17°)`; центр
сохраняется (`transform-origin: center`). Sticky-градиент под хедером **удалён** по фидбеку.

**Фото (обновление):** превью — теперь **реальные ассеты** документов из Figma (`public/photos`,
маппинг в `data.ts`), а не серые плейсхолдеры. `#e1e3e6` остаётся фоном `.doc-photo` — плейсхолдер
под загрузку `<img object-fit:cover>`. Обводка при морфе — реальный `border` (над фото inset-тень
не видна): `1.5px белая → 1px --color_image_border_alpha`, radius `12→24`.
