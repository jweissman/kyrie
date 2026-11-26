import * as React from 'react';
import type { ReactElement } from 'react';
import type { Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';
import { RouteCard } from '../../web/reader/route-card';
import { MenuTree } from '../../src/frame/menu-tree';
import type { Frame } from '../../src/creation/protocol';

type Element = ReactElement<{ children?: unknown; 'data-action'?: string; onClick?: (e?: object) => void;
  className?: string }>;
// The map's card for a place or a hex chosen, as the reader draws it (RouteCard): what it says, its legs, and what its
// button sets out by when it is pressed.
export class MapCard {
  static of(screen: Screen, chosen: string): { text: string; legs: number; command?: string } {
    return MapCard.held(() => MapCard.read(screen, chosen));
  }
  private static read(screen: Screen, chosen: string): { text: string; legs: number; command?: string } {
    let command: string | undefined;
    // The frame the card is drawn over, as the host sends it: with its menu and marks (MenuTree), over this screen.
    const frame = MenuTree.framed({ title: '', screen, leaf: {} } as unknown as Frame);
    const app = { choose: (c: Choice) => { command = c.command; }, state: { frame } } as unknown as ReaderApp;
    const card = RouteCard.View({ app, screen, chosen }) as Element, all = MapCard.all(card);
    // Activated as an assistive technology does, which a held row (a journey, OR-111) takes at once: no hand holds it.
    const activate = { detail: 0, preventDefault: MapCard.none, stopPropagation: MapCard.none };
    all.find(k => k.props['data-action'] === 'set-out')?.props.onClick?.(activate);
    const legs = all.find(k => k.type === 'ol')?.props.children as unknown[] | undefined;
    return { text: MapCard.text(card.props.children), legs: legs?.length ?? 0, ...command ? { command } : {} };
  }
  private static none(): void { /* an event's default, here nothing */ }
  // Its components called with no renderer under them: what they keep (a ref to the card, to say it goes on; an aside
  // measured against its row: OR-841, OR-842) is kept for the call alone, and what they do once drawn is not done,
  // for nothing here is drawn. Their words and what their buttons do are as the page has them.
  private static held<T>(read: () => T): T {
    const internals = (React as unknown as Record<string, { H: unknown }>)
      .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE!;
    const was = internals.H;
    internals.H = MapCard.hooks;
    try { return read(); } finally { internals.H = was; }
  }
  private static readonly hooks = {
    useRef: <V>(current: V) => ({ current }), useEffect: MapCard.none, useLayoutEffect: MapCard.none,
    useState: <V>(v: V) => [typeof v === 'function' ? (v as () => V)() : v, MapCard.none],
    useMemo: <V>(make: () => V) => make(), useCallback: <F>(f: F) => f,
    useContext: (c: { _currentValue?: unknown }) => c._currentValue,
  };
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
