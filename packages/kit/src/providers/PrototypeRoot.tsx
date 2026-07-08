import type { ReactNode } from 'react';
import { AdaptivityProvider, AppRoot, ConfigProvider, ViewWidth } from '@vkontakte/vkui';
import type { PlatformType } from '@vkontakte/vkui';
import { PrototypeSettingsProvider, usePrototypeSettings } from '../settings/PrototypeSettings';
import { DevBar } from '../devtools/DevBar';
import type { ColorScheme, Target } from '../types';

const DEFAULT_PLATFORM: Record<Target, PlatformType> = {
  'mobile-app': 'ios',
  'desktop-web': 'vkcom',
  adaptive: 'ios',
};

// Тема Paradigm для всех платформ; классы — из packages/kit/src/theme/paradigm.css
// (генерируется scripts/generate-paradigm-theme.mjs из @vkontakte/vkui-tokens).
const PARADIGM_TOKENS_CLASS_NAMES = {
  light: 'vkui--paradigmBase--light',
  dark: 'vkui--paradigmBase--dark',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

interface PrototypeRootProps {
  target: Target;
  /** Стартовая платформа (по умолчанию зависит от target). */
  platform?: PlatformType;
  /** Стартовая тема (по умолчанию light). */
  colorScheme?: ColorScheme;
  /** Показывать ли плавающую dev-панель переключателей. */
  devBar?: boolean;
  children: ReactNode;
}

function Inner({ target, children }: { target: Target; children: ReactNode }) {
  const { platform, colorScheme, motion } = usePrototypeSettings();

  // Для mobile-app форсим мобильную ширину, для desktop-web — десктопную;
  // adaptive оставляет авто-определение VKUI по ширине окна.
  const adaptivity =
    target === 'mobile-app'
      ? { viewWidth: ViewWidth.MOBILE, hasPointer: false }
      : target === 'desktop-web'
        ? { viewWidth: ViewWidth.DESKTOP, hasPointer: true }
        : {};

  const embedded = target === 'mobile-app';

  const app = (
    <ConfigProvider
      platform={platform}
      colorScheme={colorScheme}
      tokensClassNames={PARADIGM_TOKENS_CLASS_NAMES}
      transitionMotionEnabled={motion}
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot
          className="proto-brand"
          mode={embedded ? 'embedded' : 'full'}
          scroll={embedded ? 'contain' : 'global'}
        >
          {children}
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );

  // Рамку устройства не рисуем (конвенция, memory-bank/conventions.md):
  // mobile-app занимает весь вьюпорт, скролл — внутри AppRoot.
  return embedded ? (
    <div className="proto-mobile">{app}</div>
  ) : (
    <div className="proto-desktop">{app}</div>
  );
}

/** Корень прототипа: провайдеры VKUI + контейнер под таргет + dev-переключатель. */
export function PrototypeRoot({
  target,
  platform,
  colorScheme = 'light',
  devBar = true,
  children,
}: PrototypeRootProps) {
  const initial = {
    platform: platform ?? DEFAULT_PLATFORM[target],
    colorScheme,
    motion: !prefersReducedMotion(),
  };

  return (
    <PrototypeSettingsProvider initial={initial}>
      <Inner target={target}>{children}</Inner>
      {devBar ? <DevBar /> : null}
    </PrototypeSettingsProvider>
  );
}
