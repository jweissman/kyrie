// Probe (86a603d, MechanicsText.holds): whether an applied condition reads "X is <condition>" or "X gains <condition>"
// is decided by a closed list of English word endings (ed, en, ing, ous, ful, ic, al, ant, ent, …) over the condition's
// display name. List the conditions the list calls states, so nouns misread as adjectives can be seen.
// Usage: bun new-condition-wording.ts
import { Canon } from '../../../../../src/canon/canon';
import { Content } from '../../../../../src/content';
import { MechanicsText } from '../../../../../src/presentation/mechanics-text';

const said = new RegExp(`(${['ed', 'en', 'ing', 'lit', 'proof', 'ous', 'ful', 'less', 'ble', 'ive', 'ant', 'ent', 'ane',
  'ic', 'al', 'asleep', 'awake', 'afraid', 'alight', 'ready', 'prone', 'blind', 'deaf'].join('|')})$`);
const names = Object.entries(Canon.conditions).map(([id, c]) => ({ id, name: c.name }));
const being = names.filter(n => n.name.split(/\s+/).some(w => said.test(w)));
console.log(`conditions ${names.length}; read as a state ("is …") ${being.length}`);
console.log(being.map(n => n.name).sort().join(' | '));
// The sentences as players read them, for abilities that apply one of these.
const lines = Content.abilities.flatMap(a => { try { return [MechanicsText.ability(a as never).summary]; } catch { return []; } })
  .filter(s => / (is|are) /.test(s));
console.log(`\nability summaries using "is/are": ${lines.length}; samples:`);
for (const l of lines.filter(l => /(is|are) (Bleed|Poison|Regen|Haste|Shield|Rage|Focus|Ward|Blessing|\w+ Strength|Mark)/i.test(l)).slice(0, 12)) { console.log(' -', l); }
