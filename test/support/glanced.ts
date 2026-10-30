import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { Narrator, type Leaf, type Told } from '../../src/presentation/narrator';
import { Glance } from '../../src/presentation/glance';
import type { Glance as View } from '../../src/presentation/glance-types';
import { ScreenModel } from '../../src/ui/screen-model';
import type { Screen } from '../../src/ui/screen-types';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import { ChoiceList } from '../../src/ui/choice-list';
import { Journey } from '../../src/session/journey';
import { MenuModel } from '../../web/reader/menu-model';
import type { Frame } from '../../web/engine/protocol';

// A game played for its glance (OWN-18, OWN-19): each command as the page does it, and the page told of it, with
// what the glance led with and what the page draws to choose among.
export class Glanced {
  leaf: Leaf; screen: Screen; told?: Told;
  private constructor(readonly s: PlaySession) {
    this.screen = ScreenModel.build(s.campaign);
    this.leaf = Narrator.leaf(s.campaign, this.screen);
  }
  // A generated country, come into by the kin origin, by a warrior alone.
  static async country(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return new Glanced(await PlaySession.start(w.path, seed, w.source));
  }
  static of(s: PlaySession) { return new Glanced(s); }
  get campaign() { return this.s.campaign; }
  get glance(): View { return this.leaf.glance!; }
  async perform(command: string): Promise<View> {
    const c = this.s.campaign, before = PlayerView.observe(c), event = await this.s.perform(command);
    const moved = before.location?.id !== c.world.one('at', c.playerActor ?? 'party');
    this.screen = ScreenModel.build(c);
    this.told = { event, feedback: ActionFeedbackView.read(c, event, before), said: command, moved };
    this.leaf = Narrator.leaf(c, this.screen, this.told);
    return this.glance;
  }
  // The command whose id matches.
  async choose(pattern: RegExp): Promise<View> {
    const row = PlayerView.choices(this.s.campaign).find(r => pattern.test(r.choice.id));
    if (!row) { throw new Error(`No ${pattern} among ${PlayerView.choices(this.s.campaign).map(r => r.choice.id).join(' ')}`); }
    return this.perform(row.choice.id);
  }
  // Walks to a place by the shortest way the world joins them, a way at a time, and is told of the last.
  async to(place: string): Promise<View> {
    const path = Journey.way(this.s.campaign.world, this.s.campaign.world.one('at', 'party')!, place);
    for (const [passage, to] of path.slice(0, -1)) { await this.s.perform(`go(${passage},${to})`); }
    const [passage, to] = path.at(-1)!;
    return this.perform(`go(${passage},${to})`);
  }
  // The page's frame, as the host sends it, and what it offers to choose among where the company stands.
  frame(): Frame {
    return { title: '', screen: this.screen, entries: [], leaf: this.leaf, opening: [], chronicle: [],
      transcript: { steps: [] } as unknown as Frame['transcript'] };
  }
  menu(): string[] { return MenuModel.build(this.frame(), 'here', []).choices.map(c => c.id); }
  // Every command a player can reach from here: the place and everything opened under it, the pack, each member.
  reachable(): Set<string> {
    const screen = this.screen, scene = SceneModel.build(screen);
    const all = [...scene.subjects, ...scene.still ?? []].flatMap(s => s.choices);
    const pack = ChoiceList.pack(screen).flatMap(s => s.choices);
    const members = screen.party.flatMap(m => MenuModel.character(screen, m.id).flatMap(s => s.choices));
    return new Set(Attending.all([...all, ...scene.near, ...scene.far, ...scene.you, ...pack, ...members])
      .flatMap(c => c.command ? [c.command] : []));
  }
  legal(): string[] { return PlayerView.choices(this.s.campaign).map(r => r.choice.id); }
  // How long the glance takes to work out where the company stands, at its quickest of several.
  timed(): number {
    const kept = this.screen.observed, times: number[] = [];
    for (let i = 0; i < 9; i++) {
      const t = performance.now();
      Glance.of(this.s.campaign, this.screen, this.told, { kept, known: true, changed: [] });
      times.push(performance.now() - t);
    }
    return Math.min(...times);
  }
  // The words the glance leads with (its line and its life) and the words the full telling has.
  words(): { glance: number; full: number } {
    const count = (t: string) => t.split(/\s+/).filter(Boolean).length;
    const g = this.glance;
    return { glance: count([g.sight?.text ?? '', g.life?.text ?? ''].join(' ')),
      full: count([...this.leaf.situation, ...this.leaf.presence].join(' ')) };
  }
  static sentences(text: string): number { return text.split(/(?<=[.!?][’”]?)\s+(?=[A-Z‘“])/).length; }
}
