import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { SettingPort } from '../../src/setting-port';
import { Calendar } from '../../src/campaign/calendar';

// The setting port (MT-16, S6): the runtime asks its setting for the reckoning of days and the sky, and the setting
// gives them at each composition root (bunfig.toml's preload here). The runtime's own files load without it, reading
// nothing as they load (the browser boot gate), and a part asked for before it is given says so by name.
const root = resolve(import.meta.dir, '../..');
class Bare {
  // A bun run outside the repository (no bunfig.toml, so no preload), importing the runtime's files by their paths.
  static run(code: string) {
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-port-'));
    try {
      const p = Bun.spawnSync(['bun', '-e', code], { cwd: dir, env: { ...process.env } });
      return { ok: p.success, out: p.stdout.toString().trim(), err: p.stderr.toString() };
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
}

describe('the setting installed', () => {
  it('is given for every spec by the preload, Imbar\'s reckoning and sky', () => {
    expect(SettingPort.installed()).toBe(true);
    expect(Calendar.months).toHaveLength(12);
    expect(Calendar.months[0]).toEqual({ name: 'Thaw', season: 'spring' });
    expect(SettingPort.sky.signs.length).toBeGreaterThan(0);
  });
  it('lets the runtime load before it is given, and names what is missing at its first use', () => {
    const loaded = Bare.run(`const { Calendar } = await import(${JSON.stringify(`${root}/src/campaign/calendar.ts`)});
      await import(${JSON.stringify(`${root}/src/rules/sky-gifts.ts`)});
      await import(${JSON.stringify(`${root}/src/presentation/character-sheet.ts`)});
      try { Calendar.months; console.log('read'); } catch (e) { console.log(String(e)); }`);
    expect(loaded.ok).toBe(true);
    expect(loaded.out).toMatch(/The setting has given the runtime nothing yet: import src\/canon\/setting-install/);
    const filled = Bare.run(`await import(${JSON.stringify(`${root}/src/canon/setting-install.ts`)});
      const { Calendar } = await import(${JSON.stringify(`${root}/src/campaign/calendar.ts`)});
      console.log(Calendar.short({ year: 1312, month: 1, day: 1 }, 0));`);
    expect(filled.out).toBe('1 Thaw');
  }, 60000);
});
