import { describe, expect, it } from 'bun:test';
import { ReachTool } from '../src/cli/reach-tool';

// What a curious player reaches of an adventure in ordinary play, against what was written (the owner's review of
// Mission 18, its first priority): played by what the page offers and nothing else, it finds Pellam's Fair, its
// chandler and its crowd, people with something to say, and says what it did not reach.
describe('kyrie reach', () => {
  it('plays Pellam as a curious player would, and counts what it came upon against what was written', async () => {
    const { reach, written } = await ReachTool.run('data/campaigns/the-liberty-of-the-ice.campaign.json', 'reach', 160);
    expect(reach.rooms.has('pellam__freezeland')).toBe(true);
    expect([...reach.people.keys()]).toEqual(expect.arrayContaining(['pellam__ursel', 'pellam__gage', 'pellam__crowd']));
    expect(reach.trade.get('pellam__gage')).toEqual(expect.arrayContaining(['Lantern', 'Coil of rope', 'Crowbar']));
    expect(reach.topicsOffered.size).toBeGreaterThan(10);
    expect(written.topics.length).toBeGreaterThan(reach.topicsOffered.size);
    const lines: string[] = [];
    ReachTool.detail(reach, written, l => lines.push(l));
    expect(lines.some(l => l.startsWith('  topics never offered: '))).toBe(true);
  }, 300000);
});
