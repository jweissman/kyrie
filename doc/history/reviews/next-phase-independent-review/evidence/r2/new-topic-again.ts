// Probe (284870e, WorldConstructs.recall): a `once` topic whose name starts "Ask … about/what/where…" gets a copy
// `<id>_again` that requires the original's guard AND said_<id>. When the guard is negated by the topic's own effect
// (`when not knows(actor, F)` … `On discuss { Assert knows(actor, F). }`, the generator's usual form), the copy can
// never be offered. Count, per campaign, the `_again` actions whose requirement contains `not R(args)` for an R(args)
// the original asserts; and the once-topics left without a copy because their name is not an English "Ask … <word>".
// Usage: bun new-topic-again.ts
import { Campaign } from '../../../../../src/campaign/campaign';
import { WorldAssembler } from '../../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import type { Operator, Predicate } from '../../../../../src/lang/module';

const key = (c: { name: string; args: string[] }) => `${c.name}(${c.args.join(',')})`;
function negated(p: Predicate | undefined, out: Set<string> = new Set()): Set<string> {
  if (!p) { return out; }
  if (p.kind === 'not' && p.value.kind === 'call') { out.add(key(p.value)); }
  if (p.kind === 'and' || p.kind === 'or') { negated(p.left, out); negated(p.right, out); }
  return out;
}
function report(label: string, c: Campaign) {
  const actions = c.module.actions as Operator[], byId = new Map(actions.map(a => [a.id, a]));
  const again = actions.filter(a => a.id.endsWith('_again') && byId.has(a.id.slice(0, -6)));
  const dead = again.filter(a => {
    const orig = byId.get(a.id.slice(0, -6))!, neg = negated(a.requires);
    return orig.success.some(e => e.kind === 'assert' && neg.has(key(e.call)));
  });
  const onceTopics = actions.filter(a => (a.success ?? []).some(e => e.kind === 'assert' && /^(\w+__)?said_/.test(e.call.name)));
  const noCopy = onceTopics.filter(a => !byId.has(`${a.id}_again`));
  console.log(`${label}: once-latched actions ${onceTopics.length}; "_again" copies ${again.length}; copies that can never be offered ${dead.length}`
    + (dead[0] ? ` (e.g. ${dead[0].id}: "${dead[0].name}")` : '') + `; once-latched without a copy ${noCopy.length}`
    + (noCopy[0] ? ` (e.g. "${noCopy[0].name}")` : ''));
}
for (const path of ['data/campaigns/what-tessary-owes.campaign.json']) { report(path, await Campaign.load(path, 'ossel', NodeBundleSource.shared)); }
for (const seed of ['s0', 's1']) {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
  report(`generated ${seed}`, await Campaign.load(w.path, seed, w.source));
}
