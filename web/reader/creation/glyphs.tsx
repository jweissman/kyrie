// The emblems on creation's cards, drawn in light in one hand: a line glyph for each reason for coming, calling and
// people that has one, and otherwise the name's first letter in a ring. They decorate; nothing is decided by them.
export class Glyphs {
  private static readonly paths: Record<string, string> = {
    // Reasons for coming.
    debt: 'M24 8a16 16 0 1 0 .01 0zM24 14a10 10 0 1 0 .01 0zM24 19v10M20 24h8',
    herbs: 'M24 40V18M24 26c-8-2-12-8-12-14 8 0 12 6 12 14zM24 22c6-2 10-7 10-12-7 0-10 5-10 12zM16 40h16',
    kin: 'M10 22L24 10l14 12M14 19v19h20V19M21 38v-9h6v9',
    order: 'M14 10h20v28H14zM18 17h12M18 22h12M18 27h7M33 34a5 5 0 1 0 .01 0',
    wanderer: 'M16 40l6-32M32 40l-6-32M23 34h2M23.5 26h1M24 18h0.5',
    // Callings.
    warrior: 'M24 6v26M18 32h12M24 32v8M20 40h8M24 6l3 5v19M24 6l-3 5v19',
    mage: 'M24 6l4 13 13 5-13 5-4 13-4-13-13-5 13-5z',
    thief: 'M18 22a6 6 0 1 0 .01 0zM24 22h16M34 22v6M38 22v5',
    cleric: 'M24 14a10 10 0 1 0 .01 0zM24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4',
    bard: 'M16 40V14c0-4 16-4 16 0v26M16 40h16M20 18v18M24 17v19M28 18v18',
    ranger: 'M14 8c14 6 14 26 0 32M14 8v32M8 24h32M34 20l6 4-6 4',
    monk: 'M24 6a18 18 0 1 0 .01 0zM24 6a9 9 0 0 1 0 18 9 9 0 0 0 0 18M24 13v.5M24 34v.5',
    // Peoples.
    human: 'M24 8a6 6 0 1 0 .01 0zM14 40c0-8 4-14 10-14s10 6 10 14',
    elf: 'M24 6c10 8 10 28 0 36-10-8-10-28 0-36zM24 12v28',
    dwarf: 'M6 38L18 16l6 10 6-14 12 26zM14 30l4-6M30 24l3 6',
  };
  static View({ id, name }: { id: string; name: string }) {
    const path = Glyphs.paths[id];
    return (
      <svg className="glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        {path ? <path d={path} /> : <>
          <circle cx="24" cy="24" r="17" />
          <text x="24" y="24" dominantBaseline="central" textAnchor="middle">{name.trim()[0]?.toUpperCase()}</text>
        </>}
      </svg>
    );
  }
}
