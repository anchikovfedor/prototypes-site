import { useEffect, useState } from 'react';
import { qrcodegen } from './vendor/qrcodegen';

/** Рисует QR-матрицу в canvas и возвращает data-URL (белая подложка — контраст для камеры). */
function qrDataUrl(text: string, scale = 4, border = 2): string {
  const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM);
  const size = (qr.size + border * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }
    }
  }
  return canvas.toDataURL('image/png');
}

/**
 * QR прямой ссылки на прототип: навести камеру телефона на экран.
 * Картинка появляется при ховере строки лаунчера (см. qr.css) — имеет смысл
 * на задеплоенном сайте; локально закодирует localhost.
 */
export function QrBadge({ path }: { path: string }) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const url = new URL(path, window.location.href).href;
    setSrc(qrDataUrl(url));
  }, [path]);

  if (!src) return null;
  return (
    <span className="qr-badge" aria-hidden="true">
      <img className="qr-badge__img" src={src} alt="" width={96} height={96} />
    </span>
  );
}
