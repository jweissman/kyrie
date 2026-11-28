import type { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Narrator } from '../../src/presentation/narrator';
import { Itineraries } from '../../src/ui/itinerary';
import { ScreenModel } from '../../src/ui/screen-model';

// What the delver does with it (QuantityExpeditions): act, a command pressed; ids, the rows the page offers; depth,
// the level of the dead place a room is on.
export interface Delver {
  act(s: PlaySession, id?: string): Promise<unknown>; ids(s: PlaySession): string[];
  depth(s: PlaySession, room: string): number;
}
// The five expeditions' way down and back up by what the company has made sure (Descents; the cold-play review's
// Wave 2): down from the town in one act, the deepest no deeper than the delve would go, where the page offers one;
// and up from a place made sure by the way out the page offers in one act (OR-1862). A journey comes where it comes,
// stopped by what wants the player on the way; stopped in the dark with a light to hand, the light is lit and the way
// gone on with (the page's "Go on to …"). Kept apart from the delver's own policy, so that each can change alone.
export class QuantityDescents {
  static async descend(s: PlaySession, most: number, d: Delver): Promise<boolean> {
    const down = (Journey.of(s).screen().around ?? []).filter(x => x.descent && d.depth(s, x.id) <= most)
      .sort((a, b) => d.depth(s, b.id) - d.depth(s, a.id))[0];
    return !!down && await this.journey(s, `travel:${down.id}`, d);
  }
  // A journey set out on, and gone on with where it stopped in the dark: whether it was set out on.
  static async journey(s: PlaySession, command: string, d: Delver): Promise<boolean> {
    if (!await d.act(s, command)) { return false; }
    for (let i = 0; i < 2 && s.journeyed && !s.journeyed.arrived; i++) {
      const dark = s.campaign.world.test({ kind: 'call', name: 'benighted', args: ['party'] });
      const light = dark ? d.ids(s).find(id => id.startsWith('light_item(')) : undefined;
      if (!light || !await d.act(s, light) || !await d.act(s, command)) { break; }
    }
    return true;
  }
  // The way out from where the company stands, where it is a place made sure (the compass's, secured).
  static out(s: PlaySession): string | undefined {
    const c = s.campaign, here = c.world.one('at', 'party') ?? '';
    if (!c.world.test({ kind: 'call', name: 'secured', args: [here] })) { return undefined; }
    const out = Narrator.leaf(c, Itineraries.charted(c, ScreenModel.build(c))).glance?.compass?.out;
    return out?.secured && !out.barred ? out.command : undefined;
  }
}
