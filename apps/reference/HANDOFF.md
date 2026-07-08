# Handoff — Reference flow

Эталонный прототип: демонстрирует все типы переходов VKUI + одну Framer Motion micro-interaction.
Таргет: `adaptive` (большой экран — многоколоночный `SplitLayout`, мобайл — одна колонка + Tabbar).

## Источник / вход

`n/a` — синтетический эталон без Figma-источника (создан для демонстрации переходов VKUI).

## Экраны и навигация

- **Табы (Epic):** `feed` ↔ `profile` — переключение без перехода, через `Tabbar`.
- **Push (View) в табе feed:** `feed-list` → `feed-detail` (back-кнопка + свайп назад).
- **Профиль:** один экран `profile-main`.
- **Модальная шторка (ModalRoot/ModalPage):** `info`, открывается из feed-detail и из профиля.
- **Десктоп-сайдбар:** второй `SplitCol`, рендерится только на `tabletPlus`
  (`useAdaptivityConditionalRender`).

## Анимации

| Переход / эффект | Источник | Длительность / easing | Примечание |
| ---------------- | -------- | --------------------- | ---------- |
| Push `feed-list`→`feed-detail` | VKUI `View` (дефолт) | дефолт VKUI | переносится как есть |
| Открытие/закрытие шторки `info` | VKUI `ModalPage` (дефолт) | дефолт VKUI | свайп вниз / оверлей / кнопка |
| Переключение табов | VKUI `Epic` | без анимации | мгновенно |
| Лайк (поп-эффект) | Framer Motion | spring `stiffness 500, damping 14`; `whileTap scale 0.8` | `src/components/LikeButton.tsx` |

- **Дефолт VKUI** (push, шторка, табы) — воспроизводится автоматически в продакшне на VKUI.
- **Кастом** — только лайк-кнопка (Framer Motion); если в продукте нет Framer Motion,
  воспроизвести пружину средствами проекта или согласовать упрощение.
- **Reduced-motion:** переходы экранов глушит `ConfigProvider.transitionMotionEnabled`
  (стартует от `prefers-reduced-motion`, тумблер Motion в dev-панели). Лайк-кнопка
  дополнительно проверяет `useReducedMotion()` и тот же тумблер.

## Маппинг компонентов

VKUI: `SplitLayout`, `SplitCol`, `Epic`, `Tabbar`/`TabbarItem`, `View`, `Panel`,
`PanelHeader`/`PanelHeaderBack`, `Group`, `SimpleCell`, `ModalRoot`/`ModalPage`/`ModalPageHeader`,
`Placeholder`, `Avatar`, `Button`. Иконки — `@vkontakte/icons`.

## Мок-данные и упрощения

- Лента — статичный список из трёх записей, без реальных данных и пагинации.
- Профиль — заглушка (Avatar без `src`, фиктивное имя).
- Состояние «лайк» локальное, никуда не сохраняется.
- Нет роутинга по URL: экраны не адресуются ссылкой (см. techContext → планируемое улучшение).
