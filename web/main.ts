import { PlayerApp } from './player-app';

const root = document.getElementById('app');
if (root) {
  new PlayerApp(root).boot().catch((error: unknown) => {
    root.insertAdjacentHTML('afterbegin', `<p class="banner danger">Kyrie failed to start: ${String(error)}</p>`);
  });
}
