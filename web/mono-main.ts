import { PlayApp } from './play-app';

const root = document.getElementById('mono');
if (root) {
  const app = new PlayApp(root);
  (window as unknown as { kyrieMono: PlayApp }).kyrieMono = app;
  app.boot();
}
