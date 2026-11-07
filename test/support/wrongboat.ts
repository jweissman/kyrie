import { expect } from 'bun:test';
import { Journey } from '../../src/session/journey';

// The Wrong Boat, played by the labels a player sees. The journeys are played: where one needs luck it forces the roll
// (`roll`), and where the engine's clock is the thing under test it waits in pieces, because a wait is broken by an
// arrival. Nothing here sets Bess aside; she is met, avoided, allied with, paid for or outwalked.
export const campaign = 'data/campaigns/wrongboat.campaign.json';
export const quayOpen = ['To the Staithe quay', 'Say which barge you paid for', 'The Mary, I think'];
export const hamperOpen = ['Look under the cloth in the hamper'];
export const board = ['To the deck of the Mary', 'Ask Dolly what the fare is', 'Pay the two shillings each'];
export const start = [...quayOpen, ...hamperOpen, ...board];
export const walkOut = ['To the Staithe road', 'To the horse lines', 'To the mill yard', 'To the weir'];
export const pay = 'Pay the lads fifteen coin to find the wrong woman';
export const toGap = ['To the Highfoot stage', '@bess', 'To the ferrywoman\'s hut', 'Ask Una to put you across', 'Say nothing but yourselves',
  'To the Highfoot stage', 'To the far bank', 'To the foot of the hill road', 'To the gap in the hills'];
// Bess has the carrier's cart: a company that walks the back road is met at the weir or the stage. This is the
// step in a journey where the company deals with her by the same means a player has: a roll, forced to pass.
export const wrap = (j: Journey): Journey => {
  const orig = j.play.bind(j);
  j.play = async (...steps: string[]) => {
    let out = '';
    let chunk: string[] = [];
    const flush = async () => { if (chunk.length) { out = await orig(...chunk); chunk = []; } };
    for (const st of steps) {
      if (st !== '@bess') { chunk.push(st); continue; }
      await flush();
      for (let g = 0; !j.holds('confronted', 'party') && !j.holds('bessMet', 'party') && g < 4; g++) { await orig('=+1'); }
      if (j.holds('confronted', 'party')) { j.roll('pass'); out = await orig('Swear to Bess that you have only cakes'); }
    }
    await flush();
    return out;
  };
  return j;
};
export const begin = async () => wrap(await Journey.start(campaign, 'wb'));
export const t = (j: Journey) => j.watch() - j.measure('t0');
export const until = async (j: Journey, n: number) => { for (let g = 0; t(j) < n && g < 300; g++) { await j.step('=+6'); } };
export const exactly = async (j: Journey, n: number) => { for (let g = 0; t(j) < n && g < 400; g++) { await j.step('=+1'); } };
export const meet = async (j: Journey) => { for (let g = 0; !j.holds('confronted', 'party') && g < 12; g++) { await j.step('=+1'); } };
export const trail = async (j: Journey, watches: number, who = 'wrongboat__bess') => {
  const seen: (string | undefined)[] = [];
  for (let g = 0; g < watches; g++) { await j.step('=+1'); const w = j.at(who); if (seen[seen.length - 1] !== w) { seen.push(w); } }
  return seen;
};
// A chaser who goes A, B, A has a pursuit that is satisfied and let go. A hunt never goes back where it was.
export const noReversal = (seen: (string | undefined)[]) => {
  for (let i = 2; i < seen.length; i++) { expect(seen[i] === seen[i - 2]).toBe(false); }
};
// The Mary at Staithe, with the box shown to the cook: the company knows whose it is.
export const galley = ['To the Mary\'s galley', 'Show Mrs Brabant the music box', 'To the deck of the Mary'];
// Bess met at the fen landing and walked with. The company is "escorted" afterwards, at the weir and elsewhere.
export const allyAboard = async () => {
  const j = await begin();
  await j.play(...start, ...galley);
  await exactly(j, 61);
  await meet(j);
  await j.play('Hear what Bess has to say', 'Tell her it was Hob Garrod who put it aboard');
  return j;
};
