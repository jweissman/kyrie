// Effects.validate (src/effects.ts:96-143) accepts these effects; applying them leaves HP above maxHp (negative amounts are caught at roll time by Expressions.number).
import { Content } from '../../../../../src/content';
import { Effects } from '../../../../../src/effects';
import { Expressions } from '../../../../../src/expressions';
import { CreatureSchema } from '../../../../../src/creature';
import { CombatProjection } from '../../../../../src/combat-projection';
const content = new Content('bounds');
const ids = Content.abilities.map(a => a.id);
const revive: any = { kind: 'revive', amount: { kind: 'literal', value: 1 }, target: 'dead ally', percent: 150 };
for (const e of [revive]) { Effects.validate(e, ids); console.log('validate accepts', JSON.stringify(e)); }
const original = content.createCreature('x', { raceId: 'human', classId: 'warrior' });
const f = CombatProjection.fighter(original, 'fighters'); f.hp = 0;
const ctx: any = { actor: f, fighters: [f], turn: 1, events: [], content, abilities: ids, retreat: false, location: null, expressions: new Expressions('b') };
Effects.apply(revive, f, 1, ctx);
console.log('after 150% revive: hp', f.hp, 'maxHp', f.maxHp);
try { CreatureSchema.validate(CombatProjection.creature(f, original)); console.log('schema accepts'); } catch (e) { console.log('store commit would throw:', (e as Error).message); }
