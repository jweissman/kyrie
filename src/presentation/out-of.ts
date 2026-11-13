// A way off a road told by how far out of a town it leaves it, to a stretch named for that town too, names the town
// once: "Take the road, half an hour out, to open fields south of Rainhaven", where it had been "… half an hour out of
// Rainhaven to open fields south of Rainhaven" (M21's way labels); on the page, "To open fields south of Rainhaven by
// the road, half an hour out".
export class OutOf {
  static once(label: string): string {
    const m = /, ([^,]+?) out of ([A-Z][^,]*?)( to |$)/.exec(label);
    if (!m || label.split(m[2]!).length < 3) { return label; }
    return label.replace(m[0], `, ${m[1]} out${m[3] === ' to ' ? ', to ' : ''}`);
  }
}
