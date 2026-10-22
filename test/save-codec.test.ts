import { describe, expect, it } from 'bun:test';
import { SaveCodec } from '../web/engine/save-codec';

// A game kept in the browser is packed (gzip, then base64) so that a world of several regions fits the browser's
// storage; a plain save file opens as it is.
describe('a kept game', () => {
  it('packs small and opens to the same text', async () => {
    const text = JSON.stringify({ checkpoint: { save: { module: { entities: Array.from({ length: 4000 }, (_, i) =>
      ({ id: `region__s${i % 7}_green_${i}`, name: 'the green of Murkstede' })) } } } });
    const packed = await SaveCodec.pack(text);
    expect(packed.startsWith(SaveCodec.mark)).toBe(true);
    expect(packed.length).toBeLessThan(text.length / 5);
    expect(await SaveCodec.unpack(packed)).toBe(text);
  });
  it('opens a plain save as it is', async () => {
    expect(await SaveCodec.unpack('{"checkpoint":{}}')).toBe('{"checkpoint":{}}');
  });
});
