// Scratch: walk the starting town's places in several worlds; for every act the glance leads with that opens
// something (a talk, a look), whether each aspect it bears has an act inside, and whether that act is in view.
const W = '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { Narrator } = await import(`${W}/src/presentation/narrator`);
const { SceneModel } = await import(`${W}/src/ui/scene`);
const { Attending } = await import(`${W}/src/ui/attention`);
const { TalkFocus } = await import(`${W}/web/reader/talk-focus`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const { Emphasis } = await import(`${W}/web/reader/emphasis`);
const seeds = (process.env.SEEDS ?? 'kahitude,brenmoor,ostwold').split(','), origins = (process.env.ORIGINS ?? 'debt,order,kin').split(',');
let acts = 0, bad = 0, people = 0;
const tally: Record<string, number> = {};
for (const seed of seeds) for (const origin of origins) {
  const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
  const c = s.campaign as any, seen = new Set<string>();
  const visit = async (depth: number) => {
    const here = c.world.one('at', 'party'); if (seen.has(here) || depth > 3) { return; } seen.add(here);
    const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance;
    const scene = Attending.place(SceneModel.build(screen));
    for (const a of g?.acts ?? []) {
      if (!a.subject) { continue; }
      const x = scene.subjects.find((y: any) => y.id === a.subject); if (!x) { continue; }
      acts++; if (x.kind === 'person') { people++; }
      const leaves = Attending.all(x.choices).filter((k: any) => k.command);
      for (const asp of a.aspects) {
        tally[asp] = (tally[asp] ?? 0) + 1;
        if (['exploration', 'danger', 'undertaking'].includes(asp)) { continue; }
        const inside = (a.inside ?? []).find((i: any) => i.aspects.includes(asp));
        const leaf = inside && leaves.find((k: any) => k.command === inside.command);
        const talk = x.kind === 'person' ? x.choices.find((k: any) => /#talk$/.test(k.id)) : undefined;
        const replies = talk ? Attending.all(talk.children ?? []).filter((k: any) => k.command) : [];
        const focus = talk ? TalkFocus.of(replies.filter((k: any) => !TalkFocus.services.has(k.does ?? '')), { ...a.for ? { led: a.for } : {}, marked: (a.inside ?? []).map((i: any) => i.command), asked: [] }) : undefined;
        const service = leaf && TalkFocus.services.has(leaf.does ?? '');
        const shown = !talk || service || focus!.salient.some((k: any) => k.command === leaf?.command || k.children?.some((j: any) => j.command === leaf?.command));
        const drawn = leaf ? Emphasis.within(g.acts, leaf) : [];
        if (!leaf || !shown || !drawn.includes(asp)) { bad++; console.log(`${seed}/${origin} @${here} ${a.label} [${a.why}] ${asp}: ${!leaf ? 'no act inside' : !shown ? `"${leaf.label}" under the fold` : 'not drawn'}`); }
      }
    }
    if (screen.place.kind === 'region' || screen.place.underground) { return; }
    for (const e of screen.exits.filter((e: any) => e.local && !e.blocked).slice(0, 6)) {
      try { await GeneratedWorld.travel(s, e.destination.id); await visit(depth + 1); await GeneratedWorld.travel(s, here); } catch (err) { console.log('walk', (err as Error).message.slice(0, 60)); }
      if (c.world.one('at', 'party') !== here) { return; }
    }
  };
  await visit(0); console.log(seed, origin, "places", seen.size);
}
console.log(JSON.stringify({ acts, people, bad, tally }));
