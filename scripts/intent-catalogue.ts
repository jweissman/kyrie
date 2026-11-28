#!/usr/bin/env bun
// The player-intent catalogue (the owner, 15 November): the actions the rules library defines, by the kind of thing a
// player means by them, audited against ten families. A family is a way of meaning something, not an engine
// primitive or
// a label: two schemas that differ only in words belong to one capability, and a higher-order activity (building) is
// composed of primitives (commissioning, paying, waiting), not a primitive itself. A schema in no family is a gap in
// the
// audit to be classified; a family with no schema is a gap in what the world can sustain.
//   bun scripts/intent-catalogue.ts [--json]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type Family = 'perception' | 'discovery' | 'movement' | 'social' | 'manipulation' | 'practice'
  | 'relationships' | 'conflict' | 'reflection' | 'organization';

export class IntentCatalogue {
  static readonly families: Family[] = ['perception', 'discovery', 'movement', 'social', 'manipulation', 'practice',
    'relationships', 'conflict', 'reflection', 'organization'];
  // Each library schema, by the intent it carries. Words that differ only in the thing (take_lodging and
  // take_lodging_guest)
  // are one capability: see `distinct`.
  static readonly table: Record<Family, string[]> = {
    perception: ['look_closely', 'look_down', 'examine', 'listen', 'read_item', 'appraise', 'appraise_beyond'],
    discovery: ['search', 'prod', 'pry', 'experiment', 'guild_survey', 'guild_no_lead'],
    movement: ['go', 'arrive', 'depart', 'slip_past', 'plane_shift'],
    social: ['talk_to', 'ask', 'tell', 'talk_round', 'pass_off', 'sing_supper', 'pay_tribute', 'make_offering', 'haggle', 'haggle_wares'],
    manipulation: ['take_item', 'take_pile', 'take_from', 'take_out', 'put_item', 'put_in', 'give', 'give_back', 'give_valuable',
      'transfer_item', 'equip_item', 'use_item', 'eat_item', 'draw_out', 'light', 'light_item', 'light_lamp',
      'douse_light', 'push', 'burn', 'loose_at', 'destroy_source', 'bury_companion', 'raise_quality', 'change_thing'],
    practice: ['learn_skill', 'learn_spell', 'learn_reward', 'train_member', 'take_feat', 'prepare_spell', 'gather',
      'make_remedy', 'make_plain', 'work_keep', 'field_spell'],
    relationships: ['recruit', 'send_off', 'part_ways', 'pet', 'lead', 'hold_here', 'call_on'],
    conflict: ['attack', 'assail', 'face_down', 'lie_still', 'risk'],
    reflection: ['wait', 'watch_sky', 'wait_hour', 'wait_watch', 'wait_for_dark', 'wait_for_light', 'rest', 'rest_unfed', 'camp',
      'take_lodging', 'take_lodging_guest', 'sleep_own_room', 'take_healing', 'take_raising', 'take_restoration', 'take_feat_rest'],
    organization: ['buy_goods', 'buy_item', 'sell', 'sell_valuable', 'sell_ware', 'change_thing_paying',
      'change_thing_spending', 'take_leave', 'guild_enrol'],
  };
  // Capabilities, not labels: schemas that only vary the thing acted on collapse to one.
  static readonly distinct: Record<string, string> = { take_lodging_guest: 'take_lodging', light_item: 'light',
    light_lamp: 'light', change_thing_paying: 'change_thing', change_thing_spending: 'change_thing',
    appraise_beyond: 'appraise', wait_hour: 'wait', wait_watch: 'wait', rest_unfed: 'rest', sell_ware: 'sell',
    sell_valuable: 'sell', buy_item: 'buy_goods', haggle_wares: 'haggle', wait_for_dark: 'wait', wait_for_light: 'wait',
    take_raising: 'take_healing', take_restoration: 'take_healing', guild_no_lead: 'guild_survey' };
  // The proof a family has, a spec in which the player meets, recognizes, does and is told the result of its intent
  // (an authoritative fixture or a real walk); none, and the family is named as unproven, not claimed. (15 November)
  static readonly pins: Record<Family, string | undefined> = {
    perception: 'test/small/look-in-place.test.ts', discovery: undefined, movement: 'test/follow-offered-browser.test.ts',
    social: 'test/news-asked.test.ts', manipulation: 'test/small/given-remedy.test.ts',
    practice: 'test/gathered-plates.test.ts', relationships: 'test/small/commander.test.ts',
    conflict: 'test/small/mage-casts.test.ts', reflection: 'test/small/quiet-wait.test.ts',
    organization: 'test/small/landholder.test.ts',
  };
  static files(dir: string): string[] {
    return readdirSync(dir).flatMap(n => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? this.files(p) : /\.kyrt?$/.test(n) ? [p] : [];
    });
  }
  static schemas(): string[] {
    const root = join(import.meta.dir, '..', 'data');
    const found = new Set<string>();
    for (const dir of ['rules', 'frameworks', 'catalog']) {
      for (const f of this.files(join(root, dir))) {
        for (const m of readFileSync(f, 'utf8').matchAll(/^\s*Action ([a-z_0-9]+)\(/gm)) { found.add(m[1]!); }
      }
    }
    return [...found].sort();
  }
  static family(schema: string): Family | undefined {
    return this.families.find(f => this.table[f].includes(schema));
  }
  static capabilities(family: Family): string[] {
    return [...new Set(this.table[family].map(s => this.distinct[s] ?? s))];
  }
  static main(args: string[]): number {
    const all = this.schemas(), loose = all.filter(s => !this.family(s));
    if (args.includes('--json')) { console.log(JSON.stringify({ loose, families: this.table }, null, 1)); return 0; }
    for (const f of this.families) {
      const have = this.table[f].filter(s => all.includes(s));
      console.log(`${f.padEnd(14)}${String(this.capabilities(f).length).padStart(3)} capabilities  ${have.join(' ')}`);
    }
    console.log(`\n${all.length} library schemas; unclassified: ${loose.join(' ') || 'none'}`);
    return 0;
  }
}
if (import.meta.main) { process.exit(IntentCatalogue.main(process.argv.slice(2))); }
