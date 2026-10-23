import backgrounds from '../../data/catalog/backgrounds.json';
import occupations from '../../data/generation/scenes/occupations.json';
import type { Painting } from './painting-metadata';

// What a painting's concept is in the game: a person of some work (and which family of work: faith, learning, trade,
// the wild, the water…), a place, a creature, an event, an object, or an idea; which backgrounds and occupations it
// can stand for; and which it is the chosen painting of.
export interface PaintingConcept {
  kind: 'person' | 'place' | 'creature' | 'event' | 'object' | 'idea';
  family?: string; backgrounds?: string[]; occupations?: string[];
}

export class PaintingConcepts {
  static readonly places = ['abbey', 'academy', 'arcadia', 'arch', 'asylum', 'bath', 'bridge', 'bullring', 'cafe', 'camp',
    'canal', 'castle', 'cathedral', 'chapel', 'city', 'college', 'colonnade', 'colony', 'encampment', 'fane', 'falls',
    'forest', 'forge', 'fountain', 'gallery', 'grotto', 'grove', 'hothouse', 'inferno', 'labyrinth', 'library',
    'lighthouse', 'limbo', 'mill', 'mountain', 'narthex', 'nowhere', 'palace', 'paradise', 'pandaemonium', 'perdition',
    'redoubt', 'river', 'road', 'ruin', 'salon', 'sanctuary', 'stage', 'street', 'studio', 'temple', 'terrace', 'theater',
    'tower', 'trilith', 'urbs', 'well', 'workshop', 'world', 'galley', 'globe'];
  static readonly creatures = ['angel', 'bear', 'chimera', 'cyclops', 'demon', 'dog', 'dragon', 'eagle', 'fox', 'goat',
    'gryphon', 'hare', 'harpy', 'horse', 'hydra', 'lamia', 'leopard', 'lich', 'lion', 'monkey', 'moloch', 'nymph', 'owl',
    'oxen', 'peacock', 'pegasus', 'python', 'satyr', 'sea-monster', 'siren', 'snake', 'sphinx', 'squirrel', 'tiger',
    'undine', 'unicorn', 'vampyre', 'whale', 'wolf', 'cthelll', 'sea-king', 'muse', 'goddess', 'novensides'];
  static readonly events = ['accident', 'assassination', 'avalanche', 'bacchanal', 'banquet', 'brawl', 'call', 'cataclysm',
    'concert', 'conspiracy', 'conversion', 'coronation', 'crash', 'deliverance', 'dissection', 'eruption', 'fair', 'fight',
    'flay', 'gale', 'game', 'harvest', 'honeymoon', 'imprison', 'invasion', 'judgment', 'marriage', 'masquerade', 'party',
    'prayer', 'quest', 'sacrifice', 'singing-contest', 'tempest', 'the-hunt', 'threaten', 'transformation', 'trick',
    'vigil', 'wreck', 'announcement', 'blessing', 'bite', 'meditation', 'contemplation', 'reflection', 'reminiscence',
    'reverie', 'daydream', 'dream', 'vision', 'hallucination', 'idyll', 'lovers', 'people', 'gaggle', 'herd', 'gang',
    'quorum', 'syndicate', 'guild', 'coven', 'the-circle', 'the-thousand-works'];
  static readonly objects = ['astrolabe', 'breviary', 'cup', 'folio', 'horologium', 'icon', 'journal', 'mirror', 'orb',
    'orrery', 'painting', 'wheel', 'bolt', 'charm', 'chrysanthemum', 'poppy', 'food', 'fire', 'the-fire', 'light',
    'silver', 'ambergris', 'chariot', 'the-number'];
  // A family of work for a person a concept names, by background kind where Orsino has the background, else by word.
  static readonly families: [string, RegExp][] = [
    ['faith', /abbess|abbot|archimandrite|bishop|cardinal|celebrant|deacon|friar|hierophant|homilist|hospitaller|hymnist|monk|mother-superior|novice|nun|pope|priest|prior|psalmist|saint|theologian|vigil-keeper|apostle|disciple|penitent|pilgrim|believer|convert|martyr|mendicant|ascetic|hermit|exorcist|inquisitor|oracle|prophet|seer|sibyl|augur|druid|theurge|mystic|pythoness|soothsayer/],
    ['learning', /academician|algebraist|amanuensis|annalist|antiquarian|archaeologist|archivist|astronomer|biologist|bibliophile|botanist|calligrapher|cartographer|chemist|classicist|copyist|encyclopedist|historian|humanist|lector|librarian|linguist|logician|mathematician|naturalist|ornithologist|philologist|philosopher|physicist|polymath|professor|reader|researcher|savant|scholar|scholarch|scientist|scribe|scrivener|teacher|translator|writer|alchemist|astrologer|magus|wizard|sage|thinker|dialectician|ethicist|metaphysician|monist|atomist|esotericist|hermeticist|kabbalist|medium|spiritualist|necromancer|sorceress|enchant|witch|magician|conjuror|illusionist|summoner|demonologist|occult|oneiromancer|cartomancer|diviner|fortune-teller/],
    ['court', /admiral|ambassador|ambassadress|chancellor|condesa|courtier|diplomat|doge|duke|emperor|empress|gentleman|governor|governess|king|lady|legate|lord|magistrate|marquesa|minister|official|politician|prince|princess|queen|statesman|viscount|vizier|dictator|tyrant|herald|emissary|secretary|advisor|advocate|lawyer|jurist|lawgiver|judge|patron|benefactor|foundress/],
    ['arms', /berserker|captain|champion|commander|conqueror|crusader|defender|dragonslayer|ensign|fencing|fighter|general|guardian|halberdier|knight|paladin|protector|samurai|soldier|spahi|squire|standard-bearer|swordsman|warlord|warrior|brandisher|far-shooter|avenger|hero|heroine|warden|gatekeeper|jailer/],
    ['trade', /arms-dealer|art-dealer|artisan|auctioneer|baker|banker|barber|breeder|brewer|broker|builder|businessman|butcher|candlemaker|carpenter|carpetmonger|charm-seller|chef|chocolatier|cook|craftsman|embroiderer|engraver|financier|florist|fruit-seller|furrier|innkeeper|jeweler|kitchenmaid|laundress|luthier|mason|merchant|miller|money-changer|needleworker|nourisher|nurseryman|peddler|potter|printer|seamstress|shipowner|shoemaker|shopkeeper|silversmith|smith|smelter|tavernkeeper|tinker|toymaker|trader|vintner|weaver|milkmaid|picker|sower|gleaner|harvester|farmer|peasant|gardener|horticulturist|arborist|rosarian|servant|caretaker|groundskeeper|apprentice|master|accountant|bookkeeper|reckoner|assessor|alnager|speculator/],
    ['healing', /alienist|apothecary|convalescent|dietitian|doctor|healer|herbalist|medical|midwife|nurse|physician|psychoanalyst|psychologist|purifier|receptary/],
    ['wild', /birdkeeper|cowherd|falconer|gamekeeper|game-warden|goose-girl|gooseherd|herd|hunter|huntress|monkey-trainer|poacher|ranger|shepherd|snake-charmer|trapper|woodsman|feller|gatherer|broncobuster|equestrian|forerider|flying-squirrel/],
    ['water', /beachcomber|buccaneer|corsair|fisherman|angler|harpooner|lifeboatman|lobster-man|navigator|pirate|sailor|shipwright|waterbearer|whaler|ice-cutter/],
    ['earth', /collier|miner|prospector|quarrier|surveyor|architect|engineer|draftsman|draughtswoman/],
    ['stage', /actress|animator|announcer|ballerina|bard|belletrist|bugler|caricaturist|character-actor|clown|comedy|composer|conductor|dancer|dancing-master|drummer|entertainer|epic-poet|fabulist|fiddler|fifer|fool|guitarist|jester|lutenist|lyricist|mime|minstrel|musician|musicologist|operagoer|organist|painter|performer|pianist|player|playwright|poet|portraitist|prima-donna|rhapsode|scenographer|scenewright|sculptor|singer|skald|songwriter|storyteller|thespian|tragedian|troubadour|trumpeter|virtuoso|artist|illustrator|illuminator|limner|miniaturist|muralist|printmaker|impressionist|realist|aesthete|wordsmith|novelist|memoirist|dramaturge|ghostwriter|aphorist|satirist|epistler|epistolographer|orator|rhetorician|golden-voice/],
    ['shadows', /arsonist|art-thief|assassin|bookie|cardsharp|con-artist|criminal|fixer|gambler|informant|outlaw|poisoner|procuress|pusher|robber|rogue|smuggler|spy|spymaster|thief|traitor|vandal|street-rat|card-player|libertine|seditionist|conspirator/],
    ['roads', /adventurer|courier|errant|explorer|expediter|flaneur|fugitive|guide|messenger|nomad|pioneer|quester|seeker|traveler|vedette|visitor|wanderer|grail-seeker|charioteer/],
    ['margins', /beggar|degenerate|drunkard|lunatic|madrileña|miser|nobody|opium-eater|pauper|prisoner|bystander|witness|egoist|indolence|chatterer|heckler/],
  ];
  private static readonly used: Map<string, string[]> = PaintingConcepts.uses();
  private static uses(): Map<string, string[]> {
    const out = new Map<string, string[]>();
    const table = (occupations as { occupations: Record<string, { painting: string }> }).occupations;
    for (const [id, o] of Object.entries(table)) {
      out.set(o.painting, [...out.get(o.painting) ?? [], id]);
    }
    return out;
  }
  static of(id: string): PaintingConcept {
    const kinds = (backgrounds as unknown as { backgroundKind: { groups: Record<string, string[]> } })
      .backgroundKind.groups;
    const bg = id.replace(/-/g, '_'), family = Object.entries(kinds).find(([, ids]) => ids.includes(bg))?.[0];
    const occupations = this.used.get(id);
    const extra = { ...family ? { backgrounds: [bg] } : {}, ...occupations ? { occupations } : {} };
    if (this.places.includes(id)) { return { kind: 'place', ...extra }; }
    if (this.creatures.includes(id)) { return { kind: 'creature', ...extra }; }
    if (this.events.includes(id)) { return { kind: 'event', ...extra }; }
    if (this.objects.includes(id)) { return { kind: 'object', ...extra }; }
    const worded = family ?? this.families.find(([, re]) => re.test(id))?.[0];
    if (worded) { return { kind: 'person', family: worded, ...extra }; }
    return { kind: 'idea', ...extra };
  }
  private static count(entries: Painting[], f: (p: Painting) => string): Map<string, number> {
    return entries.reduce((m, p) => m.set(f(p), (m.get(f(p)) ?? 0) + 1), new Map<string, number>());
  }
  static report(entries: Painting[]): string {
    const by = this.count.bind(this, entries);
    const none = entries.filter(e => e.source === 'none'), nameless = entries.filter(e => !e.artist);
    const lines = ['# The painting corpus', '', 'Generated by `bun bin/paintings.ts` from the images in `assets/images`, read as images:',
      'their own embedded metadata (JPEG comment, EXIF, IPTC, XMP) parsed into an attribution, and a 320-pixel copy made',
      'for the game in `web/reader/paintings`. The registry is `data/paintings/registry.json`. Do not edit by hand.', '',
      `**${entries.length} paintings**, ${entries.filter(e => e.artist).length} with an artist and `
        + `${entries.filter(e => e.title).length} with a title in their own metadata; `
        + `${Math.round(entries.reduce((s, e) => s + e.bytes, 0) / 1048576)} MB of originals, `
        + `${Math.round(entries.reduce((s, e) => s + e.copyBytes, 0) / 1024)} KiB of copies.`, '',
      '## Where the attribution comes from', '', '| Source | Paintings |', '|---|---:|',
      ...[...by(e => e.source)].sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`), '',
      '## What the concepts are', '', '| Kind | Paintings |', '|---|---:|',
      ...[...by(e => e.concept.kind)].sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`), '',
      '| Family of work | Paintings |', '|---|---:|',
      ...[...by(e => e.concept.family ?? '—')].filter(([k]) => k !== '—').sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `| ${k} | ${n} |`), '',
      '## Missing', '',
      `${none.length} images carry no embedded metadata at all (no comment, EXIF, IPTC or XMP): their artist, title and`
        + ' source are not known from the files, and are not guessed. They are listed so they can be attributed from'
        + ' the collection they came from.', '', none.map(e => e.id).join(', '), '',
      `${nameless.length - none.length} more say something of themselves but name no artist:`, '',
      nameless.filter(e => e.source !== 'none').map(e => e.id).join(', '), ''];
    return `${lines.join('\n')}\n`;
  }
}
