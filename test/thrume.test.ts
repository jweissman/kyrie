import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';

// Thrume, played by the labels a player sees (and the item panel's acts), by the shared driver (Journey: '=N' waits
// until watch N, '?label' is taken if it is offered). A torch is lit that way: a flame now burns only while it is
// wanted (in the dark, awake), so one lit before may still be alight, and a torch is not offered to be lit while one
// burns. The Sleeper's eyelids are told apart by their headings ("the Sleeper's left eyelid: Examine › …").
class T {
  static start(campaign = 'data/campaigns/thrume.campaign.json') {
    return PlaySession.start(campaign, 'saltgrave', NodeBundleSource.shared);
  }
  static choices(s: PlaySession) { return Journey.of(s).choices(); }
  static watch(s: PlaySession) { return Journey.of(s).watch(); }
  static async play(s: PlaySession, steps: string[]): Promise<string> {
    try { return await Journey.of(s).play(...steps); } catch (e) { throw new Error(`${(e as Error).message} (${this.lights(s)})`); }
  }
  // What the company has burning, and for how long yet: a light still lit is not lit again.
  static lights(s: PlaySession): string {
    const r = s.campaign.readout, burning = r.creatures.filter(c => r.partyIds.includes(c.id))
      .flatMap(c => c.state.conditions.filter(x => x.clock === 'world-time').map(x => `${c.name} ${x.id} ${x.remaining}`));
    return burning.length ? burning.join(', ') : 'nothing burning';
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static measure(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static fallen(s: PlaySession) {
    return s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id) && !c.state.hp).length;
  }
}

describe('Thrume', () => {
  it('is played from the dream-houses of Saltgrave to the Mouth under every sleep, and the song refuses it', async () => {
    const s = await T.start();
    let said = '';
    // Saltgrave
    said = await T.play(s, ["^To the market", "notice", "^Into Dunmore", "what is wrong", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "Buy › A torch", "^Out", "^Into the Saltcellar", "about the giants", "^Out", "^Into the Red Lantern", "^To the smoke", "Listen", "Lie down", "^To the Red Lantern's front", "^Out", "^To the carters", "^Wait › Until dark", "^Wait › A while", "^To the market", "^Into the Red Lantern", "where the carts go", "^Take$", "^Out"]);
    expect(T.holds(s, 'thrume__ringBroken', 'thrume__hushed')).toBe(true);
    expect(T.holds(s, 'knows', 'party', 'thrume__hush_named')).toBe(true);
    // Shoulder
    said = await T.play(s, ["^To the miners", "about the giants", "^To the foot of the scree", "^To the top of the scree", "^To the glacier", "^Search here", "^To the midden", "^To the thrall", "why the giants", "won't look", "^To the midden", "^Take$", "^To the glacier", "^To the top of the scree", "^Wait › Until first light", "^To the gate-yard", "guest-pole", "^To the long hall|^Out to the long hall", "^To the mothers", "^Give", "who is warm", "teach you the song", "thing in the cellar", "^To the long hall|^Out to the long hall", "^To the high seat", "why he took", "Swear", "^Take$", "^To the long hall|^Out to the long hall"]);
    expect(T.holds(s, 'thrume__sworn', 'thrume__morrach')).toBe(true);
    expect(T.holds(s, 'thrume__freed', 'thrume__aud')).toBe(true);
    expect(T.holds(s, 'knows', 'party', 'thrume__song_known')).toBe(true);
    expect(T.holds(s, 'thrume__roused', 'thrume__hold')).toBe(false);
    // Delving
    said = await T.play(s, ["?a torch: Light", "^Into the glacier cellars", "keepers. ring in the socket", "^To the head of the Keepers", "?a torch: Light", "^To the foot of the Keepers", "?a torch: Light", "=156", "^To the mouth of the Lungs", "^To the Hall of Wind", "^To the lee", "=168", "^To the Hall of Wind", "^To the crossing", "^To the Smiths", "?a torch: Light", "^To the cold forge", "^To the iron library", "building-book", "riddle-book", "Sleeper", "hall of doors", "^To the Master", "journal$", "last leaves", "^Take$", "^To the iron library", "^To the cold forge", "^To the Gauge"]);
    for (const f of ['salt_is_blood', 'doctrine_known', 'hammers_known', 'wheels_known', 'breaths_known']) { expect(T.holds(s, 'knows', 'party', `thrume__${f}`)).toBe(true); }
    // Brannoc
    said = await T.play(s, ["^To the cold forge", "^To the Smiths", "^To the crossing", "^To the red gallery", "^To the foot of the sump", "^Search here", "?a torch: Light", "^To the Number Four sump", "^To Brannoc", "to stop cutting", "^To the Number Four gallery", "^To the old adit", "^To the cart road", "^To the carters", "^To the market", "^Into the Saltcellar", "what the red salt is", "^Take$", "^Out", "^To the carters", "^To the cart road", "^To the old adit", "?a torch: Light", "^To the Number Four gallery", "^To Brannoc", "Give an order"]);
    expect(T.holds(s, 'thrume__cutting', 'thrume__brannoc')).toBe(false);
    expect(T.measure(s, 'thrume__stirring', 'thrume__fells')).toBe(2);
    // Hush
    said = await T.play(s, ["^To the Number Four sump", "^To the Quiet Door", "humming pebble|mouth of the Hollows", "^To the mouth of the Hollows$", "?a torch: Light", "^To the dreamed field", "Wake the dreamed", "^To the long quiet", "^To the gate of Hush", "^To the Street of Hands", "^Into the Silent Library", "grey scrolls", "^Out", "^To the Thrall-Market", "price of the boy", "Pay the Weigher", "^Into House Lull", "what House Lull wants", "^Out", "^To the Street of Hands", "^To the Choir", "^Into the Abbess|^To the foot of the spire", "^To the Abbess", "Take from the grey pedestal", "^To the foot of the spire", "^Out to the head of the long throat", "^To the foot of the long throat"]);
    expect(T.holds(s, 'thrume__freed', 'thrume__col')).toBe(true);
    // The Abbess found her pedestal empty after the company was down the throat.
    expect(T.holds(s, 'thrume__roused', 'thrume__hushc')).toBe(true);
    // Tomb
    said = await T.play(s, ["?a torch: Light", "^To the head of the salt stair", "third tread.*Prod it with the pole", "^To the hall of the hammers", "hammer of salt", "^To the Hall of Doctrine", "^To the Sleeper", "left eyelid: Examine › Push and pull", "^To the Hall of Doors", "?a torch: Light", "^Search here", "=252", "^To the Room of Three", "^To the Gearworks", "iron wheel to REST", "salt wheel to WAKE", "bone wheel to REST", "Throw the great lever", "^To the gallery", "Turn the great key", "^To the Gearworks", "^To the Chamber of the Heart", "Say the doctrine", "^To the Warder", "^To the hall of the locks", "?a torch: Light", "set the keepers. ring", "set the Smith-Master", "lay the Abbess", "^To the Keeper.s Chair$", "Sit in the Keeper"]);
    expect(T.holds(s, 'thrume__seated', 'party')).toBe(true);
    expect(T.measure(s, 'thrume__stirring', 'thrume__fells')).toBe(2);
    // Dream
    said = await T.play(s, ["^To the cloud landing", "^To the Gallery of the Slaying", "^To the cloud landing", "=276", "^To the Hall of the Feast", "Speak to the old ones", "^To the Eye-Tower", "Speak to the Abbess", "^To the grey plain", "^To the Shore", "^To the edge of the Mouth", "Sing the keepers"]);
    expect(T.holds(s, 'thrume__sungClean', 'thrume__fells')).toBe(true);
    // Home
    said = await T.play(s, ["^To the Keeper.s Chair", "^To the foot of the Keepers", "?a torch: Light", "^To the head of the Keepers", "^To the ice cellar", "^To the long hall|^Out to the long hall", "^To the gate-yard", "^To the top of the scree", "^To the foot of the scree", "^To the miners", "^To the market"]);
    expect(said).toContain('the right kind of quiet');
    expect(T.holds(s, 'thrume__woken', 'thrume__fells')).toBe(false);
  }, 300000);

  it('wakes, if nobody stops the cutting, before the host of Harle crosses the Ebb', async () => {
    const s = await T.start();
    let said = '';
    while (!T.holds(s, 'thrume__woken', 'thrume__fells') && T.watch(s) < 1296) {
      said += await T.play(s, [T.choices(s).some(c => /^Wait › Until dark/.test(c.label)) ? '^Wait › Until dark' : '^Wait › Until first light']);
    }
    expect(T.holds(s, 'thrume__woken', 'thrume__fells')).toBe(true);
    expect(T.watch(s)).toBeLessThan(1296);
    expect(said).toContain('like a sleeper turning over');
    expect(said).toContain('the fells stand up');
    expect(await T.play(s, ['^To the market'])).toContain('Saltgrave is gone');
  }, 300000);

  it('challenges a stranger in the giants\' yard, and Skarn comes for a company that does not answer', async () => {
    const s = await T.start();
    await T.play(s, ['^To the market', '^To the miners', '^To the foot of the scree', '^To the top of the scree', '=132', '^To the gate-yard']);
    expect(T.holds(s, 'thrume__challenged', 'party')).toBe(true);
    await T.play(s, ['^Wait › A while', '^Wait › A while']);
    expect(T.holds(s, 'thrume__roused', 'thrume__hold')).toBe(true);
    for (let i = 0; i < 6 && !T.fallen(s); i++) { try { await T.play(s, ['^Wait › A while']); } catch { break; } }
    expect(T.fallen(s)).toBeGreaterThan(0);
  }, 300000);
});

describe('the Heart-Tomb', () => {
  const start = async () => {
    const s = await T.start('test/fixtures/thrume-tomb/tomb.campaign.json');
    await s.perform('light_item(thrume__party_2__torch)');
    return s;
  };
  it('kills whoever strikes the Gate with iron, and stirs the sleeper', async () => {
    const s = await start();
    const said = await T.play(s, ['Strike the gate with the iron hammer']);
    expect(said).toContain('the whole mountain flinches');
    expect(T.fallen(s)).toBe(1);
    expect(T.measure(s, 'thrume__stirring', 'thrume__fells')).toBe(3);
    expect(T.holds(s, 'state', 'thrume__gate_bar', 'thrume__shut')).toBe(true);
  }, 120000);
  it('opens to the hammer of salt, and unmakes whoever walks into the Sleeper\'s mouth', async () => {
    const s = await start();
    await T.play(s, ['hammer of salt', '^To the Hall of Doctrine', '^To the Sleeper']);
    // The way behind the left eye is not offered, or named, until the lid is pressed.
    expect(T.choices(s).some(c => /Hall of Doors/.test(c.label))).toBe(false);
    await T.play(s, ["left eyelid: Examine › Push and pull"]);
    expect(T.choices(s).some(c => /^To the Hall of Doors/.test(c.label))).toBe(true);
    await T.play(s, ['Walk into the Sleeper']);
    expect(T.fallen(s)).toBe(1);
  }, 120000);
  it('scalds a thief who sets the Gearworks as the painted panel says, and opens only to the Master\'s order', async () => {
    const s = await start();
    await T.play(s, ['hammer of salt', '^To the Hall of Doctrine', '^To the Sleeper', "left eyelid: Examine › Push and pull", '^To the Hall of Doors',
      '^Search here', '=252', '^To the Room of Three', '^To the Gearworks']);
    // The panel: iron at rest, salt at rest, bone awake. The bone wheel stands at WAKE already.
    const lie = await T.play(s, ['iron wheel to REST', 'Throw the great lever']);
    expect(lie).toContain('blows white steam');
    expect(T.holds(s, 'state', 'thrume__core_grating', 'thrume__shut')).toBe(true);
    expect(T.holds(s, 'state', 'thrume__great_lever', 'thrume__up')).toBe(true);
    await T.play(s, ['bone wheel to REST', 'salt wheel to WAKE', 'Throw the great lever']);
    expect(T.holds(s, 'state', 'thrume__core_grating', 'thrume__open')).toBe(true);
  }, 120000);
});
