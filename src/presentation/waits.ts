import type { Campaign } from '../campaign/campaign';
import type { Operator, Predicate } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';

// What an act the company cannot do yet waits on, a step or two back: a fact of the company's it does not hold yet,
// which another act asserts, that waits on someone still up (not able(…)) to be dealt with. Orla Pennick tells where
// the old press key hangs once her cellar is clear (OR-172): asking her waits on the cellar told clear, and telling it
// on her rats, still up. Read from the acts' own conditions, never a plan of the whole module: a few steps back, the
// first such one found.
export class Waits {
  static on(campaign: Campaign, op: Operator, depth = 2): string | undefined {
    const w = campaign.world, party = campaign.playerActor ?? 'party';
    for (const leaf of Waits.leaves(op.requires)) {
      if (leaf.kind === 'not' && leaf.value.kind === 'call' && leaf.value.name === 'able') {
        const foe = leaf.value.args[0]!;
        if (Waits.constant(foe) && w.test(ModuleWriter.call('able', foe))) { return foe; }
        continue;
      }
      if (leaf.kind !== 'call' || depth < 1 || !leaf.args.every(a => a === 'actor' || Waits.constant(a))) { continue; }
      const call = ModuleWriter.call(leaf.name, ...leaf.args.map(a => (a === 'actor' ? party : a)));
      if (w.test(call)) { continue; }
      for (const o of campaign.module.actions.filter(x => (x.success ?? []).some(c => c.kind === 'assert'
        && c.call.name === leaf.name))) {
        const foe = Waits.on(campaign, o, depth - 1);
        if (foe) { return foe; }
      }
    }
    return undefined;
  }
  // The acts that bring it about, itself first: each act that asserts a fact of the company's it asks for and does not
  // hold yet, a few steps back (asking Orla about the press; telling her the cellar is clear first).
  static acts(campaign: Campaign, op: Operator, depth = 2): string[] {
    const w = campaign.world, party = campaign.playerActor ?? 'party', out = [op.id];
    for (const leaf of Waits.leaves(op.requires)) {
      if (leaf.kind !== 'call' || depth < 1 || !leaf.args.every(a => a === 'actor' || Waits.constant(a))) { continue; }
      if (w.test(ModuleWriter.call(leaf.name, ...leaf.args.map(a => (a === 'actor' ? party : a))))) { continue; }
      for (const o of campaign.module.actions.filter(x => (x.success ?? []).some(c => c.kind === 'assert'
        && c.call.name === leaf.name))) { out.push(...Waits.acts(campaign, o, depth - 1)); }
    }
    return out;
  }
  private static constant(a: string): boolean { return a !== 'actor' && a !== 'site' && !a.startsWith('?'); }
  // The conditions it asks for together (the parts of an and), each as it is written.
  private static leaves(p: Predicate | undefined): Predicate[] {
    if (!p) { return []; }
    return p.kind === 'and' ? [...Waits.leaves(p.left), ...Waits.leaves(p.right)] : [p];
  }
}
