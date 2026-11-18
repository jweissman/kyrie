import type { Campaign } from '../campaign/campaign';

// A story: an adventure installed with an ending of its own (a chapter of the country's book), by its title; an aim
// is part of the story it was written in, and one written in no such adventure (a town's job off a notice, a
// commission) is one of the miscellaneous aims beside the stories (the owner, 18 November, OR-74: one notice read had
// made seven aims of one weight, the drove's own two among three jobs, and nothing said which was the adventure).
export interface Story { id: string; title: string }
export class Stories {
  static of(campaign: Pick<Campaign, 'installations'>, aim: string): Story | undefined {
    const m = campaign.installations.find(i => i.chapter && aim.startsWith(`${i.id}__`));
    return m && { id: m.id, title: m.name };
  }
}
