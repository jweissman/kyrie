// The emblems of the ways a calling divides into, and of what spells are for (OWN-15), in the hand the other glyphs
// are drawn in: single strokes on a 48 by 48 ground, light on dark, no letters. A school's or a god's is its sigil; a
// spell's says what it is for, the same wherever the spell is shown, and of harm, its kind. Things, not signs (the
// owner's eye found a crosshair, a warning triangle, refresh arrows, a padlock and a pentacle among them): a shield
// with its rune, a summoning circle, a retort, a keystone, a thorn.
export class Emblems {
  static readonly paths: Record<string, string> = {
    // The eight schools.
    abjurer: 'M24 5l16 6v12c0 10-7 17-16 21-9-4-16-11-16-21V11zM24 37V15M24 25l-6-6M24 25l6-6',
    conjurer: 'M5 37a19 6.5 0 1 0 38 0a19 6.5 0 1 0-38 0zM12 37a12 3.5 0 1 0 24 0a12 3.5 0 1 0-24 0z'
      + 'M24 36c-5-5 4-8-1-14-4-5 3-9 1-16M30 15l2-2M16 20l-2-1.5M31 26l2.5 .5',
    diviner: 'M24 8a12 12 0 1 0 .01 0zM18 15a7 7 0 0 1 5-3M15 40h18M18 40l2-6M30 40l-2-6',
    enchanter: 'M24 24c0-2.9 4.3-2.9 4.3 0 0 4.3-5.8 5.8-8.7 1.4-2.9-5.8 2.9-11.6 8.7-10.2 7.2 1.4 10.2 8.7 7.2 15.9'
      + 'c-4.3 8.7-15.9 10.2-21.8 2.9-7.2-8.7-4.3-21.8 5.8-26.1 10.2-4.3 21.8 0 26.1 8.7',
    evoker: 'M27 5L13 27h10l-4 16 16-24H25z',
    illusionist: 'M8 14c10-4 22-4 32 0 0 14-6 22-16 22S8 28 8 14zM14 21c2-2 6-2 8 0M26 21c2-2 6-2 8 0M19 30c3 2 7 2 10 0',
    necromancer: 'M24 8c-9 0-14 6-14 13 0 5 3 8 6 9v6h16v-6c3-1 6-4 6-9 0-7-5-13-14-13zM18 18a3 3 0 1 0 .01 0z'
      + 'M30 18a3 3 0 1 0 .01 0zM20 36v-5M24 36v-5M28 36v-5',
    transmuter: 'M17 21a11 11 0 1 0 .01 0zM6.5 35h21M24.5 24.5C29 19 34 13 43 15M26.5 28.5C31 23 36 18 43 19'
      + 'M10 42h14M17 42v-1',
    // The twelve domains.
    vitalist: 'M24 21c-5-3.5-7.5-7.5-7.5-11a7.5 7.5 0 0 1 15 0c0 3.5-2.5 7.5-7.5 11zM24 21v22M13 24h22',
    deathspeaker: 'M16 42L28 6M28 6C20 6 12 10 9 17c5-4 12-5 19-4',
    lightbringer: 'M8 32h32M14 32a10 10 0 0 1 20 0M24 14v4M13 19l3 3M35 19l-3 3M7 26h3M38 26h3M14 38h20',
    shadowmancer: 'M30 8a16 16 0 1 0 10 26A13 13 0 0 1 30 8z',
    oathkeeper: 'M24 6v34M17 40h14M9 13h30M9 13L4 25h10zM39 13l-5 12h10z',
    wildcaller: 'M24 42V22M24 22c-9 0-14-5-14-11 0-4 4-7 8-6 1-3 4-5 6-5s5 2 6 5c4-1 8 2 8 6 0 6-5 11-14 11z'
      + 'M24 32l-6-5M24 29l6-5M18 42h12',
    chaotician: 'M24 6v36M6 24h36M12 12l24 24M36 12L12 36M21 9l3-3 3 3M39 21l3 3-3 3M27 39l-3 3-3-3M9 27l-3-3 3-3',
    warbringer: 'M10 8l24 24M27 35l8-8M34 32l5 5M38 8L14 32M21 35l-8-8M14 32l-5 5',
    oceanist: 'M6 20c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 28c4-4 8-4 12 0s8 4 12 0 8-4 12 0'
      + 'M6 36c4-4 8-4 12 0s8 4 12 0 8-4 12 0',
    cherubist: 'M24 36c-7-5-9-9-9-12a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-2 7-9 12zM15 22c-4-1-8-4-9-9 4 1 6 1 9 3'
      + 'M33 22c4-1 8-4 9-9-4 1-6 1-9 3',
    stormcaller: 'M14 28a7 7 0 0 1 1-14 9 9 0 0 1 17-1 7 7 0 0 1 2 15zM25 28l-4 8h6l-3 8',
    veneficium: 'M20 6h8M21 6v10l-9 16a6 6 0 0 0 5 9h14a6 6 0 0 0 5-9l-9-16V6M16 30h16',
    // The warrior's ways and the monk's.
    toughness: 'M8 16h26c0 5 4 8 8 8H30l-4 6h6v6H16v-6h6l-4-6c-6 0-10-4-10-8z',
    brave: 'M14 42V6M14 8h22l-5 7 5 7H14',
    strong_willed: 'M6 43V27a18 18 0 0 1 36 0v16M13 43V27a11 11 0 0 1 22 0v16M19 7.5h10l-1.8 9h-6.4z',
    wise: 'M24 12c-5-3-11-3-16-1v26c5-2 11-2 16 1 5-3 11-3 16-1V11c-5-2-11-2-16 1zM24 12v26',
    compassion: 'M24 24c-5-3-7-6-7-8a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 2-2 5-7 8zM8 27c0 8 7 13 16 13s16-5 16-13'
      + 'M8 27h6M34 27h6',
    discipline: 'M14 38a10 4 0 1 0 20 0a10 4 0 1 0-20 0zM17 29a7 3 0 1 0 14 0a7 3 0 1 0-14 0z'
      + 'M20 21.5a4 2.5 0 1 0 8 0a4 2.5 0 1 0-8 0z',
    // What a spell is for (see SpellKinds).
    harm: 'M24 4l4 11 10-5-3.5 11 11 3-10 6 6 10-11-3-2 11-4.5-10-6.5 9 .5-11-10 1.5 7.5-9-8-7.5 11 .5z',
    fire: 'M24 44c-8 0-13-5-13-12 0-8 7-11 8-20 4 3 5 7 5 10 2-2 3-5 3-8 6 5 10 11 10 18 0 7-5 12-13 12z'
      + 'M24 44c-3 0-5-2-5-5 0-3 3-5 5-9 2 4 5 6 5 9 0 3-2 5-5 5z',
    frost: 'M24 6v36M24 12.8l3.9-4.6M24 12.8l-3.9-4.6M8.4 15l31.2 18M14.3 18.4l-2-5.6M14.3 18.4l-5.9 1.1'
      + 'M8.4 33l31.2-18M14.3 29.6l-5.9-1.1M14.3 29.6l-2 5.6M24 35.2l-3.9 4.6M24 35.2l3.9 4.6M33.7 29.6l2 5.6'
      + 'M33.7 29.6l5.9-1.1M33.7 18.4l5.9 1.1M33.7 18.4l2-5.6',
    spark: 'M30 4L19 21l9 2-13 21M23.5 31.5l7.5 1.5',
    thunder: 'M24 21a3 3 0 1 0 .01 0zM17.5 17.5a9 9 0 0 0 0 13M30.5 17.5a9 9 0 0 1 0 13M12 12a17 17 0 0 0 0 24'
      + 'M36 12a17 17 0 0 1 0 24M6.5 6.5a25 25 0 0 0 0 35M41.5 6.5a25 25 0 0 1 0 35',
    venom: 'M24 5c6 9 11 15 11 22a11 11 0 0 1-22 0c0-7 5-13 11-22zM19 29a5 5 0 0 0 5 5',
    drain: 'M24 27c-7-4.5-10-8-10-12a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 4-3 7.5-10 12zM24 33c2.2 3 3.6 5.2 3.6 7.2'
      + 'a3.6 3.6 0 0 1-7.2 0c0-2 1.4-4.2 3.6-7.2z',
    ward: 'M24 7l13 5v10c0 9-6 15-13 19-7-4-13-10-13-19V12z',
    heal: 'M20 10h8v10h10v8H28v10h-8V28H10v-8h10z',
    light: 'M20 26h8v14h-8zM24 8c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10zM14 40h20',
    sight: 'M6 24c5-8 11-12 18-12s13 4 18 12c-5 8-11 12-18 12S11 32 6 24zM24 18a6 6 0 1 0 .01 0z',
    charm: 'M24 38C12 30 8 24 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 6-4 12-16 20z',
    fear: 'M24 7a17 17 0 1 0 .01 0zM18 17.5a2.5 2.5 0 1 0 .01 0zM30 17.5a2.5 2.5 0 1 0 .01 0zM24 26a4 5 0 1 0 .01 0z',
    sleep: 'M10 14h12L10 28h12M28 24h9l-9 10h9M34 8h6l-6 6h6',
    move: 'M8 24h28M28 16l8 8-8 8M8 16h12M8 32h12',
    summon: 'M8 38a16 6 0 1 0 32 0a16 6 0 1 0-32 0zM24 36V12M17 19l7-7 7 7',
    curse: 'M13 43Q16 20 36 6M13.8 38l7.1-3.3-5.9-1M16.4 29.6l-3.3-7.1 5.2 3.1M20.4 21.9l7.8-.7-5.3-2.9'
      + 'M25.8 14.8l-.7-7.8 3.8 4.7',
    craft: 'M12 9h18v9H12zM30 13.5h6M21 18v24',
  };
}
