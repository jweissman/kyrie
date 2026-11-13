import { PlaySession } from '../../../src/session/play-session';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../src/presentation/player-view';
import { CombatPresenter } from '../../../src/ui/combat-presenter';
import { Tactics } from '../../../src/tactics';
import { Canon } from '../../../src/canon/canon';
const s = await PlaySession.start('data/campaigns/serewater-march.campaign.json', 'playthrough', NodeBundleSource.shared);
const log = (t: string) => console.log(t);
const sheet = () => {
  for (const c of s.campaign.state.creatures.filter(c => s.campaign.state.partyIds.includes(c.id))) {
    const b = c.base;
    log(`  ${c.name}: ${c.raceId} ${c.classId} L${b.level} HP ${c.state.hp}/${b.maxHp} slots ${c.state.mana}/${b.maxMana} `
      + `STR ${b.strength} DEX ${b.dexterity} CON ${b.constitution} INT ${b.intelligence} WIS ${b.wisdom} CHA ${b.charisma} gold ${c.state.gold}`);
    log(`    traits ${c.traits?.join(', ')}; knows ${b.abilities.map(a => Canon.abilities[a]?.name ?? a).join(', ')}`);
    log(`    gear ${(c.state.inventory ?? []).map(i => i.definition + (i.equipped ? '*' : '')).join(', ')}; conditions ${c.state.conditions.map(x => x.id).join(', ')}`);
  }
};
const look = () => {
  const v = PlayerView.observe(s.campaign);
  for (const o of v.observations) log(`  | ${o.text}`);
  log(`  choices: ${v.choices.map(c => c.name).join(' / ')}`);
};
const act = async (prefix: string, controller = (b: any) => Promise.resolve(Tactics.choose(b.state, b.legalCommands()))) => {
  const choice = PlayerView.observe(s.campaign).choices.find(c => c.id.startsWith(prefix));
  if (!choice) { log(`!! NOT AVAILABLE: ${prefix}`); look(); return undefined; }
  const e = await s.perform(choice.id, controller);
  log(`> ${choice.name}   [${e.result}, watch ${s.campaign.state.elapsed}]`);
  if (e.response) log(`  "${e.response}"`);
  for (const p of e.perceptions ?? []) if (p.kind !== 'observation') log(`  * ${p.text}`);
  const state = { combatants: s.campaign.state.party.concat([]), turn: 0, actor: '', outcome: null } as any;
  const names = new Map(s.campaign.state.creatures.map(c => [c.id, c.name]));
  for (const c of e.combat) {
    const line = CombatPresenter.format(c, { ...state, combatants: [...names].map(([id, name]) => ({ id, name })) } as any);
    if (line) log(`  ~ ${line}`);
  }
  return e;
};
log('== PREPARATION'); sheet(); look();
await act('go(march__shop_door'); await act('march__nera_preparation'); look();
await act('buy_item(march__nera_antidote_1,march__member_party_3'); await act('go(march__shop_door');
await act('go(march__shrine_door'); await act('keepers__mandate'); await act('salvage__concern');
await act('go(march__shrine_door'); await act('rescue__plea');
log('== EXPLORATION');
await act('go(march__causeway_path'); look(); await act('change_thing(hill__boar_pass'); await act('go(hill__low_path');
await act('go(hill__culvert'); look();
await act('go(hill__workshop_door'); await act('examine(hill__survey_board'); await act('go(hill__workshop_door');
await act('change_thing(hill__padlock_pick'); await act('go(hill__stores_door'); look();
await act('take_item(rescue__bar,march__member_party_2'); await act('take_item(hill__line_cache,march__member_party_1');
await act('equip_item(hill__line_cache,march__member_party_1');
await act('go(hill__stores_door'); await act('go(hill__gallery_steps'); look();
log('== ENCOUNTER: the hound'); await act('attack(hill__hound'); sheet(); look();
log('== RESCUE'); await act('go(hill__hoist_passage'); look();
await act('salvage__claim'); await act('rescue__what_happened'); await act('rescue__lever_free'); await act('take_item(salvage__prize,march__member_party_2');
await act('rescue__plans'); await act('lead(rescue__guest');
log('== RETURN'); await act('go(hill__hoist_passage'); await act('go(hill__gallery_steps'); await act('go(hill__workshop_door'); await act('go(hill__arch');
look(); await act('salvage__deliver_prize'); await act('go(hill__yard_track'); await act('go(march__ridge_track'); await act('go(march__causeway_path');
look(); await act('rescue__thanks'); await act('go(march__oar_door'); await act('take_lodging'); sheet(); look();
