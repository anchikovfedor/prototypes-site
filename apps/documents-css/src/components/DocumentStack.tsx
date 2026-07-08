import type { CSSProperties } from 'react';
import type { DocItem } from '../data';
import {
  cardSlot,
  collapsedPhoto,
  expandedPhoto,
  expandedCardHeight,
  cardWidth,
  cardHeight,
  photoZoneHeight,
  type PhotoPos,
} from '../layout';
import { AddTile } from './AddTile';

function photoStyle(p: PhotoPos): CSSProperties {
  return {
    left: p.left,
    top: p.top,
    width: p.width,
    height: p.height,
    transform: `rotate(${p.rot}deg)${p.skew ? ` skewX(${p.skew}deg)` : ''}`,
    opacity: p.opacity,
    zIndex: p.z,
  };
}

interface Props {
  item: DocItem;
  gridIndex: number;
  stageW: number;
  /** Эта карточка развёрнута. */
  open: boolean;
  /** Развёрнута другая карточка — эту «гасим». */
  dimmed: boolean;
  onOpen: (id: string) => void;
}

export function DocumentStack({ item, gridIndex, stageW, open, dimmed, onOpen }: Props) {
  const slot = cardSlot(gridIndex, stageW);
  const cardStyle: CSSProperties = open
    ? { left: 0, top: 0, width: stageW, height: expandedCardHeight(item.count, stageW) }
    : { left: slot.left, top: slot.top, width: cardWidth(stageW), height: cardHeight(stageW) };

  const cls = ['doc-card', open && 'is-open', dimmed && 'is-dimmed'].filter(Boolean).join(' ');
  // Плитка «Загрузить ещё» — ячейка count: развёрнутая = сетка, свёрнутая = позиция передней карточки (opacity 0).
  // z: 0 — всегда под контентными ячейками (z 1..count), чтобы при закрытии не проступала полупрозрачной поверх них.
  const addPos = open
    ? expandedPhoto(item.count, item.count, stageW)
    : { ...collapsedPhoto(0, item.count, stageW), opacity: 0, z: 0 };

  // Стаггер «выезда»: при открытии непарные фото (индекс >= shared) стартуют с задержкой (30 мс/шаг,
  // кап 150 мс). Шара (первые ≤3) и закрытие — без задержки.
  const shared = Math.min(item.count, 3);
  const delayFor = (cellIndex: number): string =>
    open && cellIndex >= shared ? `${Math.min((cellIndex - shared) * 30, 150)}ms` : '0ms';

  return (
    <div className={cls} style={cardStyle} onClick={open ? undefined : () => onOpen(item.id)}>
      <div className="doc-card__photos">
        {Array.from({ length: item.count }, (_, i) => (
          <div
            key={i}
            className="doc-photo"
            style={{
              ...photoStyle(
                open ? expandedPhoto(i, item.count, stageW) : collapsedPhoto(i, item.count, stageW),
              ),
              transitionDelay: delayFor(i),
            }}
          />
        ))}
        <div
          className="doc-photo doc-photo--add"
          style={{ ...photoStyle(addPos), transitionDelay: delayFor(item.count) }}
        >
          <AddTile />
        </div>
      </div>
      <div className="doc-card__title" style={{ top: photoZoneHeight(stageW) }}>
        <span className="doc-card__name">{item.title}</span>
        <span className="doc-card__count">{item.count} фото</span>
      </div>
    </div>
  );
}
