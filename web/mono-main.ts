import { MonoApp } from './mono-app';

const root = document.getElementById('mono');
if (root) {
  const app = new MonoApp(root);
  (window as unknown as { kyrieMono: MonoApp }).kyrieMono = app;
  app.boot();
}
