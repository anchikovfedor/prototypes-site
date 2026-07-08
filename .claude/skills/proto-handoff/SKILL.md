---
name: proto-handoff
description: Handoff phase of the prototype workflow — run the Definition-of-Done checklist, finalize HANDOFF.md, build the static site, verify the GitHub Pages deploy by content, and optionally export the prototype to the public repo. Use when the animation review is approved and the user wants to hand off, deploy, or publish ("передача", "задеплой", "экспортируй прототип").
---

# proto-handoff — фаза «Передача»

Шаг 5 воркфлоу (`memory-bank/conventions.md`): финальные проверки, `HANDOFF.md`, деплой,
опциональный экспорт кода. Команды npm требуют nvm:
`export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"`.

## Пререквизит

Вердикт `/review-animations` — **Approve**, отмечен в `apps/<name>/HANDOFF.md`
§«Статус фаз». Нет — сначала ревью (фаза `proto-animate` не закрыта).

## Definition of Done (прогнать целиком)

Полный список — `memory-bank/conventions.md` §«Definition of done». Проверить и показать
пользователю результат по пунктам:

- [ ] Вход зафиксирован в HANDOFF.md (Figma-состояния + Motion-node).
- [ ] Статика заапрувлена (чекбокс фазы).
- [ ] `npm run dev -w apps/<name>` работает; `npm run build -w apps/<name>` собирается.
- [ ] Переходы выглядят как задумано; уважают `prefers-reduced-motion` и тумблер Motion.
- [ ] `/review-animations` — Approve.
- [ ] HANDOFF.md заполнен: тайминги/easing, дефолт VKUI vs кастом, маппинг компонентов,
      мок-данные/упрощения.
- [ ] Прототип в лаунчере (`apps/index/src/prototypes.ts`); статус переведён в `'ready'`.

## Деплой (GitHub Pages, детали — `memory-bank/techContext.md` §«Деплой»)

1. `npm run build:site` локально — собирается без ошибок.
2. Push в ветку `main` (триггер `.github/workflows/deploy.yml`) — **по согласованию
   с пользователем**; Actions публикует `dist/` в `gh-pages` репо
   `anchikovfedor/prototypes-site`.
3. **Проверять по контенту, не только по «success»**: HEAD ветки `gh-pages` = наш коммит
   (`gh api repos/anchikovfedor/prototypes-site/commits/gh-pages`) **и** сменился hash
   JS-бандла на `https://anchikovfedor.github.io/prototypes-site/` — CDN несколько минут
   может отдавать старый бандл.
4. Грабли: абсолютные литералы к public-ассетам в JS (`'/x.png'`) при подпапочном base не
   переписываются Vite — использовать `import.meta.env.BASE_URL`. Первый в жизни деплой
   нового Pages-репо провижинит CDN до ~15–20 мин — прогон **не отменять**.

## Обновление публичного зеркала (опционально)

`scripts/export-public.mjs` экспортирует **весь публичный каркас** (kit, прототипы из
`PUBLIC_APPS`, скиллы, memory-bank, конфиги) в `prototypes-site`/`main`. Санитизация:
`*.ttf` не копируются, внутренние идентификаторы вычищаются из всех HANDOFF.md. Новый
прототип попадает в зеркало **только** после добавления в `PUBLIC_APPS` (согласовать с
пользователем).

- `node scripts/export-public.mjs build <dir>` — разложить зеркало локально для проверки;
- `node scripts/export-public.mjs publish` — клон `main` публичного репо, commit, push
  (нужен авторизованный `gh`).

## Выход

Отметить «Передача» в §«Статус фаз». Сообщить пользователю публичный URL и что осталось
на его стороне (проверки, доступы).
