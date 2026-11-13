import { AutoplayRun } from '../../../../src/autoplay/run';
import { ScreenModel } from '../../../../src/ui/screen-model';
const seed = process.argv[2]!;
const s = await AutoplayRun.start({ seed, origin: 'debt', protagonist: { name: 'P', raceId: 'human', classId: 'warrior' }, policy: 'wander', steps: 0 });
const m: any = s.campaign.module;
const out = new Set<string>();
const walk = (o: any) => { if (typeof o === 'string') { for (const sent of o.split(/(?<=[.!?’'])\s+(?=[A-Z‘'])/)) if (sent.length > 30 && / /.test(sent)) out.add(sent.trim()); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
walk(process.argv[3]==="narr" ? [m.rules.map((r:any)=>r.say), m.observations] : [m.rules, m.observations, m.entities, m.actions, m.pursuits]);
console.log(JSON.stringify([...out]));
