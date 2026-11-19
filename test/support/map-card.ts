import type { ReactElement } from 'react';
import type { Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';
import { RouteCard } from '../../web/reader/route-card';

type Element = ReactElement<{ children?: unknown; 'data-action'?: string; onClick?: (e?: object) => void;
  className?: string }>;
// The map's card for a place or a hex chosen, as the reader draws it (RouteCard): what it says, its legs, and what its
// button sets out by when it is pressed.
export class MapCard {
  static of(screen: Screen, chosen: string): { text: string; legs: number; command?: string } {
    let command: string | undefined;
    const app = { choose: (c: Choice) => { command = c.command; }, state: { frame: { title: '' } } } as unknown as ReaderApp;
    const card = RouteCard.View({ app, screen, chosen }) as Element, all = MapCard.all(card);
    // Activated as an assistive technology does, which a held row (a journey, OR-111) takes at once: no hand holds it.
    const activate = { detail: 0, preventDefault: MapCard.none, stopPropagation: MapCard.none };
    all.find(k => k.props['data-action'] === 'set-out')?.props.onClick?.(activate);
    const legs = all.find(k => k.type === 'ol')?.props.children as unknown[] | undefined;
    return { text: MapCard.text(card.props.children), legs: legs?.length ?? 0, ...command ? { command } : {} };
  }
  private static none(): void { /* an event's default, here nothing */ }
  // Every element under one, itself first.
  private static all(node: unknown): Element[] {
    if (Array.isArray(node)) { return node.flatMap(n => MapCard.all(n)); }
    if (!node || typeof node !== 'object') { return []; }
    const el = node as Element, shown = MapCard.shown(el);
    return [el, ...MapCard.all(shown ? shown : el.props.children)];
  }
  // A component of the card (the map's menu) as it draws: its function called, for it holds no state of its own.
  private static shown(el: Element): unknown {
    return typeof el.type === 'function' ? (el.type as (p: unknown) => unknown)(el.props) : undefined;
  }
  private static text(node: unknown): string {
    if (typeof node === 'string' || typeof node === 'number') { return String(node); }
    if (Array.isArray(node)) { return node.map(n => MapCard.text(n)).join(' '); }
    if (!node || typeof node !== 'object') { return ''; }
    const el = node as Element;
    return MapCard.text(MapCard.shown(el) ?? el.props.children);
  }
}
