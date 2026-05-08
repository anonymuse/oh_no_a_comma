export const Fragment = Symbol.for('react.fragment');

export interface VNode {
  type: string | Function | symbol;
  props: Record<string, unknown>;
  key?: unknown;
}

export function jsx(type: VNode['type'], props: Record<string, unknown>, key?: unknown): VNode {
  return { type, props: props ?? {}, key };
}

export const jsxs = jsx;
