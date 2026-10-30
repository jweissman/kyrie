import type { ReactElement } from 'react';
import type { Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';
import { MapView } from '../../web/reader/map-view';

type Element = ReactElement<{ children?: unknown; 'data-action'?: string; onClick?: () => void; className?: string }>;
// The map's card for a place or a hex chosen, as the reader draws it: what it says, its legs, and what its button sets
// out by when it is pressed.
export class MapCard {
  static of(screen: Screen, chosen: string): { text: string; legs: number; command?: string } {
    let command: string | undefined;
    const app = { choose: (c: Choice) => { command = c.command; }, state: { frame: { title: '' } } } as unknown as ReaderApp;
    const parts = ([] as unknown[]).concat((MapView.Plan({ app, screen, chosen }) as Element).props.children)
      .filter((k): k is Element => !!k && typeof k === 'object');
    parts.find(k => k.props['data-action'] === 'set-out')?.props.onClick?.();
    const legs = parts.find(k => k.props.className === 'legs')?.props.children as unknown[] | undefined;
    return { text: MapCard.text(parts), legs: legs?.length ?? 0, ...command ? { command } : {} };
  }
  private static text(node: unknown): string {
    if (typeof node === 'string' || typeof node === 'number') { return String(node); }
    if (Array.isArray(node)) { return node.map(n => MapCard.text(n)).join(' '); }
    return node && typeof node === 'object' ? MapCard.text((node as Element).props.children) : '';
  }
}
