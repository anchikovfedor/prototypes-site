import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

/** Рамка телефона для таргета mobile-app. Экран внутри скроллится независимо. */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="proto-phone-frame">
      <div className="proto-phone-frame__device">
        <div className="proto-phone-frame__screen">{children}</div>
      </div>
    </div>
  );
}
