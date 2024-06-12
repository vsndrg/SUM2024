import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './map';

async function onLoad() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const root = createRoot(rootElement);
  root.render(<App></App>);
}

window.onload = onLoad;
