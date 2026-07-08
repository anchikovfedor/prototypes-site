---
name: proto-animate
description: Animation phase of the prototype workflow — implement motion strictly from the Figma Motion timeline (get_motion_context recursive) or a designer spec, after static approval; must respect prefers-reduced-motion and the Motion toggle. Use when statics are approved and the user asks to animate ("анимация", "оживи", "сделай переход как в Figma Motion").
---

# proto-animate — фаза «Анимация»

Шаг 3 воркфлоу (`memory-bank/conventions.md`). Вход — только после апрува статики;
выход — через ревью `/review-animations`.

## Пререквизиты (жёсткий гейт)

1. В `apps/<name>/HANDOFF.md` §«Статус фаз» отмечено «Статика заапрувлена». Не отмечено —
   остановись и вернись к `proto-static`; анимацию не начинай.
2. **Прочитай скилл `emil-design-eng` до реализации** (easing, длительности, физика,
   перфоманс, a11y). Обязательный шаг, не пропускается.

## Источник значений (строгое правило)

Все параметры — easing, длительности, задержки/stagger, смещения, размеры, blur, opacity,
поворот, тени, порядок появления — **только** из одного из двух источников:

1. **Таймлайн Figma Motion** — `get_motion_context` с **`recursive: true`**. Грабли: корневой
   Smart-Animate символ часто отдаёт пустой таймлайн (`timelineDurationMs: null`) — значения
   лежат на дочерних узлах в `codeSnippets.motionDev` (`initial`/`animate`/`transition`,
   `times`/`ease`). Loop-демо: активная фаза = `times[1] × durationMs`, дальше hold.
2. **Таблица-спецификация** от дизайнера, если она есть.

**Запрещено** подставлять значения «на глаз», по аналогии, из памяти или прошлых сессий.
Значения нет ни в таймлайне, ни в спеке — **остановись и спроси пользователя**. Неизбежные
приближения (то, что CSS/движок не повторяет 1:1) назвать явно и согласовать до реализации.

## Шаги

1. Переходы между экранами — **VKUI по умолчанию** (`View`/`Root`/`Epic`/`ModalRoot`);
   Framer Motion / WAAPI — точечно, только для того, чего в VKUI нет.
2. Реализуй по значениям из таймлайна/спеки; анимируй `transform`/`opacity`, где возможно
   (стандарты — `emil-design-eng`).
3. **Reduced-motion + тумблер:** кастомные анимации уважают `prefers-reduced-motion`
   (мягче, не в ноль) и тумблер Motion из `usePrototypeSettings()`; VKUI-переходы уже
   покрыты `transitionMotionEnabled`.
4. Проверь вживую оба положения тумблера Motion; `npm run typecheck -w apps/<name>`.
5. Впиши в `HANDOFF.md` §«Анимации»: тайминги/easing и их источник, что дефолт VKUI
   (переносится как есть), что кастом (нужно воспроизвести).

## Выход (гейт)

Отметь «Анимация готова» в §«Статус фаз» и **напомни пользователю прогнать
`/review-animations`** на диффе анимации — скилл сам не вызывается
(`disable-model-invocation`). Вердикт **Block** → исправить и перепрогнать; фаза закрыта
только при **Approve** (отметить в «Статус фаз»).
