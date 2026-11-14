import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// Someone who has heard a good deal is asked once, for news (the owner, 15 November: "I shouldn't open a topic to
// find 30 rumors beneath it. Just sample one and have a 'Heard any news?' question"). In a1, Mistshaw's innkeeper
// carried fourteen generated hearsay asks (the shared `ask`, one for each thing they could be asked after); now there
// is one, which tells the next as each is heard, and no one's talk lists more than a few asks. The fold is in the
// grouping every client reads.
describe('news, asked once', () => {
  it('stands for a person\'s many hearsay asks as one, and leaves a person with few as they are', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--origin', 'order', '--as', 'human/ranger/Aud']));
    const s = journey.session, asked = new Map<string, number>(), news: string[] = [];
    const places = s.campaign.module.entities.filter(e => e.type === 'place' && e.id.startsWith('region__'));
    for (const place of places.slice(0, 160)) {
      GeneratedWorld.put(s, place.id.slice(8));
      for (const person of ScreenModel.build(s.campaign).people) {
        const asks = person.acts.filter(a => a.does === 'ask');
        asked.set(person.name, Math.max(asked.get(person.name) ?? 0, asks.length));
        news.push(...asks.filter(a => /for news$/.test(a.label)).map(a => `${person.name}: ${a.label}`));
      }
    }
    expect(Math.max(...asked.values())).toBeLessThan(3);
    expect(news.length).toBeGreaterThan(0);
    expect(news.some(n => /^Osborn.*: Ask Osborn for news$/.test(n))).toBe(true);
  }, 120000);
});
