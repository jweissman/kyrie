// The studio's mark, once a session before the title: a horizon drawn from the middle outward, seven towers rising
// from it in light (the City of Seven Towers), a star over the tallest; then it goes out. It carries no name yet: the
// owner's to give.
export class Ident {
  static readonly towers = [0.46, 0.66, 0.82, 1, 0.78, 0.6, 0.42];
  static View() {
    const w = 168, base = 112, gap = w / (Ident.towers.length + 1);
    return (
      <div className="ident" role="presentation">
        <svg viewBox={`0 0 ${w} 140`} aria-hidden="true" focusable="false">
          <line className="ground" x1={8} x2={w - 8} y1={base} y2={base} />
          {Ident.towers.map((h, i) => {
            const x = gap * (i + 1), top = base - h * 78;
            return <line key={i} className="tower" x1={x} x2={x} y1={base} y2={top}
              style={{ animationDelay: `${420 + Math.abs(i - 3) * 110}ms` }} />;
          })}
          <path className="star" d={`M${w / 2} 2 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 l9 -3 z`} />
        </svg>
      </div>
    );
  }
}
