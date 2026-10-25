// Phase III probe (review artifact). Run: bun doc/architecture/next-phase-independent-review/phase-3/probes/two-institutions.probe.ts
// Hypothesis: two independently written institutions can come to interact through the shared rules' vocabulary
// (dominion.kyr's keeps, ambitions.kyr's pursues/stage) plus one small shared "lore" vocabulary file, with no
// strategic layer and neither module naming the other. The academy's rules range over ?holder: whoever keeps a
// forbidden thing. The tower declares that its circle keeps a forbidden codex. Reports: with the tower installed and
// without; the academy's undertaking over time (gold spent, a report made); what a companion-to-be can be asked;
// save/restore and a fresh-process-equivalent replay.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { LocalKinds } from '../../../../../src/canon/local-catalog';

const lore = `Module lore "A shared vocabulary of learned things" {
  Relation forbidden(entity).
  Goal false.
}`;
const academy = `Module academy "The Academy of the Stair" {
  Place city "Caer Velin" is settlement.
  Place stair "the Scholars' Stair" is room within city at 0, 0.
  Place hall "the masters' hall" is room within city at 1, 0.
  Passage arch "the arch" is door between stair and hall.
  Company party "You" of 1 at stair.
  Person masters "the masters of the Stair" at hall { Role "the masters of the academy". Ancestry human. Numbers 2. Peaceable. }
  Person ferrand "Ferrand" at stair { Role "a junior lecturer in old tongues". Ancestry human. Peaceable. }
  Relation watching(group, group). Relation reported(group). Relation sentFor(group).
  Entity inquiry: ambition "the masters' inquiry into forbidden learning".
  Initially Assert pursues(masters, inquiry). Initially Set pace(inquiry) to 12. Initially Set stageDue(inquiry) to 6.
  Initially Set quantity(masters, gold) to 40.
  // The masters hear of anyone who keeps a forbidden thing, whoever they are: this module names no one.
  Rule masters_hear when forbidden(?x) and keeps(?h, ?x) and not watching(masters, ?h) { Assert watching(masters, ?h). }
  // At the inquiry's first stage they spend money on it: a reader is sent for.
  Rule masters_send when stage(inquiry) >= 1 and watching(masters, ?h) and not sentFor(masters) {
    Decrease quantity(masters, gold) by 15. Assert sentFor(masters). }
  Rule masters_report when stage(inquiry) >= 2 and sentFor(masters) and not reported(masters) { Assert reported(masters). }
  Topic ferrand_worry with ferrand "Ask Ferrand why the masters are spending" when sentFor(masters) and not reported(masters) {
    Says "'They have sent for a reader of the old hand,' says Ferrand, too quickly. 'Someone keeps a book they should not. I am not to say who.'".
  }
  Topic ferrand_report with ferrand "Ask Ferrand what the reader found" when reported(masters) {
    Says "Ferrand lowers his voice. 'Whoever keeps it is not a scholar. The masters will want it brought here, and they will not ask nicely.'".
  }
  Observe stair_scene at stair when true "The Scholars' Stair climbs between lecture halls, worn hollow in the middle.".
  Goal false.
}`;
const tower = `Module tower "The tower at Ashmere" {
  Place mere "Ashmere" is wilderness.
  Place tower_top "the tower's upper room" is room within mere at 0, 0.
  Person circle "the circle of Ashmere" at tower_top { Role "readers of what should not be read". Ancestry human. Numbers 2. Peaceable. }
  Kind grey_codex "a codex bound in grey" is treasure worth 20. Item codex "a codex bound in grey" is grey_codex at tower_top.
  Initially Assert keeps(circle, codex). Initially Assert forbidden(codex).
  Observe top_scene at tower_top when true "Shelves to the ceiling, and a reading-stand with a grey book on it.".
  Goal false.
}`;
const files = (withTower: boolean): Record<string, string> => ({
  'p3/lore/lore.kyr': lore,
  'p3/academy/site.kyr': academy,
  'p3/academy/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', '../lore/lore.kyr'], globals: ['party'], exports: { party: 'party' } }),
  'p3/tower/site.kyr': tower,
  'p3/tower/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', '../lore/lore.kyr'] }),
  'p3/c.campaign.json': JSON.stringify({ version: 1, name: 'Two institutions', modules: [{ id: 'academy', bundle: 'academy/module.json' },
    ...withTower ? [{ id: 'tower', bundle: 'tower/module.json' }] : []], party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
});
async function play(withTower: boolean) {
  LocalKinds.reset();
  const overlay = new OverlayBundleSource(NodeBundleSource.shared, files(withTower));
  const path = overlay.resolve('p3/c.campaign.json');
  const s = await PlaySession.start(path, 'p3', overlay);
  const facts = () => s.campaign.world.describe().filter(f => /watching|sentFor|reported|stage\(|quantity\(academy__masters, gold/.test(f));
  console.log(`\n== ${withTower ? 'academy + tower' : 'academy alone'}: at start`, facts());
  for (let i = 0; i < 4; i++) { await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id === 'wait_hour')!.choice.id); }
  console.log('after 4 hours:', facts());
  const ask = PlayerView.choices(s.campaign).filter(c => /Ferrand/.test(c.choice.name)).map(c => c.choice.name);
  console.log('Ferrand topics offered:', ask);
  const topic = PlayerView.choices(s.campaign).find(c => /why the masters/.test(c.choice.name));
  if (topic) { await s.perform(topic.choice.id); }
  for (let i = 0; i < 3; i++) { await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id === 'wait_hour')!.choice.id); }
  console.log('after 3 more hours:', facts(), '| topics:', PlayerView.choices(s.campaign).filter(c => /Ferrand/.test(c.choice.name)).map(c => c.choice.name));
  // Persistence and replay.
  const ck = s.checkpoint(), restored = PlaySession.resume(ck);
  const replayed = await PlaySession.start(path, 'p3', overlay); await replayed.replay(ck.transcript.steps);
  const key = (x: PlaySession) => Bun.hash(JSON.stringify(x.campaign.world.describe().sort())).toString(16);
  console.log('facts hash: live', key(s), 'restored', key(restored), 'replayed', key(replayed));
}
await play(true);
await play(false);
