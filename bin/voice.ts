#!/usr/bin/env bun
// The voice tables (data/voice), for editors.
//   bun bin/voice.ts orsino               bring Orsino's combat barks into data/voice/combat.json (Kyr's own rows kept)
//   bun bin/voice.ts show [kind]          every table, or one kind: each line with the moments it is chosen in
//   bun bin/voice.ts moments <kind> k=v…  which lines a moment would choose among, best fit first, and how it reads
//   bun bin/voice.ts coverage             each kind's contexts: which have lines of their own and which fall back
//   bun bin/voice.ts review [kind]        each line as it reads of he, she, they and it, with what reads wrong marked
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Voice, type VoiceLine, type VoiceTable } from '../src/narrative/voice';
import { VoiceCoverage } from '../src/narrative/voice-coverage';
import { VoiceReview } from '../src/narrative/voice-review';

class VoiceTool {
  static readonly root = resolve(import.meta.dir, '..');
  static readonly events: Record<string, string> = { onKill: 'kill', onCrit: 'crit', onMiss: 'miss', onFall: 'fall',
    onFlee: 'flee', onEngage: 'engage', onHitReceived: 'hurt', onMissReceived: 'dodge', onSummon: 'summon',
    onSummonReceived: 'summoned', onResurrect: 'revived' };
  // Orsino's barks (settings/fantasy/tables/barks.json) as voice lines: the generic ones for anyone, the personality
  // ones for a companion of that manner, the NPC ones for one of that kind ("role").
  static orsino() {
    const path = resolve(this.root, '../orsino/settings/fantasy/tables/barks.json');
    const barks = JSON.parse(readFileSync(path, 'utf8')) as Record<string, { groups: Record<string, unknown> }>;
    const rows: VoiceLine[] = [];
    for (const [event, lines] of Object.entries(barks.genericBarks!.groups as Record<string, string[]>)) {
      lines.forEach((text, i) => rows.push(this.row(`generic.${event}.${i}`, event, text, {})));
    }
    const personalities = barks.pcPersonalityBarks!.groups as Record<string, Record<string, string[]>>;
    for (const [manner, events] of Object.entries(personalities)) {
      for (const [event, lines] of Object.entries(events)) {
        lines.forEach((text, i) => rows.push(this.row(`personality.${manner}.${event}.${i}`, event, text,
          { manner, side: 'company' })));
      }
    }
    for (const [type, events] of Object.entries(barks.npcBarks!.groups as Record<string, Record<string, string[]>>)) {
      for (const [event, lines] of Object.entries(events)) {
        lines.forEach((text, i) => rows.push(this.row(`npc.${type}.${event}.${i}`, event, text, { role: type.toLowerCase() })));
      }
    }
    const file = resolve(this.root, 'data/voice/combat.json');
    const table = JSON.parse(readFileSync(file, 'utf8')) as VoiceTable;
    table.lines = [...table.lines.filter(l => !l.source?.orsino), ...rows];
    writeFileSync(file, `${JSON.stringify(table, null, 2)}\n`);
    console.log(`${rows.length} Orsino barks; ${table.lines.length} lines in combat.json`);
  }
  private static row(key: string, event: string, text: string, when: Record<string, string>): VoiceLine {
    const kind = this.events[event] ?? event;
    const said = text.replace(/"([^"]*)"/g, '‘$1’').replace(/\{(forename|referenceName)\}/g, (_, _k: string, at: number) =>
      at === 0 ? '{Actor}' : '{actor}');
    return { id: `${kind}.orsino.${key}`, ...Object.keys(when).length ? { when } : {}, text: said,
      source: { orsino: `barks:${key.replace(/\.\d+$/, '')}` } };
  }
  static show(kind?: string) {
    for (const table of Voice.tables.filter(t => !kind || t.kinds.includes(kind))) {
      console.log(`\n## ${table.kinds.join(', ')}\n${table.about}\n`);
      for (const line of table.lines.filter(l => !kind || l.id.startsWith(`${kind}.`) || table.kinds.length === 1)) {
        const when = Object.entries(line.when ?? {}).map(([k, v]) => `${k}=${[v].flat().join('|')}`).join(' ') || 'always';
        console.log(`- [${line.id}] (${when})${line.source?.orsino ? ' [Orsino]' : ''}\n    ${Voice.render(line.text,
          { actor: 'Tobu', target: 'the boar', pronoun: 'he', place: 'the green' })}`);
      }
    }
  }
  static moments(kind: string, pairs: string[]) {
    const context = Object.fromEntries(pairs.map(p => p.split('=') as [string, string]));
    const lines = Voice.fitting(kind, context);
    console.log(`${lines.length} line(s) fit ${kind} ${JSON.stringify(context)}:`);
    for (const l of lines) { console.log(`- [${l.id}] ${Voice.render(l.text, { actor: 'Tobu', target: 'the boar', pronoun: 'he' })}`); }
  }
  static coverage() { for (const row of VoiceCoverage.report()) { console.log(row); } }
  static review(kind?: string) {
    const rows = VoiceReview.review(kind);
    for (const r of rows) {
      console.log(`\n[${r.id}] (${r.when})${r.faults.length ? `  ✗ ${r.faults.join('; ')}` : ''}`);
      for (const reading of r.readings) { console.log(`    ${reading}`); }
    }
    console.log(`\n${rows.length} lines; ${rows.filter(r => r.faults.length).length} read wrong.`);
  }
}

const [command = 'show', ...rest] = process.argv.slice(2);
if (command === 'orsino') { VoiceTool.orsino(); }
else if (command === 'moments') { VoiceTool.moments(rest[0]!, rest.slice(1)); }
else if (command === 'coverage') { VoiceTool.coverage(); }
else if (command === 'review') { VoiceTool.review(rest[0]); }
else { VoiceTool.show(rest[0]); }
