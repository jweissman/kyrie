import type { Leaf } from './narrator';
import { Typography } from './typography';

// What a page tells, told once on it.
export class ToldOnce {
  // What has changed since the company was last here, less what the place's telling, who is here or what came of the
  // act says already on this page (OR-245, the first blind cold play's P116: come back into the gatehouse with the
  // pawl, its sawn pin had been told in the place and again under Since you were last here).
  static changed<G extends { changed: string[] }>(glance: G, leaf: Leaf): G {
    const said = new Set([...leaf.glanced?.situation ?? leaf.situation, ...leaf.glanced?.presence ?? leaf.presence,
      ...(leaf.exchange?.lines ?? []).map(l => l.text)].map(t => Typography.curl(t)));
    return { ...glance, changed: glance.changed.filter(c => !said.has(Typography.curl(c))) };
  }
}
