import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { EngineHost } from '../../../web/engine/engine-host';
import type { Frame, Message } from '../../../src/creation/protocol';
import type { PlaySession } from '../../../src/session/play-session';
import { CompanyFaces } from '../../../src/autoplay/company-faces';
import { SceneModel } from '../../../src/ui/scene';

// Feature pins: see test/features/choice/consequence.pin.test.ts.
// OR-1070 (the owner, 26 November: "companion icons not always reflected"): Gesk, a lizardfolk hired in Gatesend's
// taproom, is met by his people's emblem, and keeps it: on the scene once he has joined, on his page, and in the
// fight in the corn-store's warren, where he had been a bare glyph on the scene and the ascetic's painting elsewhere.
// Every frame the page is sent, the fight's turns among them, holds the company's one face (CompanyFaces).
const walk = ['go(region__s4_inn_door,region__s4_taproom)', 'region__s4_traveller_brings', 'recruit(region__s4_traveller)',
  'go(region__s4_inn_door,region__s4_green)', 'region__s4_u_notice_read(party,region__s4_green)', 'talk_to(origin__nest)',
  'region__s4_u_rats_job_ask', 'go(origin__weir_path,origin__weir)'];
describe('Character › The company drawn by one face', () => {
  it('draws one who joins by the face they were met in, on the scene, on their page and in a fight, every frame', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const s = journey.session, c = s.campaign, breaches: string[] = [], frames: Frame[] = [];
    const check = (f: Frame, said: string) => {
      frames.push(f); breaches.push(...CompanyFaces.of(c, f.screen, f.combat).map(b => `${said}: ${b}`));
    };
    const host: EngineHost = new EngineHost((m: Message) => {
      if (m.kind === 'frame') { check(m.frame, 'a fight turn'); setTimeout(() => void host.handle({ kind: 'fight' }), 0); }
    });
    (host as unknown as { session: PlaySession }).session = s;
    const gesk = (f: Frame) => SceneModel.build(f.screen).subjects.find(x => x.id === 'region__s4_traveller');
    for (const command of walk) {
      const f = await host.handle({ kind: 'perform', command }) as Frame;
      check(f, command);
      if (command === 'region__s4_traveller_brings') { expect(gesk(f)).toMatchObject({ kind: 'person', emblem: 'lizardfolk' }); }
      if (command.startsWith('recruit')) {
        expect(gesk(f)).toMatchObject({ kind: 'companion', emblem: 'lizardfolk' });
        expect(gesk(f)?.portrait).toBeUndefined();
        expect(f.screen.party[1]).toMatchObject({ name: 'Gesk' });
        expect(f.screen.party[1]?.portrait ?? f.screen.party[1]?.face).toBeUndefined();
      }
    }
    for (const command of ['travel:region__s4_u_store', 'go(region__s4_u_trap,region__s4_u_cellar)',
      'light_item(region__party_1__candle)', 'go(region__s4_u_runs,region__s4_u_warren)', 'attack(region__s4_u_rats)']) {
      const f = await (command.startsWith('travel:') ? host.handle({ kind: 'travel', destination: command.slice(7) })
        : host.handle({ kind: 'perform', command })) as Frame;
      check(f, command);
    }
    const fought = frames.filter(f => f.combat);
    expect(fought.length).toBeGreaterThan(0);
    expect(fought.every(f => f.combat!.allies.some(a => a.name === 'Gesk' && !a.face))).toBe(true);
    expect(breaches).toEqual([]);
  }, 30000);
});
