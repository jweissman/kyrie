// Probe: an NPC undertaking that is OBSTRUCTED (its authored failure happens) is told to the player as done.
// Scenario from test/conflict.test.ts ('the rites spoken ... break the rite').
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { ModuleWriter } from '../../../../../src/lang/module-writer';
import companies from '../../../../../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../../../../../src/content';

const members = companies.companies.find(c => c.id === 'fellowship')!.members as CreatureGenerationContext[];
const s = await PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared, members);
while (s.campaign.state.elapsed < 262) { await s.perform('wait'); }
const world = s.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'march__quay') },
  { kind: 'assert', call: ModuleWriter.call('at', 'party', 'hill__founders') }]);
(s.campaign as unknown as { commit(w: unknown): void }).commit(world);
// The teleport is not in any event's changes; record it on the last event, as a walk there would have (the chronicle
// tracks the company's place only from the log).
(s.campaign.history.at(-1)!.changes as string[]).push('- at(party, march__quay)', '+ at(party, hill__founders)');
await s.perform('rising__keep_custody(hill__founders)');
while (s.campaign.state.elapsed < 280) { await s.perform('wait'); }
const decisions = s.campaign.events.flatMap(e => e.npc ?? []).filter(d => d.action.startsWith('rising__complete_rite'));
console.log('decisions:', JSON.stringify(decisions.map(d => ({ goal: d.goal, action: d.action, elapsed: d.elapsed }))));
console.log('slumbers still (rite failed)?', s.campaign.world.test(ModuleWriter.call('rising__slumbers', 'rising__compact', 'hill__founders')));
const told = PlayerView.chronicle(s.campaign).filter(e => e.kind === 'npc' && /named dead/i.test(e.text));
console.log('chronicle npc entries:', JSON.stringify(told));
console.log('company at:', s.campaign.world.one('at', 'party'));
