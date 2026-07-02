import type { PlatformType } from '@vkontakte/vkui';

/**
 * Таргет прототипа — определяет рамку экрана и раскладку.
 * - desktop-web — полноэкранный веб (VKCOM), многоколоночные раскладки;
 * - mobile-app — рамка телефона, одноколоночные push-переходы;
 * - adaptive — реагирует на ширину окна.
 */
export type Target = 'desktop-web' | 'mobile-app' | 'adaptive';

export type ColorScheme = 'light' | 'dark';

export interface PrototypeSettings {
  platform: PlatformType;
  colorScheme: ColorScheme;
  /** Анимация переходов между экранами (transitionMotionEnabled у ConfigProvider). */
  motion: boolean;
}
