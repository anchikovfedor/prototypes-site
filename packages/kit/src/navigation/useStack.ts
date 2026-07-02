import { useCallback, useState } from 'react';

export interface Stack {
  /** Текущий экран (последний в истории) — для View.activePanel. */
  activePanel: string;
  /** Полная история — для View.history (задаёт направление анимации). */
  history: string[];
  push: (panel: string) => void;
  back: () => void;
  reset: (panel?: string) => void;
  canGoBack: boolean;
}

/**
 * Стек экранов для VKUI View. Смена activePanel + history даёт корректные
 * push/back переходы из коробки. Без URL — для шеринга достаточно URL прототипа.
 */
export function useStack(initial: string): Stack {
  const [history, setHistory] = useState<string[]>([initial]);

  const push = useCallback((panel: string) => {
    setHistory((h) => [...h, panel]);
  }, []);

  const back = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const reset = useCallback(
    (panel?: string) => {
      setHistory([panel ?? initial]);
    },
    [initial],
  );

  return {
    activePanel: history[history.length - 1],
    history,
    push,
    back,
    reset,
    canGoBack: history.length > 1,
  };
}
