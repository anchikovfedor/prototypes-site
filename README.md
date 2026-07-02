# Документы из облака — прототип (передача в разработку)

Кликабельный прототип экрана «Документы из облака» (VK Cloud) на **React + VKUI 8**:
hero-разворот стопки документов на чистых CSS-`transition`. Это визуально-анимационный слой
для переноса в продукт — без бэкенда и реального стейта, данные мокнуты.

## Запуск

Node 20+ (например через nvm):

```bash
npm install
npm run dev -w apps/documents-css
```

Открой адрес из вывода Vite (обычно http://localhost:5173).

## Что смотреть

- Архитектура анимации, тайминги и easing — [`apps/documents-css/HANDOFF.md`](apps/documents-css/HANDOFF.md).
- Живая витрина (собранная): https://anchikovfedor.github.io/prototypes-site/
- Общий слой (тема VKUI, провайдеры, шеллы под таргеты) — `packages/kit` (`@proto/kit`).

## Структура

```
packages/kit         — общий слой прототипов (@proto/kit)
apps/documents-css   — сам прототип (src, public/fonts, HANDOFF.md)
```

## Команды

```bash
npm run dev -w apps/documents-css        # dev-сервер (hot reload)
npm run build -w apps/documents-css      # production-сборка
npm run typecheck -w apps/documents-css  # проверка типов
```
