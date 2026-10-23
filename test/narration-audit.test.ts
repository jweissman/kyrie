import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator, type Leaf } from '../src/presentation/narrator';
import { ObservationText } from '../src/lang/observation-text';
import { Expressions } from '../src/expressions';

// What the page tells, checked over a seeded walk through fresh countries, as a player would read it: nothing said
// twice on one page; nobody speaking who is not there; no animal speaking; no id or unfilled blank; no true name of a
// place before the company has learned it; and nothing done that is answered with nothing.
interface Present { people: string[]; animals: string[] }
class Audit {
  static readonly skip = new RegExp('^(attack|risk|put_item|transfer_item|equip|prepare_spell|raise_quality|learn_spell'
    + '|take_feat|field_spell|use_item|eat|rest|camp)');
  static readonly favoured = /^(go|ask|talk|tell|greet|pet|gather|search|look_closely|change_thing|recruit|lead)/;
  static sentences(text: string): string[] {
    return text.split(/(?<=[.!?’'"])\s+(?=[A-Z‘'"])/).map(x => x.trim()).filter(x => x.length > 12);
  }
  static text(leaf: Leaf): string[] {
    const lines = (leaf.exchange?.lines ?? []).map(l => l.text);
    return [...leaf.journey ?? [], ...lines, ...leaf.situation, ...leaf.presence];
  }
  static present(s: PlaySession): Present {
    const screen = ScreenModel.build(s.campaign);
    return { people: [...screen.people.filter(p => p.kind === 'person').map(p => p.name), ...screen.party.map(m => m.name)],
      animals: screen.people.filter(p => p.kind === 'animal').map(p => p.name) };
  }
  static faults(s: PlaySession, leaf: Leaf, who: Present): string[] {
    const all = this.text(leaf), out: string[] = [], seen = new Map<string, number>();
    for (const sentence of all.flatMap(t => this.sentences(t))) { seen.set(sentence, (seen.get(sentence) ?? 0) + 1); }
    out.push(...[...seen].filter(([, n]) => n > 1).map(([sentence]) => `said twice: ${sentence}`));
    for (const t of all) {
      if (/\b[a-z0-9]+__[a-z0-9_]+\b/.test(t) || /\{[A-Za-z?]+\}/.test(t)) { out.push(`raw text: ${t}`); }
      for (const m of t.matchAll(/[’'],? (?:says|asks|calls|shouts|mutters|answers) ([A-Z][\w-]+(?: [A-Z][\w-]+)?)/g)) {
        const speaker = m[1]!;
        if (who.animals.some(a => a.includes(speaker))) { out.push(`an animal speaks: ${t}`); }
        else if (!who.people.some(p => p.includes(speaker) || speaker.includes(p.split(' ')[0]!))) {
          out.push(`absent speaker ${speaker}: ${t}`);
        }
      }
    }
    const world = s.campaign.world;
    for (const e of world.module.entities.filter(x => x.alias && ObservationText.known(world, x) !== x.name)) {
      if (e.name.length > 4 && all.some(t => t.includes(e.name))) { out.push(`unlearned name ${e.name}`); }
    }
    return all.length ? out : [...out, 'nothing told'];
  }
  static async walk(seed: string, origin: string, steps: number): Promise<string[]> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), rng = new Expressions(`audit:${seed}`), faults: string[] = [];
    for (let i = 0; i < steps; i++) {
      const choices = PlayerView.choices(s.campaign).filter(c => !this.skip.test(c.choice.id))
        .flatMap(c => this.favoured.test(c.choice.id) ? [c, c, c] : [c]);
      if (!choices.length) { break; }
      const c = choices[rng.number(`1d${choices.length}`) - 1]!, before = PlayerView.observe(s.campaign);
      const was = this.present(s), event = await s.perform(c.choice.id);
      const feedback = ActionFeedbackView.read(s.campaign, event, before), now = this.present(s);
      const moved = before.location?.id !== s.campaign.world.one('at', 'party');
      const told = { event, feedback, said: c.choice.name, moved };
      const leaf = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), told);
      const who = { people: [...was.people, ...now.people], animals: [...was.animals, ...now.animals] };
      faults.push(...this.faults(s, leaf, who).map(f => `${seed} ${i} ${c.choice.name}: ${f}`));
    }
    return faults;
  }
}

describe('what the page tells, over a walk', () => {
  it('tells a wanderer in the fen country without fault', async () => {
    expect(await Audit.walk('thorn', 'wanderer', 50)).toEqual([]);
  }, 180000);
  it('tells someone come home to their kin without fault', async () => {
    expect(await Audit.walk('a1', 'kin', 50)).toEqual([]);
  }, 180000);
});
