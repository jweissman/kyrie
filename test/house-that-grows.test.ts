import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import type { CampaignEvent } from '../src/campaign/campaign';

// The House That Grows, played by the labels a player sees. Cobble Ring watches the room in Haddo's barley from its
// stools; a door of the house opens only behind your back, onto the less-watched copy of the room beyond it. Each
// test is one way into, through or around the house (doc/adventures/house-that-grows).
class Ring {
  static start() {
    return PlaySession.start('data/campaigns/the-house-that-grows.campaign.json', 'noon', NodeBundleSource.shared);
  }
  static choices(s: PlaySession) { return Journey.of(s).choices(); }
  static offered(s: PlaySession, label: string): boolean { return Journey.of(s).offers(label); }
  // Each label is a pattern for the choice to make (the shared driver's steps); a leading '?' makes it optional (a
  // look-away still in force).
  static async act(s: PlaySession, ...labels: string[]): Promise<CampaignEvent[]> {
    const j = Journey.of(s);
    await j.play(...labels);
    return j.taken.map(t => t.event);
  }
  // Two things' alike tries ("Examine › Hold a flame to it") are told apart by the thing they are done to.
  static async tryOn(s: PlaySession, thing: string, label: string): Promise<CampaignEvent> {
    const c = this.choices(s).find(x => new RegExp(label, 'i').test(x.label) && x.command.includes(thing));
    if (!c) { throw new Error(`No /${label}/ on ${thing}`); }
    return s.perform(c.command);
  }
  static async until(s: PlaySession, watch: number): Promise<string> {
    let said = '';
    while (s.campaign.state.elapsed < watch) {
      const [e] = await this.act(s, '^Wait › An hour');
      said += ' ' + [...(e!.perceptions ?? []).map(p => p.text), e!.response ?? ''].join(' ');
    }
    return said;
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static said(events: CampaignEvent[]) {
    return events.flatMap(e => [...(e.perceptions ?? []).map(p => p.text), e.response ?? '']).join(' ');
  }
  static readonly look = "?Tell Tobu: 'Look at me";
  // From Kezu's kitchen, with Tobu, through the small door and up into the Keel's Long Hall.
  static async up(s: PlaySession) {
    await this.act(s, 'Ask Tobu what happened', 'Ask Tobu to come with you into', 'Ask them to come with you',
      'sleeping-room', '^Take', 'To Kezu.s kitchen', 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley',
      'Pay the watchers', this.look, 'back through the small door', this.look, 'back through the door to the cup shelf',
      this.look, 'back through the narrow door');
    expect(this.holds(s, 'at', 'party', 'hhg__coats_high')).toBe(true);
    await this.act(s, this.look, 'back through the far door');
    expect(this.holds(s, 'at', 'party', 'hhg__long_hall')).toBe(true);
  }
}

describe('The House That Grows: its law', () => {
  it('opens the Annex door onto the city, because Cobble Ring watches the Annex', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'Ask Tobu what happened', 'Ask Tobu to come with you into', 'Ask them to come with you',
      'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley');
    // Tobu is looking: the small door will not open while anyone watches it, nor while the stools face it.
    expect(Ring.offered(s, 'back through the small door')).toBe(false);
    await Ring.act(s, 'Pay the watchers');
    expect(Ring.offered(s, 'back through the small door')).toBe(false);
    await Ring.act(s, Ring.look, 'back through the small door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__bedroom')).toBe(true);
    await Ring.act(s, Ring.look, 'back through the door into the hall of coats');
    // The Annex copy is overlooked from the stools; the city's copy is not: the door opens on the city's.
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_high')).toBe(true);
    expect(Ring.holds(s, 'at', 'hhg__tobu', 'hhg__coats_high')).toBe(true);
  }, 120000);

  it('strands the company in the city until someone stays behind to watch', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, Ring.look, 'back through the far door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_high')).toBe(true);
    await Ring.act(s, 'Ask Tobu to stay here', 'back through the far door', 'back through the far door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_low')).toBe(true);
    expect(Ring.holds(s, 'at', 'hhg__tobu', 'hhg__coats_high')).toBe(true);
  }, 120000);

  it('comes down by a lamp lit with dreg and left burning in the city', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, 'Knock on a door that glints', Ring.look, 'back through a door that glints', 'Ask Ottie about the lamps',
      'Take from the lamp shelves', 'into the chimney of', 'Ask Ottie to look at you', Ring.look, 'back through a door that glints',
      Ring.look, 'back through the far door');
    expect(Ring.holds(s, 'hhg__lit', 'hhg__lamp_a')).toBe(true);
    const seen = Ring.said(await Ring.act(s, 'Pack › .*lamp.*Set down'));
    expect(seen).toContain('as a room is when someone is watching it');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__lamps_watch')).toBe(true);
    await Ring.act(s, Ring.look, 'back through the far door', Ring.look, 'back through the far door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_low')).toBe(true);
    expect(Ring.holds(s, 'following', 'hhg__tobu', 'party')).toBe(true);
  }, 120000);

  it('loses Old Pammu to the folded man in the low hour, and gets him back by an hour\'s stare', async () => {
    const s = await Ring.start();
    await Ring.until(s, 140);
    expect(Ring.holds(s, 'hhg__folded', 'hhg__pammu')).toBe(true);
    await Ring.act(s, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__pammu_taken')).toBe(true);
    await Ring.act(s, 'Pay the watchers', 'back through the small door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__bedroom')).toBe(true);
    expect(Ring.said(await Ring.act(s, 'stare at it for an hour'))).toContain('unfolds out of it like a letter');
    expect(Ring.holds(s, 'hhg__folded', 'hhg__pammu')).toBe(false);
  }, 180000);

  it('keeps Old Pammu on his stool if someone stands the low hour with the watchers', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley');
    await Ring.until(s, 140);
    expect(Ring.holds(s, 'hhg__folded', 'hhg__pammu')).toBe(false);
    expect(Ring.holds(s, 'at', 'hhg__pammu', 'hhg__barley')).toBe(true);
  }, 180000);

  it('makes Kezu a door after two nights nobody watches her, and her door opens on the Long Hall', async () => {
    const s = await Ring.start();
    await Ring.until(s, 280);
    await Ring.act(s, 'sleeping-room');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__kezu_door_known')).toBe(true);
    await Ring.act(s, 'back through the green door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__long_hall')).toBe(true);
  }, 180000);

  it('keeps Kezu from becoming a door if her student sits up with her', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'sleeping-room');
    await Ring.until(s, 290);
    expect(Ring.holds(s, 'hhg__doorIn', 'hhg__kezu_bed')).toBe(false);
  }, 180000);

  it('sells the house to the Company unless the reeve is shown it is one house with the city', async () => {
    const sold = await Ring.start();
    await Ring.until(sold, 315);
    expect(Ring.holds(sold, 'hhg__sold', 'hhg__annex')).toBe(true);
    expect(Ring.holds(sold, 'at', 'hhg__guards', 'hhg__barley')).toBe(true);
    const kept = await Ring.start();
    await Ring.up(kept);
    expect(Ring.holds(kept, 'knows', 'party', 'hhg__house_one')).toBe(true);
    await Ring.act(kept, Ring.look, 'back through the far door', 'Ask Tobu to stay here', 'back through the far door',
      'back through the far door', 'back through the door into the hall of coats', 'Knock on the glass',
      'back through the small door', 'east lip', 'rim of Cobble', 'pond causeway', "reeve.s house", 'Ask the reeve about',
      'one house with rooms up in the Keel');
    await Ring.until(kept, 315);
    expect(Ring.holds(kept, 'hhg__sold', 'hhg__annex')).toBe(false);
  }, 180000);
});

describe('The House That Grows: its maps, its people and its sounds', () => {
  it('pays for a true map of the Annex, and refuses one that has gone stale', async () => {
    const s = await Ring.start();
    // A drawn room left unwatched grows one watch in six. Asking Dace and taking the slate cost their minutes, not a
    // watch each, so this company waits a while in the bedroom before knocking, and comes out in a watch in which
    // neither drawn room grows.
    await Ring.act(s, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley', 'Ask Dace what his factor',
      'Ask Dace for the loan', '^Take', 'Pay the watchers', 'back through the small door', 'Draw the glass bedroom',
      'back through the door to the cup shelf', 'Draw the cup shelf', 'back through the door to the cup shelf',
      '^Wait › A while', 'Knock on the glass', 'back through the small door');
    expect(Ring.said(await Ring.act(s, 'Give Dace back his slate, with your map of the house \\(|Give Dace back his slate, with your map of the house$'))).toContain('five hundred marks');
    expect(Ring.holds(s, 'hhg__paidMap', 'hhg__dace')).toBe(true);
    // Drawn, then the stools turned away and nodding in the low hours often enough for a drawn room to grow.
    const late = await Ring.start();
    await Ring.act(late, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley', 'Ask Dace what his factor',
      'Ask Dace for the loan', '^Take', 'Pay the watchers', 'back through the small door', 'Draw the glass bedroom',
      'back through the door to the cup shelf', 'Draw the cup shelf', 'back through the door to the cup shelf',
      'Knock on the glass', 'back through the small door');
    const stale = () => Ring.holds(late, 'hhg__mapStale', 'hhg__bedroom') || Ring.holds(late, 'hhg__mapStale', 'hhg__cup_shelf');
    for (let turn = 0; turn < 60 && !stale(); turn++) { await Ring.act(late, '?Pay the watchers', 'Wait › An hour'); }
    expect(stale()).toBe(true);
    expect(Ring.said(await Ring.act(late, 'Give Dace back his slate'))).toContain('grown since you drew it');
    expect(Ring.holds(late, 'hhg__paidMap', 'hhg__dace')).toBe(false);
  }, 180000);

  it('finds Ottie\'s red door scratched on a bunk shelf, by searching the bunk room', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, Ring.look, 'back through a door with cold air', 'Search here');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__red_door_known')).toBe(true);
  }, 120000);

  it('takes a boy of the city home by the house, the lamp and the causeway, to his mother', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, Ring.look, 'back through a door with cold air', 'Search here', Ring.look, 'back through a door with cold air',
      'Knock on a door that glints', Ring.look, 'back through a door that glints', 'Tell Ottie about the red door',
      'Ask them to come with you', 'Take from the lamp shelves', 'into the chimney of', Ring.look, 'back through a door that glints',
      Ring.look, 'back through the far door', 'Pack › .*lamp.*Set down', Ring.look, 'back through the far door', Ring.look,
      'back through the far door');
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_low')).toBe(true);
    await Ring.act(s, Ring.look, 'back through the door into the hall of coats', 'Knock on the glass', Ring.look,
      'back through the small door', 'east lip', 'rim of Cobble', 'crater causeway', 'pond arc');
    expect(Ring.said(await Ring.act(s, 'red door'))).toContain('You sang');
    expect(Ring.holds(s, 'cameHome', 'hhg__quill')).toBe(true);
  }, 180000);

  it('lets the folded man close on a lapse, and holds him still while he is watched', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley', 'Ask Dace what his factor',
      'Ask Dace for the loan', '^Take', 'Pay the watchers', 'back through the small door', 'back through the door to the cup shelf',
      'back through the narrow door');
    expect(Ring.said(await Ring.act(s, 'Draw the hall of coats'))).toContain('his hand is out');
    await Ring.act(s, 'Wait › A while', 'Wait › A while');
    expect(Ring.holds(s, 'state', 'hhg__footman', 'hhg__reaching')).toBe(true);
    expect(Ring.holds(s, 'at', 'party', 'hhg__coats_high')).toBe(true);
    // Lying down beside him is a second lapse: he puts the sleeper away.
    await Ring.until(s, 84);
    await Ring.act(s, 'Lie down and sleep', 'Wait › Until first light');
    expect(Ring.holds(s, 'at', 'party', 'hhg__drawer_dark')).toBe(true);
  }, 180000);

  it('sings a listener into the dream of the hallway, unless their ears are stopped', async () => {
    const s = await Ring.start();
    await Ring.up(s);
    await Ring.act(s, Ring.look, 'back through a door with a hum');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__front_door_known')).toBe(true);
    await Ring.act(s, 'Wait › A while', 'Wait › A while');
    expect(Ring.holds(s, 'at', 'party', 'hhg__lull_dream')).toBe(true);
    expect(Ring.said([...await Ring.act(s, 'Wait › An hour')])).toContain('You wake on the glass floor');
  }, 180000);

  it('maps the Annex and a room of the city for Dace, and leaves the mapper in the city with the slate', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley', 'Ask Dace what his factor',
      'Ask Dace for the loan', '^Take', 'Pay the watchers', 'back through the small door', 'Draw the glass bedroom',
      'back through the door to the cup shelf', 'Draw the cup shelf', 'back through the narrow door', 'Draw the hall of coats');
    // Alone, with nobody left to watch the city's copy and no lamp, the mapper cannot come down to be paid.
    expect(Ring.holds(s, 'hhg__mapped', 'hhg__coats_high')).toBe(true);
    expect(Ring.offered(s, 'Give Dace back his slate')).toBe(false);
  }, 120000);

  it('answers a torch held to the seams, and wax in the ears to the Choir', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'pond causeway', 'sleeping-hall', 'Buy › A torch', 'Buy › Ear-wax plugs', 'Out to the pond causeway',
      'rim of Cobble', 'east lip', 'flattened barley', 'Pay the watchers', 'back through the small door',
      'Pack › A torch › Light');
    // A thing is offered the tries its look suits and its author adds: the seams take a flame.
    expect(Ring.choices(s).some(c => /Hold a flame to it/.test(c.label) && c.command!.includes('hhg__seams'))).toBe(true);
    expect(Ring.said([await Ring.tryOn(s, 'hhg__seams', 'Hold a flame to it')])).toContain('watchers on their stools all look up');
    expect(Ring.holds(s, 'state', 'hhg__seams', 'hhg__scorched')).toBe(true);
    await Ring.act(s, 'back through the door to the cup shelf', 'back through the narrow door', 'back through the far door');
    await Ring.act(s, 'back through a door with a hum', 'Wait › A while', 'Wait › A while', 'Wait › A while');
    // Ears stopped: no count heard, and no dream.
    expect(Ring.holds(s, 'knows', 'party', 'hhg__front_door_known')).toBe(false);
    expect(Ring.holds(s, 'at', 'party', 'hhg__choir_room')).toBe(true);
  }, 120000);

  it('hears Kezu lie about her dreams, and then, shown the twin of her cup, tell them', async () => {
    const s = await Ring.start();
    await Ring.act(s, 'Ask Tobu what happened', 'Ask Tobu to come with you into', 'Ask them to come with you',
      'sleeping-room', '^Take', 'To Kezu.s kitchen', 'pond causeway', 'rim of Cobble', 'east lip', 'flattened barley',
      'Pay the watchers', Ring.look, 'back through the small door', Ring.look, 'back through the door to the cup shelf');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__cups_match')).toBe(true);
    await Ring.act(s, Ring.look, 'back through the door to the cup shelf', 'Knock on the glass', Ring.look,
      'back through the small door', 'east lip', 'rim of Cobble', 'pond causeway', "Kezu's house");
    // She sleeps until the afternoon; awake, she sees her cup in her student's hands and asks for it back, kindly.
    expect(await Ring.until(s, 44)).toContain("I don't want it, and I don't want it gone");
    expect(Ring.holds(s, 'hostile', 'hhg__kezu', 'party')).toBe(false);
    expect(Ring.said(await Ring.act(s, 'Ask Kezu what she dreams'))).toContain('too old to be dreaming');
    expect(Ring.said(await Ring.act(s, 'Tell Kezu her cracked cup'))).toContain('someone knocking at the front one, wrong');
    expect(Ring.holds(s, 'knows', 'party', 'hhg__kezu_dreams_house')).toBe(true);
  }, 180000);

  it('lets a peaceable dog be a dog', async () => {
    const s = await Ring.start();
    const said = Ring.said(await Ring.act(s, 'pond causeway', 'sleeping-hall', 'Scratch Bolt'));
    expect(said).toContain('belly scratched');
    expect(said).not.toContain('will not have you here');
  }, 60000);
});
