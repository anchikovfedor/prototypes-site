import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Panel, PanelHeader, PanelHeaderButton, Touch } from '@vkontakte/vkui';
import type { CustomTouchEvent } from '@vkontakte/vkui';
import { Icon24ChevronLeftOutline } from '@vkontakte/icons';
import { usePrototypeSettings } from '@proto/kit';
import { documents } from '../data';
import { cardSlot, cardWidth, cardHeight, gridHeight, expandedCardHeight } from '../layout';
import { DocumentStack } from '../components/DocumentStack';
import { AddTile } from '../components/AddTile';
import { CrossfadeTitle } from '../components/CrossfadeTitle';
import '../DocumentStacks.css';

const MAX_W = 720;
const PAD = 16;

// edge-swipe (iOS back): во время движения ничего не рисуем; на завершении (за порогом)
// закрываем документ штатной collapse-анимацией.
const EDGE_ZONE = 24; // px от левого края экрана, где может начаться жест
const COMMIT_RATIO = 0.35; // доля ширины сцены для закрытия по расстоянию
const FLICK_VELOCITY = 0.3; // px/ms — «флик» закрывает и на коротком смещении
const FLICK_MIN = 80; // px — минимальное смещение, чтобы флик засчитался

export function DocumentsPanel({ nav }: { nav: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [stageW, setStageW] = useState(343);
  const { motion } = usePrototypeSettings();
  const openDoc = documents.find((d) => d.id === openId) ?? null;

  // Жест только распознаём — во время движения пальца ничего не двигаем.
  const swipeActive = useRef(false);

  const onSwipeStart = (e: CustomTouchEvent) => {
    swipeActive.current = openId !== null && e.startX <= EDGE_ZONE;
  };
  // Пустой, но обязательный: VKUI Touch считает shiftX только при наличии onMove*-хендлера
  // (Touch.js — gesture.shiftX пишется лишь когда isSlide). Визуально во время движения — ничего.
  const onSwipeMove = () => {};
  const onSwipeEnd = (e: CustomTouchEvent) => {
    if (!swipeActive.current) return;
    swipeActive.current = false;
    const dx = Math.max(0, e.shiftX); // вправо
    const velocity = dx / Math.max(e.duration, 1);
    const commit = dx > stageW * COMMIT_RATIO || (dx > FLICK_MIN && velocity > FLICK_VELOCITY);
    if (commit) setOpenId(null); // штатный collapse-морф
  };

  const bgRef = useRef<HTMLDivElement>(null);
  // Ширина сцены = min(ширина фона, 720) − паддинги. Меряем до пейнта, следим за ресайзом.
  useLayoutEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const measure = () => setStageW(Math.max(Math.min(el.clientWidth, MAX_W) - PAD * 2, 240));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // При открытии документа сбрасываем прокрутку окна наверх (AppRoot scroll="global"),
  // иначе развёрнутый документ наследует скролл сетки. Плавность — по тумблеру Motion.
  useEffect(() => {
    if (openId !== null) window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' });
  }, [openId, motion]);

  const stageHeight = openDoc
    ? expandedCardHeight(openDoc.count, stageW)
    : gridHeight(documents.length + 1, stageW);

  const bgCls = ['docs-bg', !motion && 'no-motion'].filter(Boolean).join(' ');

  // Отдельная карточка «добавить документ» — последняя в сетке, не раскрывается.
  const addSlot = cardSlot(documents.length, stageW);
  const addDocStyle: CSSProperties = {
    left: addSlot.left,
    top: addSlot.top,
    width: cardWidth(stageW),
    height: cardHeight(stageW),
  };
  const addDocCls = ['doc-card', 'doc-card--adddoc', openId !== null && 'is-dimmed'].filter(Boolean).join(' ');

  const stage = (
    <div className="docs-stage" style={{ width: stageW, height: stageHeight }}>
      {documents.map((item, i) => (
        <DocumentStack
          key={item.id}
          item={item}
          gridIndex={i}
          stageW={stageW}
          open={openId === item.id}
          dimmed={openId !== null && openId !== item.id}
          onOpen={setOpenId}
        />
      ))}
      <div className={addDocCls} style={addDocStyle}>
        <AddTile />
      </div>
    </div>
  );

  return (
    <Panel nav={nav}>
      <PanelHeader
        fixed
        before={
          <PanelHeaderButton aria-label="Назад" onClick={() => setOpenId(null)}>
            <Icon24ChevronLeftOutline />
          </PanelHeaderButton>
        }
        delimiter="none"
      >
        <CrossfadeTitle open={openId !== null} docTitle={openDoc?.title ?? ''} animate={motion} />
      </PanelHeader>
      {/* При выключенном Motion жеста нет — рендерим обычный div (см. решение). */}
      {motion ? (
        <Touch
          Component="div"
          getRootRef={bgRef}
          className={bgCls}
          noSlideClick
          onStart={onSwipeStart}
          onMoveX={onSwipeMove}
          onEnd={onSwipeEnd}
        >
          {stage}
        </Touch>
      ) : (
        <div ref={bgRef} className={bgCls}>
          {stage}
        </div>
      )}
    </Panel>
  );
}
