import { mkdir } from 'node:fs/promises';
import { FrontierHistories } from '../test/frontier-histories';
import { OrraHistories } from '../test/orra-histories';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ModuleWriter } from '../src/lang/module-writer';

export class FrontierRecord {
  static readonly out = 'doc/playtests/frontier';
  static motivated() {
    return FrontierHistories.first.flatMap(c => c === 'travel(refuge__porch)' ? [c, 'refuge__mere_concern'] :
      c === 'passage(tower__vault)' ? [c, 'tower__ys_mission'] : [c])
      .filter((c, i, all) => c !== 'refuge__mere_concern' || all.slice(0, i).filter(x => x === c).length === 0);
  }
  static async dossier(s: PlaySession, name: string) {
    const c = s.campaign, world = c.world.snapshot;
    const dossier = { seed: s.seed, party: s.transcript.party, context: name,
      clock: FictionalTime.at(c.state.elapsed),
      places: c.module.entities.filter(e => e.type === 'place'),
      routes: world.relations.filter(r => ['route', 'gate', 'informedPassage'].includes(r.name)),
      inhabitants: c.state.creatures,
      actors: c.actors.map(a => ({ ...a, goals: a.goals.map(g => ({ ...g,
        when: ModuleWriter.predicate(g.when), target: ModuleWriter.predicate(g.target) })) })),
      established: c.module.entities.filter(e => e.type === 'fact'),
      knowledgeAndEvidence: world.relations.filter(r => ['knows', 'assumesFalse', 'reveals', 'testimony'].includes(r.name)),
      quantitiesAndSchedules: world.measures, bindings: c.module.entities.filter(e => e.creatureId),
      rules: c.module.rules, outcomes: c.state.outcomes };
    await Bun.write(`${this.out}/${name}.dossier.json`, JSON.stringify(dossier, null, 2));
    await Bun.write(`${this.out}/${name}.lowered.kyr`, ModuleWriter.write({ ...c.module, actions: c.schemas }));
  }
  static async run() {
    await mkdir(this.out, { recursive: true });
    const initial = await FrontierHistories.start(); await this.dossier(initial, 'fen');
    const pine = await FrontierHistories.start(FrontierHistories.fellowship, 'data/frontier/pine.campaign.json');
    await this.dossier(pine, 'pine');
    const bypass = ['travel(refuge__green)', 'travel(margin__track)', 'travel(margin__camp)',
      'margin__tala_welcome', 'margin__tala_route', 'travel(margin__track)', 'passage(margin__shrine)',
      'examine(margin__tide_marks)', 'disable(margin__font)', 'salvage_coin(margin__purse)',
      'travel(margin__track)', 'travel(refuge__green)', 'travel(refuge__porch)', 'rest(refuge__porch)'];
    const abandoned = [...OrraHistories.expedition, 'learn_reward(tower__cinder_gift,refuge__member_shield)',
      'travel(refuge__porch)', 'rest(refuge__porch)', 'travel(refuge__green)', 'travel(margin__track)',
      'travel(margin__camp)', 'margin__tala_welcome', ...Array<string>(30).fill('wait'), 'rest(margin__camp)',
      'travel(margin__track)', 'travel(refuge__green)'];
    const cases = [
      { name: 'fellowship-expeditions', party: FrontierHistories.fellowship,
        commands: [...this.motivated(), ...FrontierHistories.second] },
      { name: 'hired-expeditions', party: FrontierHistories.company,
        commands: [...this.motivated(), ...FrontierHistories.second] },
      { name: 'scout-bypass', party: FrontierHistories.fellowship, commands: [...this.motivated(), ...bypass] },
      { name: 'unresolved-and-abandoned', party: FrontierHistories.fellowship, commands: abandoned },
    ];
    const comparison = [];
    for (const run of cases) {
      const s = await FrontierHistories.start(run.party);
      let text = `# ${run.name}\n\nSeed: orra. ${FictionalTime.at(0)}.\n\n`;
      for (const o of PlayerView.observe(s.campaign).observations) { text += `${FictionalTime.prose(o.text)}\n\n`; }
      for (const command of run.commands) {
        const before = PlayerView.observe(s.campaign), event = await s.perform(command);
        const f = ActionFeedbackView.read(s.campaign, event, before);
        text += `> ${f.attempt} — ${f.time}\n\n${f.result}\n\n`;
        for (const line of [...f.resources, ...f.discoveries, ...f.immediate, ...f.observations]) {
          text += `${line}\n\n`;
        }
        if (f.available.length) { text += `Now available here: ${f.available.join('; ')}.\n\n`; }
      }
      await Bun.write(`${this.out}/${run.name}.md`, text);
      await Bun.write(`${this.out}/${run.name}.replay.json`, JSON.stringify(s.transcript, null, 2));
      await Bun.write(`${this.out}/${run.name}.save.json`, JSON.stringify(s.checkpoint()));
      comparison.push({ name: run.name, time: FictionalTime.at(s.campaign.state.elapsed),
        elapsed: s.campaign.state.elapsed, outcomes: s.campaign.state.outcomes,
        party: s.campaign.state.party.map(p => ({ name: p.name, hp: p.hp, maxHp: p.maxHp, mana: p.mana,
          gold: p.gold, conditions: p.statuses, abilities: p.abilities, experience: p.experience })) });
    }
    await Bun.write(`${this.out}/comparison.json`, JSON.stringify(comparison, null, 2));
    console.log(`Recorded ${cases.length} complete histories and two region dossiers in ${this.out}`);
  }
}
if (import.meta.main) { await FrontierRecord.run(); }
