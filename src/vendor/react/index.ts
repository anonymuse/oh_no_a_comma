type EffectCallback = () => void | (() => void);

interface HookState {
  values: unknown[];
  deps: Array<readonly unknown[] | undefined>;
  cleanups: Array<(() => void) | undefined>;
}

let activeHookState: HookState | undefined;
let hookIndex = 0;
let rerender: (() => void) | undefined;
const rootHookState: HookState = { values: [], deps: [], cleanups: [] };

function depsChanged(previous: readonly unknown[] | undefined, next: readonly unknown[] | undefined): boolean {
  if (!previous || !next || previous.length !== next.length) return true;
  return next.some((value, index) => !Object.is(value, previous[index]));
}

export function prepareToRender(renderAgain: () => void): void {
  activeHookState = rootHookState;
  hookIndex = 0;
  rerender = renderAgain;
}

export function useState<T>(initialValue: T | (() => T)): [T, (next: T | ((current: T) => T)) => void] {
  if (!activeHookState) throw new Error('useState must be called while rendering');
  const currentIndex = hookIndex++;

  if (!(currentIndex in activeHookState.values)) {
    activeHookState.values[currentIndex] = typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  const setState = (next: T | ((current: T) => T)) => {
    const current = rootHookState.values[currentIndex] as T;
    rootHookState.values[currentIndex] = typeof next === 'function'
      ? (next as (current: T) => T)(current)
      : next;
    rerender?.();
  };

  return [activeHookState.values[currentIndex] as T, setState];
}

export function useMemo<T>(factory: () => T, deps?: readonly unknown[]): T {
  if (!activeHookState) throw new Error('useMemo must be called while rendering');
  const currentIndex = hookIndex++;

  if (!(currentIndex in activeHookState.values) || depsChanged(activeHookState.deps[currentIndex], deps)) {
    activeHookState.values[currentIndex] = factory();
    activeHookState.deps[currentIndex] = deps;
  }

  return activeHookState.values[currentIndex] as T;
}

export function useEffect(callback: EffectCallback, deps?: readonly unknown[]): void {
  if (!activeHookState) throw new Error('useEffect must be called while rendering');
  const currentIndex = hookIndex++;

  if (!depsChanged(activeHookState.deps[currentIndex], deps)) return;

  window.queueMicrotask(() => {
    rootHookState.cleanups[currentIndex]?.();
    const cleanup = callback();
    rootHookState.cleanups[currentIndex] = typeof cleanup === 'function' ? cleanup : undefined;
    rootHookState.deps[currentIndex] = deps;
  });
}
