import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Canon } from '../src/canon/canon';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { KyrLint } from '../src/cli/kyr-lint';

// The authoring guide's example, extracted from its code blocks, installed beside the real rules and played.
class Guide {
  static readonly path = 'doc/authoring/guide.md';
  static blocks(text: string, info: string): string[] {
    return [...text.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].filter(m => m[1]!.trim() === info).map(m => m[2]!);
  }
  static async install(root: string): Promise<string> {
    const text = await readFile(this.path, 'utf8');
    const site = join(root, 'sites', 'thornmere');
    await mkdir(site, { recursive: true });
    for (const dir of ['rules', 'situations']) { await symlink(resolve('data', dir), join(root, dir)); }
    await writeFile(join(site, 'site.kyr'), this.blocks(text, 'kyr').join('\n'));
    await writeFile(join(site, 'module.json'), this.blocks(text, 'json module.json')[0]!);
    await writeFile(join(site, 'thornmere.campaign.json'), this.blocks(text, 'json campaign.json')[0]!);
    return join(site, 'thornmere.campaign.json');
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
}

describe('the authoring guide', () => {
  let root = '', campaign = '';
  beforeAll(async () => { root = await mkdtemp(join(tmpdir(), 'kyrie-guide-')); campaign = await Guide.install(root); });
  afterAll(async () => { await rm(root, { recursive: true, force: true }); });

  it('builds a world the linter finds nothing wrong with', async () => {
    expect(await KyrLint.campaign(campaign)).toEqual([]);
  }, 60000);
  it('plays: the inn and the chandlery trade, the ford takes time, the grille yields to the locksmith', async () => {
    const s = await PlaySession.start(campaign, 'guide', NodeBundleSource.shared);
    expect(Guide.legal(s).some(c => c.startsWith('camp'))).toBe(false);
    await s.perform('go(world__chandlery_door,world__counter)');
    expect(Guide.legal(s)).toContain('buy_item(world__osk_rope_1,world__member_party_1)');
    expect(Guide.legal(s)).toContain('buy_goods(rations,world__osk)');
    expect(Guide.legal(s)).toContain('take_healing(world__osk,world__osk_healing)');
    for (const c of ['go(world__chandlery_door,world__green)', 'go(world__heron_door,world__taproom)']) { await s.perform(c); }
    expect(Guide.legal(s)).toContain('take_lodging(world__wenna_lodging,world__wenna)');
    const start = s.campaign.state.elapsed;
    for (const c of ['go(world__heron_door,world__green)', 'go(world__shore_path,world__strand)']) { await s.perform(c); }
    expect(s.campaign.state.elapsed - start).toBe(7);
    expect(Guide.legal(s)).toContain('camp(world__strand)');
    for (const c of ['go(world__ford,world__porch)', 'go(world__chapel_door,world__nave)',
      'go(world__crypt_stair,world__stair_foot)']) { await s.perform(c); }
    expect(Guide.legal(s)).toContain('change_thing(world__grille_pick)');
    await s.perform('change_thing(world__grille_pick)');
    await s.perform('go(world__ossuary_arch,world__ossuary)');
    expect(s.campaign.world.test({ kind: 'call', name: 'state', args: ['rescue__guest', 'rescue__pinned'] })).toBe(true);
  }, 60000);
  it('gives authored people the mechanics their ancestry, class, traits and equipment name', async () => {
    const s = await PlaySession.start(campaign, 'guide', NodeBundleSource.shared);
    const who = (id: string) => s.campaign.state.creatures.find(c => c.id === `world__${id}_person`)!;
    const reeve = who('reeve'), sister = who('sister'), wolf = who('wolf');
    expect(reeve.traits).toEqual(['humanoid', 'adaptable', 'versatile', 'brave', 'knight']);
    expect(reeve.state.inventory).toContainEqual({ id: 'world__reeve_person__longsword_of_flames',
      definition: 'longsword_of_flames', equipped: true });
    expect(reeve.state.inventory).toContainEqual({ id: 'world__reeve_person__thieves_tools', definition: 'thieves_tools' });
    // A specialist person prepares as Orsino's casters do: cantrips, then spells no higher than ⌈level / 2⌉.
    expect(sister.base.abilities).toContain('cure_minor');
    const spells = sister.base.abilities.map(a => Canon.abilities[a]?.spell).filter(x => x !== undefined);
    expect(spells.every(x => x.tradition === 'divine' && x.level <= 2)).toBe(true);
    expect(spells.some(x => x.level > 0 && x.domain === 'life')).toBe(true);
    expect([wolf.raceId, wolf.classId, wolf.base.abilities]).toEqual(['wolf', undefined, ['rending_bite', 'flee']]);
    expect(s.campaign.module.entities.find(e => e.id === 'world__bone_slide')).toMatchObject({ type: 'hazard' });
  }, 60000);
});
