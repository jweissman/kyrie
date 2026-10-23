import type { PaintingConcept } from './painting-concepts';

// What a JPEG says of itself: its size, and whatever its makers wrote into it (a comment, EXIF, IPTC, XMP).
export interface RawMetadata {
  width: number; height: number; comment?: string;
  exif: { description?: string; artist?: string; copyright?: string; datetime?: string };
  iptc: { caption?: string; byline?: string; title?: string; copyright?: string };
  xmp: { title?: string; creator?: string; rights?: string; description?: string };
}
type Attribution = Pick<Painting, 'artist' | 'life' | 'title' | 'date' | 'medium' | 'collection' | 'url' | 'credit' | 'source'>;
// One painting of the registry, as the game knows it.
export interface Painting {
  id: string; file: string; bytes: number; sha1: string; width: number; height: number;
  artist?: string; life?: string; title?: string; date?: string; medium?: string; collection?: string; url?: string;
  credit?: string; source: 'wga-comment' | 'artuk-exif' | 'exif' | 'iptc' | 'xmp' | 'none';
  copy: string; copyBytes: number; concept: PaintingConcept;
  // The copy large enough to be looked at (in conversation), and what the painting shows (data/paintings/seen.json).
  large: string; largeBytes: number; seen: Seen;
}
// What a painting shows, recorded by looking at it: its form; for a portrait, the sitter as seen; the era of its
// manner; where the face sits, as a percentage of the height; a few words of what it shows.
export interface Seen {
  form: 'portrait' | 'group' | 'scene' | 'landscape' | 'interior' | 'object' | 'animal'; shows: string;
  era: 'early' | 'late' | 'modern'; sex?: 'man' | 'woman' | 'mixed'; age?: 'child' | 'young' | 'adult' | 'old';
  station?: 'labouring' | 'middling' | 'high' | 'religious' | 'martial' | 'learned' | 'artist' | 'player';
  face?: number;
}

// Reads a JPEG's own metadata, segment by segment, and makes what it says into an attribution: the Web Gallery of Art
// writes the artist, their life, the title, date, medium and collection into the comment; Art UK writes "artist;
// title; collection; url" into EXIF and IPTC; others write a caption and a credit.
export class PaintingMetadata {
  static read(b: Uint8Array): RawMetadata {
    const out: RawMetadata = { width: 0, height: 0, exif: {}, iptc: {}, xmp: {} };
    let i = 2;
    while (i + 4 < b.length && b[i] === 0xff) {
      const m = b[i + 1]!;
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const len = (b[i + 2]! << 8) | b[i + 3]!, data = b.subarray(i + 4, i + 2 + len);
      if (m >= 0xc0 && m <= 0xc3) { out.height = (data[1]! << 8) | data[2]!; out.width = (data[3]! << 8) | data[4]!; }
      if (m === 0xfe) { this.comment(out, this.text(data)); }
      if (m === 0xe1 && this.starts(data, 'Exif')) { out.exif = this.exif(data.subarray(6)); }
      if (m === 0xe1 && this.starts(data, 'http://ns.adobe.com/xap')) { out.xmp = this.xmp(this.text(data)); }
      if (m === 0xed) { out.iptc = this.iptc(data); }
      if (m === 0xda) { break; }
      i += 2 + len;
    }
    return out;
  }
  // A comment that is a painting's account, not a program's stamp.
  private static comment(out: RawMetadata, text: string) {
    if (!/^(Created by|LEAD Technologies|CREATOR:|Optimized)/.test(text)) { out.comment = text; }
  }
  private static starts(d: Uint8Array, s: string): boolean { return [...s].every((c, k) => d[k] === c.charCodeAt(0)); }
  private static text(d: Uint8Array): string {
    const utf = new TextDecoder('utf-8', { fatal: false }).decode(d);
    return (utf.includes('�') ? new TextDecoder('latin1').decode(d) : utf).replace(/\0+$/, '').trim();
  }
  // The first directory of a TIFF block: the tags that name a picture (description, artist, copyright, date).
  private static exif(t: Uint8Array): RawMetadata['exif'] {
    const le = t[0] === 0x49, ifd = this.u32(t, 4, le), n = this.u16(t, ifd, le), tags: Record<number, string> = {};
    for (let k = 0; k < n && ifd + 2 + k * 12 + 12 <= t.length; k++) {
      const at = ifd + 2 + k * 12, tag = this.u16(t, at, le), type = this.u16(t, at + 2, le);
      const count = this.u32(t, at + 4, le);
      if (type !== 2) { continue; }
      const off = count <= 4 ? at + 8 : this.u32(t, at + 8, le);
      tags[tag] = this.text(t.subarray(off, off + count));
    }
    return { ...tags[0x010e] ? { description: tags[0x010e] } : {}, ...tags[0x013b] ? { artist: tags[0x013b] } : {},
      ...tags[0x8298] ? { copyright: tags[0x8298] } : {}, ...tags[0x0132] ? { datetime: tags[0x0132] } : {} };
  }
  private static u16(t: Uint8Array, o: number, le: boolean): number {
    return le ? t[o]! | (t[o + 1]! << 8) : (t[o]! << 8) | t[o + 1]!;
  }
  private static u32(t: Uint8Array, o: number, le: boolean): number {
    return (le ? (t[o]! | (t[o + 1]! << 8) | (t[o + 2]! << 16) | (t[o + 3]! << 24))
      : ((t[o]! << 24) | (t[o + 1]! << 16) | (t[o + 2]! << 8) | t[o + 3]!)) >>> 0;
  }
  private static xmp(x: string): RawMetadata['xmp'] {
    const out: RawMetadata['xmp'] = {};
    for (const name of ['title', 'creator', 'rights', 'description'] as const) {
      const v = new RegExp(`<dc:${name}>[\\s\\S]*?<rdf:li[^>]*>([\\s\\S]*?)</rdf:li>`).exec(x)?.[1]?.replace(/&amp;/g, '&').trim();
      if (v && v !== 'x-default') { out[name] = v; }
    }
    const web = /<xmpRights:WebStatement>([^<]+)</.exec(x)?.[1]?.trim();
    if (web && !out.rights) { out.rights = web; }
    return out;
  }
  // IPTC records in Photoshop's resource block: caption (2:120), by-line (2:80), object name (2:05), rights (2:116).
  private static iptc(d: Uint8Array): RawMetadata['iptc'] {
    const out: RawMetadata['iptc'] = {}, names: Record<number, keyof RawMetadata['iptc']> = { 120: 'caption', 80: 'byline',
      5: 'title', 116: 'copyright' };
    for (let k = 0; k + 5 < d.length; k++) {
      if (d[k] !== 0x1c || d[k + 1] !== 0x02) { continue; }
      const tag = d[k + 2]!, len = (d[k + 3]! << 8) | d[k + 4]!, name = names[tag];
      if (name && k + 5 + len <= d.length) { out[name] = this.text(d.subarray(k + 5, k + 5 + len)); }
      k += 4 + len;
    }
    return out;
  }
  // An attribution from whatever the picture says, the fullest account first; an institution or a photographer named
  // where the artist would be is the image's credit, not its artist, and a catalogue number is not a title.
  static describe(m: RawMetadata): Attribution {
    const a = this.attribute(m), out: Attribution = { ...a };
    if (a.artist && /museum|museo|gallery|collection|bpk|\.[a-z]{2,3}$|^\d|descouens|wikimedia|photo/i.test(a.artist)) {
      delete out.artist; out.credit = [a.credit, `image: ${a.artist}`].filter(Boolean).join('; ');
    }
    if (a.title && /^https?:/.test(a.title)) { delete out.title; out.url ??= a.title; }
    else if (a.title && (/^[\d .:/-]+$/.test(a.title) || /^[A-Z]{2,}[ .]*[\d.]+$/.test(a.title)
      || !/\p{L}{2}/u.test(a.title) || /^File_\d+/.test(a.title) || a.title.length < 4)) {
      delete out.title;
    }
    return out;
  }
  private static attribute(m: RawMetadata): Attribution {
    if (m.comment && /^[A-ZÀ-Þ' -]+, /.test(m.comment)) { return this.wga(m.comment); }
    const artuk = [m.exif.description, m.iptc.caption].find(s => s && /artuk\.org/.test(s));
    if (artuk) {
      const [artist, title, collection, url] = artuk.split(';').map(s => s.trim());
      return { source: 'artuk-exif', ...artist ? { artist } : {}, ...title ? { title } : {},
        ...collection ? { collection } : {}, ...url ? { url } : {},
        ...m.exif.copyright ?? m.iptc.copyright ? { credit: m.exif.copyright ?? m.iptc.copyright } : {} };
    }
    const caption = m.exif.description ?? m.iptc.caption ?? m.xmp.description;
    const title = m.xmp.title ?? m.iptc.title ?? caption?.split(/\n|\. /)[0]?.replace(/^\*/, '').trim();
    const artist = m.exif.artist && !/bpk|\//.test(m.exif.artist) ? m.exif.artist : m.xmp.creator ?? m.iptc.byline;
    const credit = m.exif.copyright ?? m.xmp.rights ?? m.iptc.copyright;
    const source = m.exif.description || m.exif.artist ? 'exif' : m.iptc.caption || m.iptc.byline || m.iptc.title ? 'iptc'
      : m.xmp.title || m.xmp.creator ? 'xmp' : 'none';
    return { source, ...artist ? { artist } : {}, ...title ? { title } : {}, ...credit ? { credit } : {} };
  }
  // "VAN DYCK" is "Van Dyck"; "TENIERS" is "Teniers".
  private static titled(name: string): string {
    return name.toLowerCase().replace(/(^|[ \-'])(\p{L})/gu, (_, a: string, c: string) => a + c.toUpperCase());
  }
  // The Web Gallery of Art's comment: ARTIST, Name / (b. …, d. …) / / Title / date / medium / collection, city.
  private static wga(comment: string): Attribution {
    const lines = comment.split(/\r?\n/).map(l => l.trim());
    const [surname, given] = lines[0]!.split(', ');
    const artist = given ? `${given} ${this.titled(surname!)}` : lines[0]!;
    const rest = lines.slice(1).filter(Boolean), life = rest[0]?.startsWith('(') ? rest.shift()!.replace(/[()]/g, '') : undefined;
    const [title, date, medium, collection] = rest;
    return { source: 'wga-comment', artist, ...life ? { life } : {}, ...title ? { title } : {},
      ...date && /\d/.test(date) ? { date } : {}, ...medium ? { medium } : {}, ...collection && !collection.startsWith('---') ? { collection } : {} };
  }
}
