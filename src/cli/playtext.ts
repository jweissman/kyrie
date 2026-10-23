// A walk through a fresh country, written out as the page tells it, for editors to read in place: each thing done,
// what came of it, and each new place as it is first seen. The walk is seeded, so the same walk reads the same.
//   bin/kyrie playtext <seed> [steps] [--origin kin] [--class mage] [--walk w] > walk.md
import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { PlaySession } from '../session/play-session';
import { PlayerView } from '../presentation/player-view';
import { ScreenModel } from '../ui/screen-model';
import { ActionFeedbackView } from '../presentation/action-feedback';
import { Narrator, type Leaf } from '../presentation/narrator';
import { Expressions } from '../expressions';

export class Playtext {
  static readonly skip = new RegExp('^(attack|risk|put_item|transfer_item|equip|prepare_spell|raise_quality'
    + '|learn_spell|take_feat|field_spell|use_item)');
  static readonly favoured = /^(go|ask|talk|tell|greet|pet|gather|search|look_closely|change_thing|recruit|lead|buy)/;
  static option(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] ?? fallback : fallback;
  }
  static page(leaf: Leaf, place: string, when: string): string[] {
    const out: string[] = [];
    if (leaf.journey?.length) { out.push(...leaf.journey.map(l => `> ${l}`), ''); }
    for (const l of leaf.exchange?.lines ?? []) { out.push(l.kind === 'speech' ? `> ${l.text}` : l.text, ''); }
    if (leaf.exchange?.notes.length) { out.push(`*${leaf.exchange.notes.join(' · ')}*`, ''); }
    if (leaf.moved || !leaf.exchange) {
      out.push(`### ${place.charAt(0).toUpperCase()}${place.slice(1)} — ${when}`, '', ...leaf.situation.map(p => `${p}\n`),
        ...leaf.presence.map(p => `${p}\n`));
    }
    return out;
  }
  static async main(args: string[]) {
    const [seed = 'thorn', steps = '40'] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
    const origin = this.option(args, 'origin', 'wanderer'), classId = this.option(args, 'class', 'warrior');
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: classId as 'warrior' }] });
    const s = await PlaySession.start(world.path, seed, world.source);
    const rng = new Expressions(`playtext:${this.option(args, 'walk', seed)}`);
    const first = ScreenModel.build(s.campaign);
    const out = [`# ${world.report.region.name}: a walk of ${steps}`, '',
      `Seed \`${seed}\`, origin \`${origin}\`, calling \`${classId}\`. Written by \`bin/kyrie playtext\`.`, '',
      ...this.page(Narrator.leaf(s.campaign, first), first.place.name, first.clock)];
    for (let i = 0; i < Number(steps); i++) {
      const choices = PlayerView.choices(s.campaign).filter(c => !this.skip.test(c.choice.id))
        .flatMap(c => this.favoured.test(c.choice.id) ? [c, c, c] : [c]);
      if (!choices.length) { out.push('*There is nothing left to do.*'); break; }
      const c = choices[rng.number(`1d${choices.length}`) - 1]!, before = PlayerView.observe(s.campaign);
      const event = await s.perform(c.choice.id), feedback = ActionFeedbackView.read(s.campaign, event, before);
      const moved = before.location?.id !== s.campaign.world.one('at', 'party'), now = ScreenModel.build(s.campaign);
      out.push(`**${i + 1}. ${c.choice.name}**`, '', ...this.page(Narrator.leaf(s.campaign, now,
        { event, feedback, said: c.choice.name, moved }), now.place.name, now.clock));
    }
    console.log(out.join('\n'));
  }
}

