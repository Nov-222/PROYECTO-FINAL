// frontend-ts/src/core/renderDOM.ts

import Block from './Block';

export function renderDOM(query: string, block: Block) {
  const root = document.querySelector(query);

  if (!root) {
    throw new Error(`Elemento ${query} no encontrado en el DOM`);
  }

  root.innerHTML = '';
  root.appendChild(block.getContent()!);
  block.dispatchComponentDidMount();

  return root;
}