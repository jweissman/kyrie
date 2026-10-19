import { App } from './app';

const root = document.getElementById('app');
if (root) {
  new App(root).boot().catch((error: unknown) => {
    root.insertAdjacentHTML('afterbegin', `<p class="banner danger">Kyrie failed to start: ${String(error)}</p>`);
  });
}
