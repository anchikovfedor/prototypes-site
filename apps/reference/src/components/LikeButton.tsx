import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon28Favorite } from '@vkontakte/icons';
import { usePrototypeSettings } from '@proto/kit';

/**
 * Micro-interaction на Framer Motion: «нравится» с пружинным поп-эффектом.
 * Уважает и системный prefers-reduced-motion, и тумблер Motion в dev-панели.
 */
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  const { motion: motionOn } = usePrototypeSettings();
  const systemReduced = useReducedMotion();
  const animate = motionOn && !systemReduced;

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setLiked((v) => !v);
      }}
      whileTap={animate ? { scale: 0.8 } : undefined}
      animate={animate ? { scale: liked ? [1, 1.35, 1] : 1 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
      aria-pressed={liked}
      aria-label="Нравится"
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 8,
        lineHeight: 0,
        color: liked ? '#e64646' : 'var(--vkui--color_icon_secondary)',
      }}
    >
      <Icon28Favorite />
    </motion.button>
  );
}
