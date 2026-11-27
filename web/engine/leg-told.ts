import type { Campaign } from '../../src/campaign/campaign';
import type { PlayerSnapshot } from '../../src/presentation/player-view';
import { FictionalTime } from '../../src/campaign/fictional-time';
import { ObservationText } from '../../src/lang';
import { Passages } from '../../src/ui/passages';
import { Patience } from '../../src/ui/patience';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { Narrator, type Told } from '../../src/presentation/narrator';
import { Typography } from '../../src/presentation/typography';

// A leg of a journey as the page tells a leg passed (Frame.travel's legs: where it came, when, how the way went, and
// what came of it there), and the country it came into, which the next page's heading reads.
export interface LegPassed {
  place: string; id: string; at: string; journey: string[]; lines: string[]; country?: string;
}

// A journey's leg told from its receipt, not from a frame built for it (AX-05; platform-separation.md, the trust
// thread's second step): the page tells a leg passed by where it came, when, and what came of it, and the place's
// whole screen, its leaf and its glance (most of a leg's time on the page's host) are built only where the journey
// ends. Told as the leaf tells it (Narrator.passed is the leaf's own exchange); and where what is told of a leg would
// read the screen (a warning's wait, said with what came of it; a beast that could be fought, whose name the leaf
// turns to "it" in what came of it: see Introduced), none is given, and the leg's frame is built whole as before.
export class LegTold {
  static of(campaign: Campaign, told: Told, view: PlayerSnapshot): LegPassed | undefined {
    const here = view.location?.id;
    if (!here || !told.moved || this.screened(campaign, view)) { return undefined; }
    const passages = new Passages(ObservationText.presented(campaign.world), campaign.world, view.actor);
    const place = passages.place(here), country = passages.path(here).find(p => p.kind === 'region')?.name;
    const journey = (told.event.voiced ?? []).filter(v => v.kind.startsWith('journey')).map(v => Typography.curl(v.text));
    return { place: place.name, id: place.id, at: FictionalTime.at(view.elapsed, view.minutes), journey,
      lines: Narrator.passed(campaign, { place, observed: view.observations }, told), ...country ? { country } : {} };
  }
  // Whether what is told of the leg reads the place's screen: a warning here, or anyone here who could be fought.
  // The fights' rows alone (PlayerFrame.only), as Travel reads them: not the whole frame, which a leg told by its
  // receipt never builds (OR-1361).
  private static readonly fights: ReadonlySet<string> = new Set(['attack']);
  private static screened(campaign: Campaign, view: PlayerSnapshot): boolean {
    return PlayerFrame.only(campaign, this.fights)
      .some(r => r.action.schema === 'attack' || /^attack\(/.test(r.choice.id))
      || !!Patience.of(campaign, view.minutes).warned;
  }
}
