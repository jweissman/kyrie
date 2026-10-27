import { describe, expect, it } from 'bun:test';
import { InspectTool } from '../src/cli/inspect-tool';
import { PlayTool } from '../src/cli/play-tool';

// The studio's `kyrie inspect` (brief X): why a choice is or is not on offer where a game stands. Offered, and how the
// page shows it; or, for the bindings nearest to being offered, which of its conditions fail, with what holds instead,
// and what a query that fails means there. And `kyrie play --world`: a generated world played from the terminal, by
// the labels a player sees and by where to go (>z3_deep).
class Tool {
  static async run(tool: typeof InspectTool | typeof PlayTool, ...args: string[]): Promise<string[]> {
    const out: string[] = [];
    await tool.main(args, line => out.push(line));
    return out;
  }
}

describe('kyrie inspect', () => {
  const probe = 'test/fixtures/probes/state-note/probe.campaign.json';
  it('says a choice on offer is, and how the page shows it', async () => {
    expect((await Tool.run(InspectTool, probe, 'Wind the sluice up')).slice(1)).toEqual(['offered: Wind the sluice up'
      + ' (change_thing(party,p__sluice_up,p__sluice,p__wound_down,p__wound_up)), on the page as "Wind the sluice up"']);
  }, 60000);
  it('says which condition fails of a choice not on offer, and what holds instead', async () => {
    expect((await Tool.run(InspectTool, probe, 'Wind the sluice up', 'Wind the sluice up')).slice(1)).toEqual([
      'change_thing "{how}": not offered',
      '  nearest: "Wind the sluice up" (actor=party, how=p__sluice_up, thing=p__sluice, origin=p__wound_down,'
        + ' result=p__wound_up)',
      '    fails: state(p__sluice, p__wound_down); instead state(p__sluice, p__wound_up)']);
    expect((await Tool.run(InspectTool, probe, 'Dance a jig')).slice(1)).toEqual(['Nothing in the rules is called /Dance a jig/.']);
  }, 60000);
  // In a generated world, what is left in the turf hut is not to be taken until it has been seen there.
  it('says what part of a query fails, in a generated world', async () => {
    const out = await Tool.run(InspectTool, '--world', 'wren', '--as', 'elf/mage', 'Collect a pine-knot torch', '>z3_deep');
    expect(out[1]).toBe('take_item "Collect {find} for {recipient}": not offered');
    expect(out.at(-1)).toStartWith('    fails: noticed(region__z3_deep_hut_find, party): noticed means');
    expect(out.at(-1)).toEndWith('does not hold, though revealedBy(region__z3_deep_hut_find, region__z3_deep_hut_looked)');
  }, 120000);
});

describe('kyrie play --world', () => {
  it('plays a generated world by where to go and the labels a player sees', async () => {
    const out = await Tool.run(PlayTool, '--world', 'wren', '--as', 'elf/ranger/Aud', '>z3_deep', 'the turf hut: Examine');
    expect(out.at(-2)).toContain('Stuck in the turf over the doorway is a pine-knot torch');
    expect(out.at(-1)).toBe('-- watch 67, at region__z3_deep');
  }, 120000);
});
