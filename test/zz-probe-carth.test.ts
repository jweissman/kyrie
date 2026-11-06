import { it } from 'bun:test';
import { Gaunt, phases } from './support/gaunt';
it('probe', async () => {
  const g = await Gaunt.start();
  const p = phases('above');
  await g.play(...p.road, ...p.carth);
  console.log(g.at('party'), g.j.watch());
  try { await g.play('To the Long Shambles', 'To the Bearer', 'Into the Penitentiary'); } catch (e) { console.log('ERR', String(e).slice(0, 300)); }
  console.log(g.at('party'), g.j.watch());
}, 300000);
