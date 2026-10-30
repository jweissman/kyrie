// A walk through a fresh country, written out as the page tells it, for editors to read in place: each thing done,
// what came of it, and each new place as it is first seen. The walk is seeded, so the same walk reads the same.
//   bin/kyrie playtext <seed> [steps] [--origin kin] [--class mage] [--walk w] [--glance] > walk.md
// With --glance, each place as the page leads with it (see Glance): its line, its life, and what is led with, numbered.
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
  static page(leaf: Leaf, place: string, when: string, glance = false): string[] {
    const out: string[] = [];
    if (leaf.journey?.length) { out.push(...leaf.journey.map(l => `> ${l}`), ''); }
    for (const l of leaf.exchange?.lines ?? []) { out.push(l.kind === 'speech' ? `> ${l.text}` : l.text, ''); }
    if (leaf.exchange?.notes.length) { out.push(`*${leaf.exchange.notes.join(' · ')}*`, ''); }
    if (glance && leaf.glance) { return [...out, ...this.glanced(leaf.glance, place, when)]; }
    if (leaf.moved || !leaf.exchange) {
      out.push(`### ${place.charAt(0).toUpperCase()}${place.slice(1)} — ${when}`, '', ...leaf.situation.map(p => `${p}\n`),
        ...leaf.presence.map(p => `${p}\n`));
    }
    return out;
  }
  // The place as the glance has it: what it is (when come to), its life, what has changed, the aim when said, and
  // what is led with, each with why and what it risks.
  static glanced(g: NonNullable<Leaf['glance']>, place: string, when: string): string[] {
    const head = g.arrival === 'stay' ? [] : [`### ${place.charAt(0).toUpperCase()}${place.slice(1)} — ${when} (${g.arrival})`, ''];
    const acts = g.acts.map((a, i) => `${i + 1}. ${a.label} — ${a.why}${a.note ? `, ${a.note}` : ''}`
      + `${a.marks.length ? ` [${a.marks.map(m => m.kind).join(', ')}]` : ''}`);
    return [...head, ...g.came ? [`*${g.came}*`, ''] : [], ...g.sight ? [g.sight.text, ''] : [],
      ...g.life ? [`${g.life.danger ? '**' : ''}${g.life.text}${g.life.danger ? '**' : ''}`, ''] : [],
      ...g.changed.map(c => `Since you were last here: ${c}\n`), ...g.aim ? [`*Aim: ${g.aim}*`, ''] : [],
      ...acts, ...acts.length ? [''] : [], ...g.ways.length ? [`Ways: ${g.ways.join(', ')}`, ''] : [],
      ...g.need?.length ? [`*${g.need.join(' · ')}*`, ''] : []];
  }
  static async main(args: string[]) {
    const valued = ['--origin', '--class', '--walk'];
    const [seed = 'thorn', steps = '40'] = args.filter((a, i) => !a.startsWith('--') && !valued.includes(args[i - 1] ?? ''));
    const origin = this.option(args, 'origin', 'wanderer'), classId = this.option(args, 'class', 'warrior');
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: classId as 'warrior' }] });
    const s = await PlaySession.start(world.path, seed, world.source);
    const rng = new Expressions(`playtext:${this.option(args, 'walk', seed)}`);
    const first = ScreenModel.build(s.campaign);
    const out = [`# ${world.report.region.name}: a walk of ${steps}`, '',
      `Seed \`${seed}\`, origin \`${origin}\`, calling \`${classId}\`. Written by \`bin/kyrie playtext\`.`, '',
      ...this.page(Narrator.leaf(s.campaign, first), first.place.name, first.clock, args.includes('--glance'))];
    for (let i = 0; i < Number(steps); i++) {
      const choices = PlayerView.choices(s.campaign).filter(c => !this.skip.test(c.choice.id))
        .flatMap(c => this.favoured.test(c.choice.id) ? [c, c, c] : [c]);
      if (!choices.length) { out.push('*There is nothing left to do.*'); break; }
      const c = choices[rng.number(`1d${choices.length}`) - 1]!, before = PlayerView.observe(s.campaign);
      const event = await s.perform(c.choice.id), feedback = ActionFeedbackView.read(s.campaign, event, before);
      const moved = before.location?.id !== s.campaign.world.one('at', 'party'), now = ScreenModel.build(s.campaign);
      out.push(`**${i + 1}. ${c.choice.name}**`, '', ...this.page(Narrator.leaf(s.campaign, now,
        { event, feedback, said: c.choice.name, moved }), now.place.name, now.clock, args.includes('--glance')));
    }
    console.log(out.join('\n'));
  }
}

