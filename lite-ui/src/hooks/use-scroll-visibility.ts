import { useEffect, useRef, useState } from 'react';

/**
 * Options for {@link useScrollVisibility}.
 * @property {number} [hideOffsetPx=64] - Keep visible while scrollY is at or
 *   below this offset (px from top).
 * @property {number} [scrollDeltaPx=12] - Minimum scroll movement (px) before
 *   toggling visibility; ignores small jitter.
 */
type ScrollVisibilityProps = {
  hideOffsetPx?: number,
  scrollDeltaPx?: number,
};

const DEFAULT_HIDE_OFFSET_PX = 64;
const DEFAULT_SCROLL_DELTA_PX = 12;

/**
 * Tracks window scroll direction to decide whether a sticky UI (header, toolbar)
 * should be hidden.
 *
 * Tuned for a cheap scroll path: one passive listener, rAF-coalesced reads,
 * and React state updates only when visibility actually changes.
 *
 * ## Flow
 * 1. Mount once: attach a passive `window` `scroll` listener (never re-bound
 *    when options change; latest thresholds live in a ref).
 * 2. Coalesce bursts with `requestAnimationFrame` (at most one read per frame).
 * 3. Read `scrollY` and compare to the previous sample.
 * 4. If `scrollY <= hideOffsetPx`, force visible and skip direction logic.
 * 5. If movement is smaller than `scrollDeltaPx`, ignore (no `lastScrollY`
 *    update, so small moves can accumulate).
 * 6. Otherwise: down → hide, up → show; call `setState` only on a real change.
 * 7. On unmount, remove the listener and cancel any pending animation frame.
 *
 * ## How to use
 * Bind the returned flag to a class or style that slides or fades the element.
 *
 * @example
 * ```tsx
 * import { useScrollVisibility } from '@/hooks';
 *
 * function AppHeader() {
 *   const isHidden = useScrollVisibility({
 *     hideOffsetPx: 64,
 *     scrollDeltaPx: 12,
 *   });
 *
 *   return (
 *     <header className={isHidden ? 'header--hidden' : 'header'}>
 *       Brand
 *     </header>
 *   );
 * }
 * ```
 *
 * @param {ScrollVisibilityProps} [props] - Thresholds for top offset and delta.
 * @returns {boolean} `true` when the UI should be hidden (scrolled down past
 *   the top offset); `false` when it should stay visible.
 */
export default function useScrollVisibility(
  props: ScrollVisibilityProps = {},
): boolean {
  const {
    hideOffsetPx = DEFAULT_HIDE_OFFSET_PX,
    scrollDeltaPx = DEFAULT_SCROLL_DELTA_PX,
  } = props;

  const optionsRef = useRef({ hideOffsetPx, scrollDeltaPx });
  optionsRef.current.hideOffsetPx = hideOffsetPx;
  optionsRef.current.scrollDeltaPx = scrollDeltaPx;

  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let frameId = 0;
    let hidden = false;

    const onFrame = () => {
      frameId = 0;
      const options = optionsRef.current;
      const currentScrollY = window.scrollY > 0 ? window.scrollY : 0;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= options.hideOffsetPx) {
        lastScrollY = currentScrollY;
        if (!hidden) return;
        hidden = false;
        setIsHidden(false);
        return;
      }

      if (delta < options.scrollDeltaPx && delta > -options.scrollDeltaPx) {
        return;
      }

      lastScrollY = currentScrollY;
      const nextHidden = delta > 0;
      if (nextHidden === hidden) return;
      hidden = nextHidden;
      setIsHidden(nextHidden);
    };

    const onWindowScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(onFrame);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return isHidden;
}
