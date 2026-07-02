// Геометрия экрана. Адаптивная: всё считается из ширины stage (контент-области, до 720).
// Значения веера сверены с Figma 2813:69546 (пиксель-перфект). Морф — чистые CSS-transition
// поверх этих inline-координат: карточки/фото — персистентные абсолютные элементы.

const ZONE_W = 165.5; // ширина карточки/ячейки-эталона
const ZONE_H = 180; // высота зоны превью в свёрнутой карточке
const PREV_W = 108; // превью в свёрнутом виде
const PREV_H = 145;
const CELL_H_REF = 220; // высота ячейки фото в развёрнутой сетке (при ширине ZONE_W)
export const GAP = 12;
const TITLE_H = 48; // зарезервированная высота заголовка (1 строка: name 20 + gap 2 + count 18 + pad 8)

// Веер (до 3 видимых превью): left/top НЕповёрнутого прямоугольника в зоне ZONE_W×ZONE_H,
// плюс rotate и общий skewX. Порядок: 0 — задняя, последняя — передняя (верхний слой).
type Tile = { left: number; top: number; rot: number; skew: number };
const FAN: Record<1 | 2 | 3, Tile[]> = {
  1: [{ left: 28.75, top: 17.5, rot: 0, skew: 0 }],
  2: [
    { left: 39.51, top: 16.65, rot: 7, skew: -1.17 },
    { left: 16.52, top: 18.15, rot: -7, skew: 0 },
  ],
  3: [
    { left: 41.85, top: 14.82, rot: 4, skew: -1.17 },
    { left: 29.02, top: 16.08, rot: 0, skew: -1.17 },
    { left: 14.18, top: 20.06, rot: -4, skew: 0 },
  ],
};

export function cardWidth(stageW: number): number {
  return (stageW - GAP) / 2;
}
// Высота зоны превью в свёрнутой карточке (= top заголовка: под зоной, чтобы при росте карточки
// заголовок оставался на месте, а не уезжал вниз).
export function photoZoneHeight(stageW: number): number {
  return cardWidth(stageW) * (ZONE_H / ZONE_W);
}
export function cardHeight(stageW: number): number {
  return photoZoneHeight(stageW) + TITLE_H;
}
function cellHeight(stageW: number): number {
  return cardWidth(stageW) * (CELL_H_REF / ZONE_W);
}

export function cardSlot(gridIndex: number, stageW: number): { left: number; top: number } {
  const cw = cardWidth(stageW);
  const ch = cardHeight(stageW);
  return { left: (gridIndex % 2) * (cw + GAP), top: Math.floor(gridIndex / 2) * (ch + GAP) };
}

export function gridHeight(cardCount: number, stageW: number): number {
  const rows = Math.ceil(cardCount / 2);
  return rows * cardHeight(stageW) + (rows - 1) * GAP;
}

export function expandedCardHeight(photoCount: number, stageW: number): number {
  const rows = Math.ceil((photoCount + 1) / 2); // +1 — плитка «Загрузить ещё»
  return rows * cellHeight(stageW) + (rows - 1) * GAP;
}

export interface PhotoPos {
  left: number;
  top: number;
  width: number;
  height: number;
  rot: number;
  skew: number;
  opacity: number;
  z: number;
}

// Свёрнутое положение фото по индексу ЯЧЕЙКИ развёртки (стабильная идентичность элемента).
// Верхняя (передняя) карточка стопки = ячейка 0, поэтому веер разворачиваем реверсивно.
// Ячейки вне видимой стопки (index >= shared) прячем в позиции передней карточки (opacity 0).
export function collapsedPhoto(cellIndex: number, count: number, stageW: number): PhotoPos {
  const shared = (Math.min(count, 3) || 1) as 1 | 2 | 3;
  const scale = cardWidth(stageW) / ZONE_W;
  const visible = cellIndex < shared;
  const t = FAN[shared][visible ? shared - 1 - cellIndex : shared - 1];
  return {
    left: t.left * scale,
    top: t.top * scale,
    width: PREV_W * scale,
    height: PREV_H * scale,
    rot: t.rot,
    skew: t.skew,
    opacity: visible ? 1 : 0,
    z: count - cellIndex, // передняя (ячейка 0) — сверху
  };
}

// Развёрнутое положение фото — ячейка сетки внутри карточки на всю ширину stage.
export function expandedPhoto(cellIndex: number, count: number, stageW: number): PhotoPos {
  const cw = cardWidth(stageW);
  const chh = cellHeight(stageW);
  return {
    left: (cellIndex % 2) * (cw + GAP),
    top: Math.floor(cellIndex / 2) * (chh + GAP),
    width: cw,
    height: chh,
    rot: 0,
    skew: 0,
    opacity: 1,
    z: count - cellIndex,
  };
}
