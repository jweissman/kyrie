import { expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';

it('exposes a diverse, compatible and declaratively extensible possibility space through the installed CLI', () => {
  const result = spawnSync('bash', ['test/smoke-deem-choices.sh'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
  const proof = JSON.parse(result.stdout);
  expect(proof.invocations).toBe(608);
  expect(proof.extensionExamples.map((c: { raceId: string }) => c.raceId)).toEqual(['boar', 'dragon']);
}, 300000);
