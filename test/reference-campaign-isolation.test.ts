import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import type { PlaySession } from '../src/session/play-session';

const seeds = ['s0', 's1'];
const commands = ['wait', 'wait_hour'];

async function start(seed: string): Promise<PlaySession> {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed,
    '--as', 'human/warrior/Wenna', '--opening', 'none']));
  return journey.session;
}

async function alone(seed: string) {
  const session = await start(seed);
  expect(Object.keys(session.campaign.module.catalog?.items ?? {}).length
    + Object.keys(session.campaign.module.catalog?.species ?? {}).length).toBeGreaterThan(0);
  for (const command of commands) { await session.leg(command); }
  return session.receipts;
}

describe('reference campaigns keep their own compilation catalogs', () => {
  it('matches standalone receipts when two seeded worlds alternate commands in one process', async () => {
    const firstAlone = await alone(seeds[0]!);
    const secondAlone = await alone(seeds[1]!);

    const first = await start(seeds[0]!);
    const second = await start(seeds[1]!);
    for (const session of [first, second]) {
      expect(Object.keys(session.campaign.module.catalog?.items ?? {}).length
        + Object.keys(session.campaign.module.catalog?.species ?? {}).length).toBeGreaterThan(0);
    }
    for (const command of commands) {
      await first.leg(command);
      await second.leg(command);
    }
    expect(first.receipts).toEqual(firstAlone);
    expect(second.receipts).toEqual(secondAlone);
  }, 240000);
});
