import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Content } from '../src/content';
import { RandomStreams } from '../src/random-streams';

// The Walk of the Milestones, drawn (data/situations/walk): what Deem decides for a country, and that the draws stay coherent.
const dir = 'data/situations/walk/';
const setting = Content.settingWith(JSON.parse(readFileSync(`${dir}tables.json`, 'utf8')),
  JSON.parse(readFileSync(`${dir}templates.json`, 'utf8')));
type Fact = { name: string; args: string[] };
const drawn = (seed: string, terrain: string) => new Content(`${RandomStreams.key(seed, 'module', 'walk', '')}:situation`,
  setting).generate('walk', { terrain, domain: 'nature', folk: 'human' }) as unknown as { facts: Fact[]; labels: Record<string, string>; casting: Record<string, unknown> };
const one = (g: { facts: Fact[] }, name: string) => g.facts.find(f => f.name === name)!.args.join(',');

describe('the Walk, drawn', () => {
  it('differs from country to country in what plays differently, and stays coherent', () => {
    const creeds = new Set<string>(), flash = new Set<string>(), patrons = new Set<string>(), bound = new Set<string>(),
      leaders = new Set<string>(), stances = new Set<string>(), lines = new Set<string>(), combos = new Set<string>();
    for (let i = 0; i < 120; i++) {
      const g = drawn(`w${i}`, ['forest', 'marsh', 'mountain', 'frost', 'desert'][i % 5]!);
      const creed = one(g, 'creed'), patron = one(g, 'patron_is'), leader = one(g, 'leader_kind'), b = one(g, 'bound_by');
      creeds.add(creed); flash.add(one(g, 'flashpoint')); patrons.add(patron); bound.add(b); leaders.add(leader);
      stances.add(g.facts.filter(f => f.name === 'stance').map(f => f.args[1]).join());
      lines.add(g.labels.creed_line!);
      combos.add([creed, patron, leader, one(g, 'flashpoint')].join('/'));
      // Coherence: a grieving dowager pays for a penance or a remembrance, never a reform; a factor never pays for a penance;
      // the Walk's leader is of a kind that suits what it is for.
      if (creed === 'c_reform') { expect(patron).not.toBe('p_dowager'); expect(['l_drover', 'l_soldier']).toContain(leader); }
      if (creed === 'c_penance') { expect(patron).not.toBe('p_factor'); expect(['l_widow', 'l_novice', 'l_soldier']).toContain(leader); }
      if (creed === 'c_remembrance') { expect(['l_scrivener', 'l_soldier']).toContain(leader); }
      expect(Object.keys(g.casting).sort()).toEqual(['annet', 'dray', 'gaunt', 'hask', 'leader', 'orme', 'pettifer', 'teague', 'wenna']);
    }
    expect([...creeds].sort()).toEqual(['c_penance', 'c_reform', 'c_remembrance']);
    expect([...flash].sort()).toEqual(['f_b', 'f_c', 'f_d']);
    expect([...patrons].sort()).toEqual(['p_cousin', 'p_dowager', 'p_factor']);
    expect([...bound].sort()).toEqual(['m_debt', 'm_duty', 'm_kin']);
    expect(leaders.size).toBe(5);
    expect(stances.size).toBe(16);
    expect(lines.size).toBe(3);
    expect(combos.size).toBeGreaterThan(30);
  });
});
