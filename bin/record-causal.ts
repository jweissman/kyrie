import { mkdir, writeFile } from 'node:fs/promises';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import type { CreatureGenerationContext } from '../src/content';

// Developer evidence recorder; every gameplay decision below is an ordinary PlaySession command.
export class CausalRecord {
  static readonly out = 'doc/playtests/integration-reorientation';
  private trace: unknown[] = [];
  constructor(private session: PlaySession) {}
  private async act(prefix: string) {
    const s = this.session;
      const before = PlayerView.observe(s.campaign), c = before.choices.find(c => c.id.startsWith(prefix));
      if (!c) { throw new Error(`No ${prefix} at ${before.location?.name}`); }
      const event = await s.perform(c.id, async battle => {
        const commands = battle.legalCommands();
        return commands.find(c => c.ability === 'orsino_flame_blade')
          ?? commands.find(c => c.ability === 'attack') ?? commands[0]!;
      });
      this.trace.push({ command: c.id, event, feedback: ActionFeedbackView.read(s.campaign, event, before),
        bodies: s.campaign.state.creatures, world: {
          relations: s.campaign.world.snapshot.relations.filter(r => ['at', 'state', 'witnessedAttack',
            'refusesService', 'ownedItem', 'wearing', 'following', 'knows'].includes(r.name)),
          measures: s.campaign.world.snapshot.measures.filter(m => ['quantity', 'watch'].includes(m.call.name)),
        } });
  }
  static async run(violent: boolean) {
    const party: CreatureGenerationContext[] = [
      { name: 'Elen', raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' },
      { name: 'Bran', raceId: 'human', classId: 'fighter', backgroundId: 'locksmith' },
      { name: 'Una', raceId: 'dwarf', classId: 'orsino_abjurer' },
    ];
    const s = await PlaySession.start('data/caught-below/river.campaign.json', 'causal', NodeBundleSource.shared, party);
    const record = new CausalRecord(s), trace = record.trace;
    await record.act('field_spell(world__member_party_3,orsino_fireproof,world__member_party_2)');
    for (const c of ['go(world__causeway_path,world__causeway)', 'go(world__low_path,world__drain_mouth)',
      'go(world__culvert,world__workshop)']) { await record.act(c); }
    if (violent) { await record.act('risk(world__steam_pipe,world__member_party_2)'); }
    else {
      await record.act('change_thing(world__padlock_pick)'); await record.act('go(world__stores_door,world__stores)');
      await record.act('take_item(rescue__bar,world__member_party_2)'); await record.act('go(world__stores_door,world__workshop)');
      await record.act('change_thing(world__steam_pipe_close)'); await record.act('go(world__boiler_arch,world__boiler)');
    }
    await record.act('take_item(world__ward_sword,world__member_party_2)');
    await record.act('equip_item(world__ward_sword'); await record.act('go(world__pipe_walk,world__gallery)');
    await record.act('world__hesta_help');
    if (violent) { await record.act('attack(world__hound)'); }
    else {
      await record.act('change_thing(world__hound_soothe)'); await record.act('go(world__hoist_passage,world__hoist)');
      await record.act('rescue__lever_free'); await record.act('lead'); await record.act('go(world__hoist_passage,world__gallery)');
    }
    for (const c of ['go(world__gallery_steps,world__workshop)', 'go(world__workshop_door,world__vestibule)',
      'go(world__arch,world__yard)', 'go(world__yard_track,world__ridge)', 'go(world__ridge_track,world__causeway)',
      'go(world__causeway_path,world__quay)']) { await record.act(c); }
    await record.act('go(world__oar_door,world__taproom)'); await record.act('take_lodging');
    await record.act('go(world__oar_door,world__quay)');
    const name = violent ? 'violent' : 'careful';
    await mkdir(this.out, { recursive: true });
    for (const [suffix, data] of [['trace', trace], ['replay', s.transcript], ['save', s.checkpoint()]] as const) {
      await writeFile(`${this.out}/${name}.${suffix}.json`, JSON.stringify(data, null, 2));
    }
    const replay = await PlaySession.start(s.scenario, s.seed, NodeBundleSource.shared, party);
    await replay.replay(s.transcript.steps);
    if (s.canonical() !== replay.canonical() || s.canonical() !== PlaySession.resume(s.checkpoint()).canonical()) {
      throw new Error('Causal history diverged on replay/resume');
    }
    console.log(`${name}: ${s.transcript.steps.length} commands, full canonical replay/resume equality`);
  }
}
if (import.meta.main) { await CausalRecord.run(false); await CausalRecord.run(true); }
