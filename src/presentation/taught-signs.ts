import type { Campaign } from '../campaign/campaign';
import type { Observation } from '../lang/module';
import type { Screen } from '../ui/screen-types';
import type { Told } from './narrator';
import { FictionalTime } from '../campaign/fictional-time';
import { Narration } from './narration';
import { SceneBudget } from './scene-budget';

// What a sign taught on a turn spent where the company stands, said with what happened. Seeing is knowing
// (Perceptions.witness), and a sign at a place first seen on such a turn teaches what it shows; but staying, the place
// is not told again (SceneBudget.glanced), so what it taught had been learned unsaid: asking Owain how many head came
// down on the landing made aims of the salt-pans going cold and the sea-gate's notice, neither said (cold play 4,
// CL-45). The sign is said, in its own words, as part of what came of the act.
export class TaughtSigns {
  static of(campaign: Campaign, screen: Screen, told: Told | undefined, defs: Map<string, Observation>): string[] {
    if (!told || told.moved) { return []; }
    const perceived = told.event.perceptions ?? [];
    const learnt = new Set(perceived.filter(p => p.kind === 'discovery').map(p => p.id));
    if (!learnt.size) { return []; }
    const before = new Set(campaign.history.slice(0, -1).flatMap(e => (e.perceptions ?? []).map(p => p.id)));
    // As it was seen: a sign that teaches is often gone once what it taught is known (the reeve's notice, newer than
    // the others, is unread no more), so its words are the perception's, not the screen's.
    return perceived.filter(o => {
      const def = o.kind === 'observation' ? defs.get(o.id.split('@')[0]!) : undefined;
      return !!def?.teaches && learnt.has(def.teaches) && SceneBudget.bears(def) && def.place === screen.place.id
        && !before.has(o.id);
    }).map(o => Narration.sentence(FictionalTime.prose(o.text)));
  }
  // Told after what the act told, each not told already.
  static tell(lines: { text: string; kind: string }[], signs: string[]) {
    const said = new Set(lines.map(l => l.text));
    lines.push(...signs.filter(t => !said.has(t)).map(text => ({ text, kind: 'change' as const })));
  }
}
