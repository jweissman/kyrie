// A row's id is the path of its keys from its subject (company/0:Read the notice on the well-post, region__rats/0:
// Attack), each key its label and, before it, how many of its siblings carry the same label before it: 0 for the first,
// and more only on a real collision (two acts said alike). A row's position among its siblings is no part of it (the
// integration's CI, 20 November: the notice's row had been company/1, then company/4 once the waits were each a row
// of their own, and a capture or a spec replayed by id broke on a sibling added; MT-15: replays by meaning).
export class ChoiceIds {
  // The key of a new sibling under that label, among those already there.
  static key(siblings: readonly { label: string }[], label: string): string {
    return `${siblings.filter(s => s.label === label).length}:${label}`;
  }
  // An id read without its numbers: what an id kept by position before (company/4:Read …) and its stable form
  // (company/0:Read …) both say.
  static bare(id: string): string { return id.replace(/(^|\/)\d+:/g, '$1'); }
  // The one of these ids an id kept by an older build names: itself, else the only one alike to it but for the
  // numbers; none where it is not there or two are.
  static resolve(id: string, ids: readonly string[]): string | undefined {
    if (ids.includes(id)) { return id; }
    const bare = this.bare(id), alike = ids.filter(x => this.bare(x) === bare);
    return alike.length === 1 ? alike[0] : undefined;
  }
}
