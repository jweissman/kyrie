import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { MenuModel } from '../src/frame/menu-model';
import { TalkLines, type TalkLine } from '../src/frame/talk-lines';
import type { Choice } from '../src/ui/choice-list';
import type { Frame } from '../src/creation/protocol';
import { Sentences } from '../src/presentation/sentences';

// One conversation done well (OR-149, the owner's playtest of 20 November, night: talking to someone, not operating
// records): Owain on the green at the drove road's opening, as the page keeps it, through the engine's own frames.
// What you say is said ("You ask Owain…"); Owain answers in a sentence or two, and asks you something, and the answer
// you give is one of three; the green's notices and boats are not told over him; and he is there to be asked more.
class Talk {
  host = new EngineHost(() => undefined); frame!: Frame; lines: TalkLine[] = [];
  attention: ReturnType<typeof TalkLines.turn> & object = TalkLines.place;
  static async begin(): Promise<Talk> {
    const t = new Talk();
    t.frame = await t.host.handle({ kind: 'begin', campaign: 'world', seed: 'iscoed', origin: 'drove', opening: 'none',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] } as never) as Frame;
    return t;
  }
  menu() {
    return MenuModel.build(this.frame, 'here', [], { attention: this.attention, member: undefined, asked: [], heard: [],
      trading: false } as never);
  }
  static all(cs: Choice[]): Choice[] { return cs.flatMap(c => [c, ...Talk.all(c.children ?? [])]); }
  replies(): string[] { const m = this.menu(); return (m.talk?.replies ?? []).map(c => MenuModel.said(m, c)); }
  async say(label: RegExp): Promise<TalkLine[]> {
    const m = this.menu(), c = Talk.all([...m.choices, ...m.talk?.replies ?? []])
      .find(x => label.test(x.label) || label.test(x.id) || label.test(MenuModel.said(m, x)));
    if (!c) { throw new Error(`not offered: ${label}`); }
    const before = this.frame, turned = TalkLines.turn(c);
    if (turned) { this.attention = turned; }
    this.frame = await this.host.handle({ kind: 'perform', command: c.command! }) as Frame;
    const added = TalkLines.lines(this.frame, c, MenuModel.said(m, c), this.lines);
    this.lines.push(...added);
    this.attention = TalkLines.holds(this.attention, before, this.frame);
    return added;
  }
}
describe('talking to Owain on the green', () => {
  it('is said as said, short, with his own question, and nothing of the green told over him', async () => {
    const t = await Talk.begin();
    const greeted = await t.say(/^drove__owain#talk$/);
    expect(greeted.map(l => l.text).join(' ')).toContain('What do we do?');
    const asked = await t.say(/^Ask Owain how many head came down$/);
    expect(asked[0]).toEqual({ kind: 'you', text: 'You ask Owain how many head came down.' });
    const speech = asked.find(l => l.kind === 'speech')!;
    expect(speech.text).toContain('Will they hang him?');
    for (const l of [...greeted, ...asked]) {
      expect(l.text).not.toMatch(/salter|notice is nailed|caulking|Gwil Pryce|Boats put in/);
    }
    expect(asked.filter(l => l.kind === 'learned').map(l => l.text)).toEqual(['Owain: thirty-six crossed; four went into the Black Rhyne']);
    // His question, answered one way of three, and his answer to it plain.
    expect(t.replies()).toEqual(expect.arrayContaining(['Tell Owain nobody hangs a man for four head of cattle',
      'Tell Owain you will find the four', "Tell Owain you don't know"]));
    const answered = await t.say(/^Tell Owain nobody hangs/);
    expect(answered[0]!.text).toBe('You tell Owain nobody hangs a man for four head of cattle.');
    expect(t.replies().filter(r => /^Tell Owain/.test(r))).toEqual([]);
    // Still there, and more to be asked of him.
    expect(t.attention).toEqual({ kind: 'person', id: 'drove__owain' });
    const bran = await t.say(/^Ask Owain about Bran$/);
    expect(bran.find(l => l.kind === 'speech')!.text).toContain('He threw the stick to you, not to them.');
    // Each thing he says in three sentences at most (the owner: one or two, three plenty).
    for (const l of t.lines.filter(x => ['speech', 'telling'].includes(x.kind) && /Owain/.test(x.text))) {
      expect(Sentences.split(l.text).length).toBeLessThanOrEqual(3);
    }
  }, 120000);
});
