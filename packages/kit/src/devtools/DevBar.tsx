import type { CSSProperties } from 'react';
import { usePrototypeSettings } from '../settings/PrototypeSettings';
import type { PlatformType } from '@vkontakte/vkui';
import type { ColorScheme } from '../types';

const barStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 1000,
  right: 16,
  bottom: 16,
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  padding: '8px 10px',
  borderRadius: 12,
  background: 'rgba(20, 22, 26, 0.92)',
  color: '#fff',
  font: '12px/1.2 -apple-system, system-ui, sans-serif',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
};

const selectStyle: CSSProperties = {
  background: '#2a2d33',
  color: '#fff',
  border: '1px solid #3a3d44',
  borderRadius: 8,
  padding: '4px 6px',
  font: 'inherit',
};

/** Плавающая панель для переключения платформы/темы/анимаций в рантайме (только для дев-показа). */
export function DevBar() {
  const { platform, setPlatform, colorScheme, setColorScheme, motion, setMotion } =
    usePrototypeSettings();

  return (
    <div style={barStyle} aria-label="Prototype controls">
      <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ opacity: 0.7 }}>OS</span>
        <select
          style={selectStyle}
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformType)}
        >
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="vkcom">VKCOM</option>
        </select>
      </label>
      <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ opacity: 0.7 }}>Theme</span>
        <select
          style={selectStyle}
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input type="checkbox" checked={motion} onChange={(e) => setMotion(e.target.checked)} />
        <span style={{ opacity: 0.7 }}>Motion</span>
      </label>
    </div>
  );
}
