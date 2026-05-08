import { Fragment, type VNode } from './react/jsx-runtime.js';
import { prepareToRender } from './react/index.js';

type Renderable = VNode | string | number | boolean | null | undefined | Renderable[];

function isVNode(value: Renderable): value is VNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'type' in value;
}

function append(parent: Node, child: Renderable): void {
  if (child === null || child === undefined || typeof child === 'boolean') return;

  if (Array.isArray(child)) {
    child.forEach((item) => append(parent, item));
    return;
  }

  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
    return;
  }

  if (!isVNode(child)) return;

  if (typeof child.type === 'function') {
    append(parent, child.type(child.props) as Renderable);
    return;
  }

  if (child.type === Fragment) {
    append(parent, child.props.children as Renderable);
    return;
  }

  const element = document.createElement(child.type as string);

  for (const [name, value] of Object.entries(child.props)) {
    if (name === 'children' || value === undefined || value === null || typeof value === 'boolean') continue;
    if (name === 'className') {
      element.setAttribute('class', String(value));
    } else if (name === 'htmlFor') {
      element.setAttribute('for', String(value));
    } else if (name.startsWith('on') && typeof value === 'function') {
      element.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
    } else {
      element.setAttribute(name, String(value));
    }
  }

  append(element, child.props.children as Renderable);
  parent.appendChild(element);
}

export function createRoot(container: Element) {
  let currentTree: Renderable;

  const renderCurrentTree = () => {
    prepareToRender(renderCurrentTree);
    container.replaceChildren();
    append(container, currentTree);
  };

  return {
    render(tree: Renderable) {
      currentTree = tree;
      renderCurrentTree();
    },
  };
}
