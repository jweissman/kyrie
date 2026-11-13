// Scratch (step 3): which actors may take equip_item, and which rules, queries or actions read proficient (a1, kin).
const W = process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'kin', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
const c = (await PlaySession.start(w.path, 'a1', w.source)).campaign, m = c.module;
const reads = (x: unknown) => JSON.stringify(x).includes('"proficient"');
console.log('actors with equip_item:', c.actors.filter(a => a.actions.some(id => /equip/.test(id))).map(a => `${a.id}${a.player ? ' (company)' : ''}`).join(', ') || 'none');
console.log('actions reading proficient:', m.actions.filter(reads).map(a => a.id).join(', '));
console.log('rules reading proficient:', (m.rules ?? []).filter(r => reads(r.when)).map(r => r.id).join(', ') || 'none');
console.log('queries reading proficient:', m.queries.filter(q => reads(q.body)).map(q => q.name).join(', ') || 'none');
console.log('observations reading it:', (m.observations ?? []).filter(reads).length, '; goals:', c.actors.filter(a => reads(a.goals)).length);
