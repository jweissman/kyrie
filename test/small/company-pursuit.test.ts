import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
import { ModuleParser } from '../../src/lang/module-parser';
import { Routes } from '../../src/lang/routes';
import type { Module, Pursuit } from '../../src/lang/module';

// A pursuit that seeks the company wherever it stands (the requests' R54; the maturity track's step 5): `seeks the
// company`, said again for each room of the module once its files are joined. The Wrong Boat's hunt had been sixty
// lines, one a room for Bess and one for the lads; it is two, and compiles to those sixty, key for key, each taken up
// only while the company is in its room, so that one of them is taken up at a time and their order cannot matter.
class Hunt {
  static readonly rooms = ['road', 'quay', 'taproom', 'toll_counter', 'deck', 'cabin', 'hold', 'galley', 'fen_landing',
    'causeway', 'bell_cot', 'eel_stage', 'fair_quay', 'fairground', 'puppet_booth', 'draper', 'horse_lines',
    'pelham_inn', 'lockup', 'race_head', 'millyard', 'weir', 'millhouse', 'sluice_hut', 'ferry_stage', 'far_bank',
    'ferry_hut', 'hill_foot', 'inn_room', 'pass_gap'];
  // The sixty as they were written by hand, to 19 November.
  static hand(): Pursuit[] {
    const line = (who: string, label: string, query: string, room: string) => `  Pursuit hunt_${who}_${room} for ${who}`
      + ` "${label}" priority 8 when ${query}() and at(party, ${room}) seeks at(${who}, ${room}).`;
    const lines = [...this.rooms.map(r => line('bess', 'coming for you', 'huntBess', r)),
      ...this.rooms.map(r => line('lads', 'coming for the box', 'huntLads', r))];
    return ModuleParser.parse(`Module t "t" {\n${lines.join('\n')}\n}`).pursuits!;
  }
  // The module's places and its hunt, read as its files are joined (its other files need its setting to be read).
  static now(): Pursuit[] {
    const places = [...new Glob('data/adventures/wrongboat/*.kyr').scanSync('.')].sort()
      .flatMap(f => readFileSync(f, 'utf8').split('\n').filter(l => /^\s*Place \w+ /.test(l)));
    const hunt = readFileSync('data/adventures/wrongboat/hunt.kyr', 'utf8').split('\n')
      .filter(l => /^\s*(Pursuit|Query) /.test(l));
    const module = ModuleParser.parse(`Module t "t" {\n${[...places, ...hunt].join('\n')}\n}`) as Module;
    Routes.company(module);
    return module.pursuits!;
  }
}

describe('a pursuit of the company', () => {
  it('is the Wrong Boat\'s sixty hunting pursuits, key for key, one for each room', () => {
    const hand = Hunt.hand(), now = Hunt.now();
    expect(now.map(p => p.id).sort()).toEqual(hand.map(p => p.id).sort());
    const byId = new Map(now.map(p => [p.id, JSON.stringify(p)]));
    for (const p of hand) { expect(byId.get(p.id)).toBe(JSON.stringify(p)); }
  });
  it('is taken up in one room at a time: each asks that the company is in its own', () => {
    for (const p of Hunt.now()) {
      const room = p.id.replace(/^hunt_(bess|lads)_/, '');
      expect(JSON.stringify(p.when)).toEndWith(JSON.stringify({ kind: 'call', name: 'at', args: ['party', room] }) + '}');
    }
  });
});
