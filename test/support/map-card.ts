import type { ReactElement } from 'react';
import type { Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';
import { RouteCard } from '../../web/reader/route-card';

type Element = ReactElement<{ children?: unknown; 'data-action'?: string; onClick?: () => void; className?: string }>;
// The map's card for a place or a hex chosen, as the reader draws it (RouteCard): what it says, its legs, and what its
// button sets out by when it is pressed.
export class MapCard {
  static of(screen: Screen, chosen: string): { text: string; legs: number; command?: string } {
    let command: string | undefined;
    const app = { choose: (c: Choice) => { command = c.command; }, state: { frame: { title: '' } } } as unknown as ReaderApp;
    const card = RouteCard.View({ app, screen, chosen }) as Element, all = MapCard.all(card);
    all.find(k => k.props['data-action'] === 'set-out')?.props.onClick?.();
    const legs = all.find(k => k.type === 'ol')?.props.children as unknown[] | undefined;
    return { text: MapCard.text(card.props.children), legs: legs?.length ?? 0, ...command ? { command } : {} };
  }
  // Every element under one, itself first.
  private static all(node: unknown): Element[] {
    if (Array.isArray(node)) { return node.flatMap(n => MapCard.all(n)); }
    if (!node || typeof node !== 'object') { return []; }
    return [node as Element, ...MapCard.all((node as Element).props.children)];
  }
  private static text(node: unknown): string {
    if (typeof node === 'string' || typeof node === 'number') { return String(node); }
    if (Array.isArray(node)) { return node.map(n => MapCard.text(n)).join(' '); }
    return node && typeof node === 'object' ? MapCard.text((node as Element).props.children) : '';
  }
}
