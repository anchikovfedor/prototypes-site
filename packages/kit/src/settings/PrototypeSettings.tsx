import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ColorScheme, PrototypeSettings } from '../types';
import type { PlatformType } from '@vkontakte/vkui';

interface SettingsContextValue extends PrototypeSettings {
  setPlatform: (p: PlatformType) => void;
  setColorScheme: (c: ColorScheme) => void;
  setMotion: (m: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function usePrototypeSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('usePrototypeSettings must be used within PrototypeRoot');
  }
  return ctx;
}

interface ProviderProps {
  initial: PrototypeSettings;
  children: ReactNode;
}

export function PrototypeSettingsProvider({ initial, children }: ProviderProps) {
  const [platform, setPlatform] = useState<PlatformType>(initial.platform);
  const [colorScheme, setColorScheme] = useState<ColorScheme>(initial.colorScheme);
  const [motion, setMotion] = useState<boolean>(initial.motion);

  const value = useMemo<SettingsContextValue>(
    () => ({ platform, colorScheme, motion, setPlatform, setColorScheme, setMotion }),
    [platform, colorScheme, motion],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
