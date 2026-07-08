import type { Target } from '@proto/kit';

export interface PrototypeEntry {
  /** Имя workspace-папки в apps/ (совпадает с сегментом пути при совместном деплое). */
  dir: string;
  title: string;
  description: string;
  target: Target;
  status: 'wip' | 'ready';
}

/**
 * Реестр прототипов. Добавляя новый прототип (копия apps/_template),
 * допиши сюда строку.
 */
export const prototypes: PrototypeEntry[] = [
  {
    dir: 'documents-css',
    title: 'Документы — CSS',
    description:
      'Стопки документов: hero-разворот превью и blur-кроссфейд заголовка на CSS-переходах',
    target: 'mobile-app',
    status: 'ready',
  },
  {
    dir: 'reference',
    title: 'Reference flow',
    description: 'Табы, push-переход, модальная шторка, micro-interaction на Framer Motion',
    target: 'adaptive',
    status: 'ready',
  },
  {
    dir: 'cards-drum',
    title: 'Карусель карточек — барабан',
    description:
      'Вкладка «Важное»: заголовок, статичный блок и карусель карточек с барабанным переключением по скроллу',
    target: 'mobile-app',
    status: 'ready',
  },
  {
    dir: '_template',
    title: 'Template',
    description: 'Шаблон прототипа: один push-переход между двумя экранами',
    target: 'mobile-app',
    status: 'wip',
  },
];
