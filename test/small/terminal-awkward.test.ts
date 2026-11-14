import { describe, expect, it } from 'bun:test';
import { Awkward } from '../support/awkward';
import { Keyed } from '../support/keyed';
import { Indicator } from '../../src/presentation/indicator';
import { Emphasis } from '../../src/presentation/emphasis';
import { Signs } from '../../src/presentation/signs';
import { Terminal } from '../../src/cli/terminal';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import { TerminalPicker } from '../../src/cli/terminal-picker';
import { TerminalWidth } from '../../src/cli/terminal-width';
import { TerminalWalk } from '../../src/cli/terminal-walk';
import { WalkStyle } from '../../src/cli/walk-style';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';

// The terminal's awkward cases, in one tiny world (the owner, 14 November: TP-05), played in its human mode by keys
// on the real picker (Keyed), drawn as the terminal draws it, without a terminal: many legal acts and four led with,
// an act that is several things, a question too long for a narrow terminal, the instruments, acts that change once one
// is done, and creation through the same picker. Then the headless mode on the same world, its lines unchanged.
const labels = (k: Keyed, n = -1) => k.frames.at(n)!.menu.rows.map(r => r.label);

describe('the indicator grammar (TP-02)', () => {
  it('is one colour by one precedence, at most two icons, and the rest in words', () => {
    // Gold first, and only where the aim is followed; then danger; then the particular promises before the general.
    expect(Indicator.of({ aspects: ['knowledge', 'undertaking', 'danger'] }).tone).toBe('gold');
    expect(Indicator.of({ aspects: ['knowledge', 'undertaking', 'danger'], gilded: false }).tone).toBe('red');
    expect(Indicator.of({ aspects: ['companionship', 'exploration', 'knowledge'] }).aspect).toBe('knowledge');
    expect(Indicator.of({ aspects: ['companionship', 'exploration'] }).aspect).toBe('exploration');
    const many = Indicator.of({ aspects: ['wonder', 'payoff', 'knowledge', 'danger'], crosses: true, hold: true });
    expect([many.aspect, many.icons.map(i => i.said), many.detail])
      .toEqual(['danger', ['to gain', 'to learn'], ['uncanny', Signs.crossing.said, Signs.hold.said]]);
    // A companion as an icon alone (TP-03, the experiment): never the colour, always the first icon.
    const icon = Indicator.of({ aspects: ['companionship', 'knowledge'] }, 'icon');
    expect([icon.tone, icon.icons[0]!.sign]).toEqual(['blue', Signs.emblem('companion')]);
    expect(Emphasis.precedence).toHaveLength(Object.keys(Emphasis.tones).length);
  });
});

describe('the terminal\'s human mode, in the awkward world', () => {
  it('leads with the engine\'s four, the rest a step away, and back folds them again on the same row', async () => {
    // The four by the commands that do them, as the terminal leads with them (Terminal.led: an opener by its act).
    const t = await Awkward.start(), four = Terminal.led(t.glance, t.screen);
    const k = await Keyed.play(t.session, ['down', 'down', 'down', 'down', 'return', 'down', 'left']);
    expect(k.frames[0]!.menu.rows.map(r => r.id)).toEqual(four);
    expect(k.frames[0]!.lines).toContain(`    ${k.frames[0]!.menu.rest!.length} more`);
    expect(k.frames[0]!.menu.rest!.length).toBeGreaterThan(10);
    // Unfolded on More, the focus on the first of the rest; folded, on More again.
    expect(k.frames[4]!.focused).toBe(TerminalPicker.more);
    expect(k.frames[5]!.focused).toBe(k.frames[0]!.menu.rest![0]!.id);
    expect(k.frames.at(-1)!.focused).toBe(TerminalPicker.more);
    expect(k.frames.at(-1)!.lines.length).toBe(k.frames[0]!.lines.length - 1);
  });
  it('draws an act that is several things by its one colour, its icon besides, and says all of it on ?', async () => {
    const t = await Awkward.start();
    // Followed, the rows are led in a new order and the focus stays on the row it was on: up twice to the aim's.
    const k = await Keyed.play(t.session, ['a', 'return', 'up', 'up', '?']);
    const lines = k.last.lines.join('\n');
    // Followed, the aim's question is gold, said by its sign without colour, and teaches: its icon.
    expect(lines).toMatch(/^› ✦ Ask Osric whether /m);
    expect(lines).toMatch(/causeway ℹ$/m);
    expect(lines).toMatch(/^ {4}your aim, to learn$/m);
    // The companion's asking, a companion and nothing else: its own sign where its colour would be.
    expect(lines).toMatch(/^ {2}⚭ Ask Wenna whether she would come along$/m);
  });
  it('fits every line to a narrow terminal, the long question wrapped where it is focused and cut elsewhere', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['a', 'return', 'up', 'up', 'down'], { width: 32 });
    for (const frame of k.frames) { expect(frame.lines.every(l => TerminalWidth.of(l) <= 31)).toBe(true); }
    const [focused, other] = [k.frames.at(-2)!.lines, k.last.lines];
    expect(focused.filter(l => /Osric|alders|floods|causeway/.test(l)).length).toBeGreaterThan(2);
    expect(other.filter(l => /Osric|alders|floods|causeway/.test(l))).toEqual([expect.stringMatching(/…/)]);
  });
  it('reads the instruments that bear on the moment, each one\'s gloss on asking', async () => {
    const t = await Awkward.start();
    await t.play('Wait › Until dark');
    const k = await Keyed.play(t.session, ['up', 'up', '?']);
    const info = k.last.menu.info!.map(r => r.label);
    expect(info).toEqual([expect.stringMatching(/^Sky: .*moon/), expect.stringMatching(/^Provisions: /)]);
    expect(k.last.focused).toBe('instrument:sky');
    expect(k.last.lines.join(' ')).toContain(t.leaf.instruments!.find(i => i.id === 'sky')!.gloss.split('.')[0]!);
  });
  it('offers what has changed once an act is done, the focus on the first again', async () => {
    const t = await Awkward.start();
    const before = labels(await Keyed.play(t.session, []));
    const k = await Keyed.play(t.session, ['down', 'return']);
    expect(k.picked[0]).toEqual({ choice: 't__wenna_come' });
    const after = labels(k);
    expect(before).toContain('Ask Wenna whether she would come along');
    expect(after).not.toContain('Ask Wenna whether she would come along');
    expect([...after, ...k.last.menu.rest!.map(r => r.label)]).toContain('Ask Wenna to join the company');
    expect(k.last.focused).toBe(k.last.menu.rows[0]!.id);
  });
  it('makes a life through the same picker: the four, the rest a step away, the card chosen focused', () => {
    const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
    const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
      origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
      party: [Creation.protagonist('human', 'awkward', names)] };
    const step = new CreationFlow(setting, Creation.catalog()).steps().find(s => s.id === 'calling')!;
    const picker = new TerminalPicker(TerminalCreation.menu(step));
    expect(picker.visible.map(r => r.id).slice(0, 5)).toEqual([...step.cards.slice(0, 4).map(c => c.id),
      TerminalPicker.more]);
    expect(picker.focused!.id).toBe(step.chosen ?? step.cards[0]!.id);
    picker.press({ name: 'right' });
    expect(picker.visible).toHaveLength(step.cards.length);
    // Each card by its emblem's character, as the scene's acts are by their signs.
    expect(picker.visible.every(r => /^\S /.test(r.label))).toBe(true);
  });
  it('turns a lens on and off by its key, its own few and its own rest, without the focus unfolding them', async () => {
    const t = await Awkward.start(), people = t.glance.lenses.people;
    const k = await Keyed.play(t.session, ['down', 't', 't']);
    const lensed = k.frames[2]!;
    expect([lensed.menu.title, lensed.menu.rows.length]).toEqual(['Talk', Math.min(4, people.promoted.length)]);
    expect(lensed.menu.rest!.length).toBe(people.promoted.length + people.rest.length - lensed.menu.rows.length);
    expect(lensed.lines.some(l => /^ {4}\d+ more$/.test(l)) || !lensed.menu.rest!.length).toBe(true);
    expect(k.last.menu.title).toBeUndefined();
  });
  it('talks through the same picker, headed by whom, its rest its own replies and not the scene\'s', async () => {
    const t = await Awkward.start();
    const k = await Keyed.play(t.session, ['t', 'return']);
    expect(k.last.menu.title).toBe('With Wenna');
    expect(k.last.menu.rows.map(r => r.label)).toContain('Ask Wenna about the mill');
    expect([...k.last.menu.rows, ...k.last.menu.rest ?? []].some(r => /^Set down|^Wait/.test(r.label))).toBe(false);
  });
  it('fights through the same picker: the moves, a target, back to the moves', async () => {
    const t = await Awkward.start();
    t.journey.put('party', 't__cellar');
    const k = await Keyed.play(t.session, ['return', 'return', 'left', 'return', 'return']);
    const titles = k.frames.map(f => f.menu.title ?? '');
    expect(titles).toContain('Aud\'s turn');
    expect(titles).toContain('Melee Attack: at whom?');
    expect(k.said.join('\n')).toMatch(/^Aud \d+\/\d+$/m);
  });
  it('asks once before an act that cannot be undone, and leaving the game too', () => {
    const picker = new TerminalPicker({ rows: [{ id: 'jump', label: 'Jump into the weir', ask: 'No way back.' }] });
    expect([picker.press({ name: 'return' }), picker.asking]).toEqual([undefined, 'jump']);
    expect(picker.press({ name: 'return' })).toEqual({ choice: 'jump' });
    expect([picker.press({ ch: 'q' }), picker.press({ ch: 'q' })]).toEqual([undefined, null]);
  });
});

describe('the terminal\'s headless mode, in the awkward world', () => {
  it('keeps its plain lines: numbered, the aspects said in words in the shared order', async () => {
    const t = await Awkward.start();
    const walked = await TerminalWalk.run(t.session, WalkStyle.scripted(['follow 1', 'look']));
    const text = walked.transcript.join('\n');
    expect(text).not.toContain('\x1b[');
    expect(text).toMatch(/^1\. Ask Osric whether .* {2}\[your aim, to learn\]$/m);
    expect(text).toMatch(/^\(more: .*all \d+\)$/m);
  });
});
