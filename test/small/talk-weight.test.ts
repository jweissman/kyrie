import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// What the company has come to say or settle with someone is known by what saying it does, never by its words (M21's
// playability list, PL-15): the talk had led with whatever began "Tell …" or "Pay …". A reckoner with four things to
// be said: news of the job done, which an aim waits on; asking her along; asking where the cache is, which tells a
// place; and a joke that begins "Tell" and settles nothing.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place pit "the old pit" is room at 1, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation reported(entity).
  Person tam "Tam" at yard { Role "who keeps the yard's tally". Ancestry human. Peaceable. Pronouns she. }
  Entity job: fact "The rats in the store are dead.".
  Initially Assert established(job). Initially Assert knows(party, job).
  Entity cache_at: fact "The cache is in the old pit.".
  Initially Assert leadsTo(cache_at, pit).
  Topic tell_job with tam "Tell Tam the rats are dead" when knows(actor, job) and not reported(job) once {
    Says "'Good,' says Tam, and makes a mark.".
    On discuss { Assert reported(job). }
  }
  Topic ask_along with tam "Ask Tam along" when true once {
    Says "'Why not,' says Tam.".
    On discuss { Assert willing(tam, actor). }
  }
  Topic ask_cache with tam "Ask Tam where the cache is" when true once {
    Says "'The old pit,' says Tam.".
    On discuss { Assert knows(actor, cache_at). }
  }
  Topic tell_joke with tam "Tell Tam the one about the miller" when true once { Says "Tam does not laugh.". }
  Objective report when knows(party, job) and not reported(job) toward tam "Tell Tam the rats are dead.".
  Goal false.`;

describe('what someone has to be told, asked or settled with', () => {
  it('is what bears on an aim, asks them along or tells a place, and not a label that begins "Tell"', async () => {
    const t = await Tiny.start(yard);
    expect(new Set(t.screen.weighty)).toEqual(new Set(['t__tell_job', 't__ask_along', 't__ask_cache']));
  });
});
