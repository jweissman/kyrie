// Summon ids are `summon-${fighters.length}-${turn}` (src/summoning.ts:106). Trimming past the limit splices fighters,
// so a second call in the same turn (a hasted summoner, a cast/cycle, two lapsing 'summoning' conditions) reuses an id.
import { Content } from '../../../../../src/content';
import { Summoning } from '../../../../../src/summoning';
import { Expressions } from '../../../../../src/expressions';
import type { CombatEvent } from '../../../../../src/model';
const content = new Content('ids');
const owner = content.character('warrior', 'owner', 'fighters');
const foe = content.character('warrior', 'foe', 'goblins');
const fighters = [owner, foe]; const events: CombatEvent[] = [];
const ctx: any = { actor: owner, fighters, turn: 7, events, content, abilities: [], retreat: false, location: null, expressions: new Expressions('ids') };
const effect: any = { kind: 'summon', creature: 'wolf', target: 'self' };
console.log('limit', Summoning.limit(owner));
for (let i = 0; i < Summoning.limit(owner) + 2; i++) Summoning.call(effect, owner, ctx);
const ids = fighters.map(f => f.id);
console.log('fighter ids:', ids.join(', '));
console.log('duplicates:', ids.filter((x, i) => ids.indexOf(x) !== i));
console.log('summon events:', events.filter(e => e.type === 'summon' || e.type === 'dismiss').map(e => `${e.type}:${(e as any).target}`).join(' '));
