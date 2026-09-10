import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

/**
 * Measured box of the active tab, relative to the list container.
 *
 * Coordinates use `offsetLeft` / `offsetTop` so the indicator can sit as an
 * absolutely positioned child of the same list without viewport math.
 *
 * @property {number} left - Distance from the list's left edge (px).
 * @property {number} top - Distance from the list's top edge (px).
 * @property {number} width - Active tab width (px).
 * @property {number} height - Active tab height (px).
 * @property {boolean} isReady - `true` when an active tab was found and
 *   measured; `false` for the empty / hidden placeholder.
 */
export type SlidingIndicatorBox = {
  left: number,
  top: number,
  width: number,
  height: number,
  isReady: boolean,
};

/**
 * Zero-size placeholder used before the first successful measure, when
 * disabled, or when no element matches `activeSelector`.
 *
 * Pair with `indicatorStyle.opacity` (0 while not ready) so the indicator
 * stays invisible until layout is known.
 */
export const emptySlidingIndicator: SlidingIndicatorBox = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  isReady: false,
};

/**
 * Options for {@link useSlidingIndicator}.
 *
 * @property {string | number | boolean} [syncKey] - Value that changes when
 *   the active tab changes (e.g. route id, tab index). Triggers a
 *   synchronous remeasure in `useLayoutEffect` before paint.
 * @property {string} [activeSelector='.is-active'] - CSS selector for the
 *   active tab inside the list. Must match one `HTMLElement`.
 * @property {boolean} [enabled=true] - When `false`, clears the indicator
 *   and tears down observers.
 */
type UseSlidingIndicatorOptions = {
  syncKey?: string | number | boolean,
  activeSelector?: string,
  enabled?: boolean,
};

type IndicatorStyle = Pick<
  CSSProperties,
  'transform' | 'width' | 'height' | 'opacity'
>;

const DEFAULT_ACTIVE_SELECTOR = '.is-active';

/**
 * Returns true when both indicator boxes match.
 *
 * @example
 * isSameIndicatorBox(prev, next);
 */
const isSameIndicatorBox = (
  left: SlidingIndicatorBox,
  right: SlidingIndicatorBox,
) => (
  left.left === right.left
  && left.top === right.top
  && left.width === right.width
  && left.height === right.height
  && left.isReady === right.isReady
);

/**
 * Builds CSS for a sliding indicator from a measured box.
 *
 * @example
 * toIndicatorStyle(box);
 */
const toIndicatorStyle = (box: SlidingIndicatorBox): IndicatorStyle => ({
  transform: `translate(${box.left}px, ${box.top}px)`,
  width: `${box.width}px`,
  height: `${box.height}px`,
  opacity: box.isReady ? 1 : 0,
});

/**
 * Measures the active tab box relative to the list container.
 *
 * Looks up `list.querySelector(activeSelector)`. If the match is not an
 * `HTMLElement`, returns {@link emptySlidingIndicator}.
 *
 * Uses offset geometry (`offsetLeft`, `offsetTop`, `offsetWidth`,
 * `offsetHeight`) so the result is relative to `list` when the active tab
 * is a positioned descendant of that list.
 *
 * @example
 * const box = measureActiveTab(listElement, '.is-active');
 * // box.isReady === true when a tab matched
 *
 * @param list - Tab list container element.
 * @param activeSelector - Selector for the active tab
 *   (default `.is-active`).
 * @returns Measured box, or {@link emptySlidingIndicator} when missing.
 */
export const measureActiveTab = (
  list: HTMLElement,
  activeSelector = DEFAULT_ACTIVE_SELECTOR,
): SlidingIndicatorBox => {
  const active = list.querySelector(activeSelector);
  if (!(active instanceof HTMLElement)) return emptySlidingIndicator;
  return {
    left: active.offsetLeft,
    top: active.offsetTop,
    width: active.offsetWidth,
    height: active.offsetHeight,
    isReady: true,
  };
};

/**
 * Tracks a sliding underline / pill under the active tab inside a list.
 *
 * Bind `listRef` to the tab list. Mark the active item with a class (default
 * `.is-active`). Apply `indicatorStyle` to an absolutely positioned child
 * of that list. Prefer CSS `transition` on `transform` / `width` /
 * `height` for the slide animation.
 *
 * Tuned for a cheap layout path: option refs (no observer churn),
 * rAF-coalesced reads, ResizeObserver + MutationObserver, and React
 * state updates only when the measured box actually changes.
 *
 * ## Flow
 * 1. **Options ref** — Each render copies `enabled` and `activeSelector`
 *    into `optionsRef`. Observers stay mounted; the next sync reads the
 *    latest options without reconnecting.
 * 2. **Stable API** — `syncIndicator` and `scheduleSync` keep a fixed
 *    function identity. They always call the latest logic via `syncRef`.
 * 3. **Sync (measure)** — Resolve the list from `listRef`. If disabled,
 *    apply {@link emptySlidingIndicator}. Otherwise measure with
 *    {@link measureActiveTab}. Skip `setState` when the box is unchanged.
 *    Re-point ResizeObserver at the current active tab when it changes.
 * 4. **Layout sync** — On `syncKey` or `enabled` change, run sync inside
 *    `useLayoutEffect` (before paint) so the indicator does not flash at
 *    the previous tab.
 * 5. **Attach observers** — When `enabled`, attach once the list node
 *    exists:
 *    - `ResizeObserver` on the list (container size changes).
 *    - `ResizeObserver` on the active tab (label / font size changes).
 *    - `MutationObserver` on the list (`class` attributes, child list,
 *      subtree) so class toggles remeasure even without a new `syncKey`.
 *    Observer callbacks call `scheduleSync` (not sync directly).
 * 6. **rAF coalesce** — `scheduleSync` queues at most one
 *    `requestAnimationFrame` per frame. Bursts of resize/mutation events
 *    collapse into a single measure.
 * 7. **Late mount** — If `listRef.current` is still null when the effect
 *    runs, retry attach on the next animation frame.
 * 8. **Style** — `indicatorStyle` maps the box to `transform`, `width`,
 *    `height`, and `opacity` (`0` until `isReady`). Prefer `transform`
 *    for GPU-friendly sliding.
 * 9. **Cleanup** — On disable or unmount: cancel pending frames,
 *    disconnect observers, and clear the active-element watch.
 *
 * ## How to use
 * 1. Put a ref on the tab list container (`position: relative`).
 * 2. Mark the active tab with `is-active` (or pass `activeSelector`).
 * 3. Call the hook with that ref and a `syncKey` that changes with the
 *    active tab (id, index, route, etc.).
 * 4. Render an indicator element as a child of the list and spread
 *    `indicatorStyle` onto it (`position: absolute; left: 0; top: 0`).
 * 5. Animate with CSS transitions on `transform`, `width`, and `height`.
 * 6. Call `syncIndicator()` after imperative DOM changes the hook cannot
 *    see; use `scheduleSync()` when you want the next-frame coalesce.
 *
 * Markup expectations:
 * - The list owns both the tabs and the indicator.
 * - The indicator is out of normal flow (`position: absolute`).
 * - Exactly one element should match `activeSelector` while enabled.
 *
 * @example
 * import { useRef, useState } from 'react';
 * import { useSlidingIndicator } from '@/hooks';
 *
 * function TabBar() {
 *   const listRef = useRef(null);
 *   const [activeId, setActiveId] = useState('home');
 *   const tabs = [
 *     { id: 'home', label: 'Home' },
 *     { id: 'profile', label: 'Profile' },
 *   ];
 *
 *   const { indicatorStyle } = useSlidingIndicator(listRef, {
 *     syncKey: activeId,
 *   });
 *
 *   return (
 *     <ul ref={listRef} className="tabs">
 *       {tabs.map((tab) => (
 *         <li key={tab.id}>
 *           <button
 *             type="button"
 *             className={tab.id === activeId ? 'is-active' : undefined}
 *             onClick={() => setActiveId(tab.id)}
 *           >
 *             {tab.label}
 *           </button>
 *         </li>
 *       ))}
 *       <span className="tabs__indicator" style={indicatorStyle} />
 *     </ul>
 *   );
 * }
 *
 * // CSS sketch:
 * // .tabs { position: relative; display: flex; }
 * // .tabs__indicator {
 * //   position: absolute;
 * //   left: 0;
 * //   bottom: 0;
 * //   transition: transform 200ms ease, width 200ms ease;
 * //   pointer-events: none;
 * // }
 *
 * @param listRef - Ref to the tab list container element.
 * @param options - Sync key, active selector, and enable flag.
 * @returns Hook API:
 * - `indicator` — Latest {@link SlidingIndicatorBox}.
 * - `indicatorStyle` — CSS ready to apply to the indicator node.
 * - `syncIndicator` — Measure immediately (same path as layout sync).
 * - `scheduleSync` — Measure on the next animation frame (coalesced).
 */
export default function useSlidingIndicator(
  listRef: RefObject<HTMLElement | null>,
  options: UseSlidingIndicatorOptions = {},
) {
  const {
    syncKey,
    activeSelector = DEFAULT_ACTIVE_SELECTOR,
    enabled = true,
  } = options;

  const optionsRef = useRef({ activeSelector, enabled });
  optionsRef.current.activeSelector = activeSelector;
  optionsRef.current.enabled = enabled;

  const [indicator, setIndicator] = useState(emptySlidingIndicator);
  const indicatorRef = useRef(emptySlidingIndicator);
  const frameRef = useRef(0);
  const activeElementRef = useRef<Element | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const syncRef = useRef(() => undefined);

  const syncIndicator = useCallback(() => {
    syncRef.current();
  }, []);

  const scheduleSync = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      syncRef.current();
    });
  }, []);

  syncRef.current = () => {
    const list = listRef.current;
    const { activeSelector: selector, enabled: isEnabled } = optionsRef.current;

    if (!isEnabled) {
      if (!isSameIndicatorBox(indicatorRef.current, emptySlidingIndicator)) {
        indicatorRef.current = emptySlidingIndicator;
        setIndicator(emptySlidingIndicator);
      }
      return;
    }
    if (!list) return;

    const next = measureActiveTab(list, selector);
    if (!isSameIndicatorBox(indicatorRef.current, next)) {
      indicatorRef.current = next;
      setIndicator(next);
    }

    const observer = resizeObserverRef.current;
    if (!observer) return;

    const active = list.querySelector(selector);
    const nextActive = active instanceof HTMLElement ? active : null;
    if (nextActive === activeElementRef.current) return;

    if (activeElementRef.current) {
      observer.unobserve(activeElementRef.current);
    }
    activeElementRef.current = nextActive;
    if (nextActive) observer.observe(nextActive);
  };

  useLayoutEffect(() => {
    syncRef.current();
  }, [syncKey, enabled]);

  useEffect(() => {
    if (!enabled) {
      syncRef.current();
      return undefined;
    }

    let isCancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let retryFrame = 0;

    const disconnect = () => {
      activeElementRef.current = null;
      resizeObserverRef.current = null;
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      resizeObserver = null;
      mutationObserver = null;
    };

    const attach = () => {
      const list = listRef.current;
      if (!list || isCancelled) return false;

      disconnect();
      resizeObserver = new ResizeObserver(() => scheduleSync());
      mutationObserver = new MutationObserver(() => scheduleSync());
      resizeObserverRef.current = resizeObserver;
      resizeObserver.observe(list);
      mutationObserver.observe(list, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true,
      });
      syncRef.current();
      return true;
    };

    if (!attach()) {
      retryFrame = window.requestAnimationFrame(() => {
        retryFrame = 0;
        attach();
      });
    }

    return () => {
      isCancelled = true;
      if (retryFrame) window.cancelAnimationFrame(retryFrame);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      disconnect();
    };
  }, [enabled, listRef, scheduleSync]);

  const indicatorStyle = useMemo(
    () => toIndicatorStyle(indicator),
    [
      indicator.left,
      indicator.top,
      indicator.width,
      indicator.height,
      indicator.isReady,
    ],
  );

  return {
    indicator,
    indicatorStyle,
    syncIndicator,
    scheduleSync,
  };
}
