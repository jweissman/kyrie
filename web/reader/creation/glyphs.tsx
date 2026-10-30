import { Emblems } from './emblems';

// The emblems on creation's cards, drawn in light in one hand: a line glyph for each reason for coming, calling and
// people (a wheat sheaf for the settled folk, a coin for what is owed, a staff, a lyre), each school, god and way
// (see Emblems), and each thing a spell is for; anything else, the name's first letter in a ring. Their lines keep
// one weight at any size. They decorate; nothing is decided by them.
export class Glyphs {
  private static readonly paths: Record<string, string> = {
    // Reasons for coming.
    debt: 'M24 7a17 17 0 1 0 .01 0zM24 11.5a12.5 12.5 0 1 0 .01 0zM17.5 29l2-9 4.5 4.5 4.5-4.5 2 9z',
    herbs: 'M24 40V18M24 26c-8-2-12-8-12-14 8 0 12 6 12 14zM24 22c6-2 10-7 10-12-7 0-10 5-10 12zM16 40h16',
    kin: 'M10 22L24 10l14 12M14 19v19h20V19M21 38v-9h6v9',
    order: 'M14 10h20v28H14zM18 17h12M18 22h12M18 27h7M33 34a5 5 0 1 0 .01 0',
    wanderer: 'M16 40l6-32M32 40l-6-32M23 34h2M23.5 26h1M24 18h0.5',
    // Callings.
    warrior: 'M24 6v26M18 32h12M24 32v8M20 40h8M24 6l3 5v19M24 6l-3 5v19',
    mage: 'M18 45l8-28M28 3a6.5 6.5 0 1 0 .01 0zM23 18c-3-2-4-6.5-2.5-9.5M32 18.5c2.5-2 3.5-6 2-9.5M38 3.5l2.5-2'
      + 'M39.5 11h3.5M17 4.5L14.5 2M15 12h-3',
    thief: 'M18 22a6 6 0 1 0 .01 0zM24 22h16M34 22v6M38 22v5',
    cleric: 'M24 14a10 10 0 1 0 .01 0zM24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4',
    bard: 'M15 9c-6 9-5 19 3 26 3 3 9 3 12 0 8-7 9-17 3-26M15 9c-1-3-4-3-5-1M33 9c1-3 4-3 5-1M12 14h24'
      + 'M20 14v20M24 14v22M28 14v20M18 40h12M24 36v4',
    ranger: 'M14 8c14 6 14 26 0 32M14 8v32M8 24h32M34 20l6 4-6 4',
    monk: 'M24 6a18 18 0 1 0 .01 0zM24 6a9 9 0 0 1 0 18 9 9 0 0 0 0 18M24 13v.5M24 34v.5',
    // Peoples.
    human: 'M24 28V10M24 28C21 22 17 17 13 13M24 28c3-6 7-11 11-15M24 28v15M24 28c-2 6-5 11-8 15M24 28c2 6 5 11 8 15'
      + 'M19 28h10M24 2c2.6 2.5 2.6 6.5 0 9-2.6-2.5-2.6-6.5 0-9zM13 13c-3.5 0-6-3.5-5.5-8 3.5 0 6 3.5 5.5 8z'
      + 'M35 13c3.5 0 6-3.5 5.5-8-3.5 0-6 3.5-5.5 8z',
    elf: 'M24 6c10 8 10 28 0 36-10-8-10-28 0-36zM24 12v28',
    dwarf: 'M6 38L18 16l6 10 6-14 12 26zM14 30l4-6M30 24l3 6',
    ...Emblems.paths,
  };
  static has(id: string): boolean { return id in Glyphs.paths; }
  static View({ id, name, className = 'glyph' }: { id: string; name: string; className?: string }) {
    const path = Glyphs.paths[id];
    return (
      <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        {path ? <path d={path} vectorEffect="non-scaling-stroke" /> : <>
          <circle cx="24" cy="24" r="17" />
          <text x="24" y="24" dominantBaseline="central" textAnchor="middle">{name.trim()[0]?.toUpperCase()}</text>
        </>}
      </svg>
    );
  }
}
