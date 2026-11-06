import { it } from 'bun:test';
import { Ring } from './support/ring';
import { GeneratedWorld } from './support/generated';
it('explore', async () => {
  const world = await Ring.world('thorn', 'mountain');
  const { s, j, town } = world;
  await GeneratedWorld.travel(s, `${town}_taproom`);
  await j.play('Search');
  j.coin(60);
  await j.play("To the Exchange's cellar", 'Pay the cellar-men six', 'Look through the cellar', 'Pack › A cellar waybill › Read', "^To the taproom");
  j.roll('pass');
  await j.play('Put the cellar waybill to');
  console.log('LT', j.latest.slice(-500));
  console.log('N2', Ring.names(j).filter(n => /counting|stair/i.test(n)));
  await j.play('^To the counting-room');
  console.log('N3', Ring.names(j).filter(n => /strongbox|leaf|key|Open|Pick|Take/i.test(n)).slice(0,12));
  await j.play('Open the strongbox');
  console.log('N4', Ring.names(j).filter(n => /day-book|Take|Look|Search|Examine/i.test(n)).slice(0,12), j.at('factors__leaf'), j.holds('inside','factors__leaf','factors__strongbox'));
}, 120000);
