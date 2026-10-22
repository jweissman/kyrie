// A game kept in the browser, packed small: gzip, then base64, marked so a packed save can be told from a plain one
// (a save file taken elsewhere is plain JSON, and opens all the same). Where the browser cannot compress, it is kept
// plain.
export class SaveCodec {
  static readonly mark = 'gz1:';
  static async pack(text: string): Promise<string> {
    if (typeof CompressionStream === 'undefined') { return text; }
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    return this.mark + this.base64(new Uint8Array(await new Response(stream).arrayBuffer()));
  }
  static async unpack(text: string): Promise<string> {
    if (!text.startsWith(this.mark)) { return text; }
    const stream = new Blob([this.bytes(text.slice(this.mark.length))]).stream()
      .pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }
  private static base64(bytes: Uint8Array): string {
    let text = '';
    for (let i = 0; i < bytes.length; i += 0x8000) { text += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); }
    return btoa(text);
  }
  private static bytes(base64: string): Uint8Array<ArrayBuffer> {
    const text = atob(base64), bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) { bytes[i] = text.charCodeAt(i); }
    return bytes;
  }
}
