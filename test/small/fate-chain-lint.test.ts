import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';
import { ModuleParser } from '../../src/lang/module-parser';
import { FateChainLint } from '../../src/cli/fate-chain-lint';
import { ExportRoles } from '../../src/cli/export-roles';
import { KyrLint } from '../../src/cli/kyr-lint';
import { LocalKinds } from '../../src/canon/local-catalog';
import { Canon } from '../../src/canon/canon';

// A chain of fates told at the close, one of which has no case for some state, leaves its ending unreached and
// nothing says so (AU-37, The Warm Wall's friction: a fate branch had none). `kyrie lint` says which fate, and the
// state no case of it holds in. The Warm Wall's own fates, each with a plain case last, pass.
class Fates {
  static readonly plain = 'Rule fate_osric_plain when over() and fatedSpring(party) and not fatedOsric(party) says'
    + ' "Plain." { Assert fatedOsric(party). }';
  static module(osric: string): string {
    return `Module fates "Fates" {
  Place hall "the hall" is room.
  Company party "You" of 1 at hall.
  Relation came(group). Relation heard(group). Relation hallowed(group). Relation brave(group).
  Relation fatedSpring(group). Relation fatedOsric(group). Relation fated(group).
  Query over() means hour(clock) >= 20.
  Rule company_came when at(party, hall) and not came(party) { Assert came(party). }
  Rule fate_spring_brave when over() and not fatedSpring(party) and brave(party) says "B." { Assert fatedSpring(party). }
  Rule fate_spring_cold when over() and not fatedSpring(party) and not brave(party) says "C." { Assert fatedSpring(party). }
  Rule fate_osric_heard when over() and fatedSpring(party) and not fatedOsric(party) and heard(party) says "H." {
    Assert fatedOsric(party). }
  Rule fate_osric_named when over() and fatedSpring(party) and not fatedOsric(party) and hallowed(party) says "N." {
    Assert fatedOsric(party). }
  ${osric}
  Rule fate_all when over() and fatedOsric(party) and not fated(party) { Assert fated(party). }
  Ending warm "Warm" when came(party) and fated(party) and brave(party) "Warm.".
  Ending cold "Cold" when came(party) and fated(party) "Cold.".
  Goal false.
}`;
  }
}
describe('a chain of fates', () => {
  it('with a case for every state, and a latch the endings ask that comes of no fate, says nothing', () => {
    expect(FateChainLint.findings(ModuleParser.parse(Fates.module(Fates.plain)))).toEqual([]);
  });
  it('without its plain case, says the fate and the state no case holds in', () => {
    expect(FateChainLint.findings(ModuleParser.parse(Fates.module('')))).toEqual(['fatedOsric(party) is never asserted'
      + ' where not heard(party) and not hallowed(party): no case of its fates (fate_osric_heard, fate_osric_named)'
      + ' holds there, and the chain stops short of its ending; write a last case asking nothing more']);
  });
  it('passes the Warm Wall, whose fates each end with a plain case', async () => {
    const marker = LocalKinds.item('other', { id: 'foreign_marker', name: 'foreign marker',
      base: { category: 'gear' } });
    LocalKinds.activate({ items: { foreign_marker: marker } });
    try {
      const module = await ExportRoles.module(join(KyrLint.root, 'data/adventures/warmwall/module.json'));
      expect('error' in module ? module.error : FateChainLint.findings(module)).toEqual([]);
      expect(Canon.items.foreign_marker?.name).toBe('foreign marker');
    } finally { LocalKinds.reset(); }
  });
});
