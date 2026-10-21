// The handbooks' look: the game's own inks and faces (a book face for what is read, a terminal face for what is
// operated), set as a reference to be searched rather than a frame to be played in.
export class HandbookStyle {
  static readonly css = `
:root { --bg: #110f0c; --sheet: #16130f; --sheet-2: #1c1914; --well: #0c0b09; --rule: #2a251e; --rule-2: #3b352b;
  --ink: #ede5d3; --ink-2: #cfc6b2; --dim: #9d9481; --faint: #6c6456; --amber: #e9b45c; --teal: #86c6b3; --rose: #e2806c;
  --gold: #e8c87f; --violet: #aaa3e3; --green: #a3d283; --blue: #8fb3ee;
  --prose: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Charter, "Source Serif 4", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", "Cascadia Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  color-scheme: dark; }
* { box-sizing: border-box; }
html { font-size: clamp(14px, 0.32vw + 10.4px, 17px); scroll-padding-top: 4rem; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 400 0.92rem/1.5 var(--mono); -webkit-font-smoothing: antialiased; }
a { color: var(--amber); text-decoration: none; } a:hover { text-decoration: underline; }
h1, h2, h3, h4 { font-family: var(--prose); font-weight: 600; margin: 0; }
.bar { position: sticky; top: 0; z-index: 3; display: flex; align-items: baseline; gap: 2ch; padding: 0.6rem 1rem;
  background: var(--well); border-bottom: 1px solid var(--rule); overflow-x: auto; white-space: nowrap; }
.brand { color: var(--amber); text-transform: uppercase; letter-spacing: 0.24em; font-weight: 600; }
.books { display: flex; gap: 0.4ch; }
.books a { color: var(--dim); padding: 0.2em 1ch; border: 1px solid transparent; border-radius: 3px; font-size: 0.85rem; }
.books a[aria-current] { color: var(--ink); border-color: var(--rule-2); background: var(--sheet); }
.layout { display: grid; grid-template-columns: 19rem minmax(0, 1fr); }
.toc { position: sticky; top: 2.9rem; align-self: start; max-height: calc(100vh - 2.9rem); overflow-y: auto; padding: 1rem;
  border-right: 1px solid var(--rule); background: var(--sheet); font-size: 0.82rem; }
.toc input[type=search] { width: 100%; padding: 0.5em 0.8ch; background: var(--well); color: var(--ink);
  border: 1px solid var(--rule-2); border-radius: 3px; font: inherit; }
.chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.7rem 0; }
.chip { display: inline-flex; gap: 0.5ch; align-items: center; padding: 0.1em 0.8ch; border-radius: 999px;
  border: 1px solid currentColor; cursor: pointer; font-size: 0.75rem; }
.chip input { margin: 0; accent-color: currentColor; }
.toc summary { color: var(--dim); cursor: pointer; margin: 0.4rem 0; }
.toc ol { list-style: none; margin: 0; padding: 0 0 0 1ch; } .toc li { margin: 0.15rem 0; }
.toc > details > nav > ol { padding: 0; } .toc a { color: var(--ink-2); }
main { padding: 1.4rem clamp(1rem, 3vw, 3rem) 4rem; max-width: 76rem; }
main h1 { font-size: 2.4rem; font-variant-caps: small-caps; letter-spacing: 0.015em; margin-bottom: 0.8rem; }
.lede, .intro { font: 400 1.08rem/1.6 var(--prose); color: var(--ink-2); max-width: 70ch; margin: 0 0 0.8rem; }
.sec { margin-top: 2rem; } .sec .sec { margin-top: 1.4rem; }
.sec h2 { font-size: 1.8rem; color: var(--gold); border-bottom: 1px solid var(--rule); padding-bottom: 0.3rem; margin-bottom: 0.8rem; }
.sec h3 { font-size: 1.35rem; color: var(--ink); margin-bottom: 0.5rem; } .sec h4 { font-size: 1.1rem; }
.entry { border: 1px solid var(--rule); border-left: 3px solid var(--rule-2); background: var(--sheet); border-radius: 3px;
  padding: 0.75rem 1rem; margin: 0.6rem 0; max-width: 70rem; }
.entry:target { border-color: var(--amber); }
.entry header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.6ch 1.2ch; margin-bottom: 0.35rem; }
.entry h4 a { color: var(--ink); } .kind { color: var(--dim); font-size: 0.8rem; }
.entry dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 0.1rem 2ch; margin: 0.4rem 0; font-size: 0.85rem; }
.entry dt { color: var(--dim); } .entry dd { margin: 0; color: var(--ink-2); }
.rule { margin: 0.3rem 0; color: var(--ink); } .desc { font: italic 400 1rem/1.5 var(--prose); color: var(--ink-2); margin: 0.3rem 0; }
.note { color: var(--teal); font-size: 0.82rem; margin: 0.25rem 0; } .note.bad { color: var(--rose); } .refs { color: var(--dim); font-size: 0.82rem; margin: 0.3rem 0 0; }
.eid { display: block; color: var(--faint); font-size: 0.72rem; margin-top: 0.3rem; }
.badge { font-size: 0.7rem; padding: 0.05em 0.8ch; border-radius: 999px; border: 1px solid currentColor; }
.s-faithful { color: var(--green); } .s-adapted { color: var(--teal); } .s-represented { color: var(--blue); }
.s-kyr { color: var(--gold); } .s-unsupported { color: var(--rose); } .s-unreachable { color: var(--violet); }
.s-data-only { color: var(--faint); }
.scroll { overflow-x: auto; margin: 0.6rem 0; }
table { border-collapse: collapse; font-size: 0.82rem; min-width: 30rem; }
th { text-align: left; color: var(--dim); font-weight: 500; border-bottom: 1px solid var(--rule-2); padding: 0.3rem 1.4ch 0.3rem 0; }
td { border-bottom: 1px solid var(--rule); padding: 0.3rem 1.4ch 0.3rem 0; vertical-align: top; color: var(--ink-2); }
tr[data-status] td:last-child { white-space: nowrap; }
tr[data-status=data-only] td { color: var(--faint); } tr[data-status=unsupported] td:last-child { color: var(--rose); }
tr:target td { background: var(--sheet-2); }
.landing { margin: 0 auto; } .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 1rem; margin: 1.4rem 0; }
.card { display: block; padding: 1rem 1.2rem; border: 1px solid var(--rule-2); border-radius: 4px; background: var(--sheet); color: var(--ink-2); }
.card:hover { border-color: var(--amber); text-decoration: none; } .card h2 { color: var(--ink); font-size: 1.5rem; margin-bottom: 0.4rem; }
.card p { margin: 0.4rem 0; font: 0.95rem/1.5 var(--prose); } .card .count { font: 0.75rem/1.4 var(--mono); color: var(--dim); }
.bar-chart { display: flex; height: 0.5rem; border-radius: 2px; overflow: hidden; background: var(--rule); }
.bar-chart span { background: currentColor; }
#nothing { color: var(--dim); }
.family { border: 1px solid var(--rule); background: var(--sheet); border-radius: 3px; margin: 0.4rem 0; padding: 0.5rem 0.9rem; }
.family summary { display: grid; grid-template-columns: minmax(12rem, 22rem) minmax(6rem, 1fr) minmax(0, 2fr); gap: 1.5ch;
  align-items: center; cursor: pointer; } .family summary b { font: 600 1rem var(--prose); color: var(--ink); }
.family .count { color: var(--dim); font-size: 0.78rem; }
.family dl { display: grid; grid-template-columns: 16rem minmax(0, 1fr); gap: 0.35rem 2ch; margin: 0.7rem 0 0.3rem; }
.family dt { color: var(--dim); } .family dd { margin: 0; font: 0.98rem/1.5 var(--prose); color: var(--ink-2); }
@media (max-width: 900px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .toc { position: static; max-height: none; border-right: 0; border-bottom: 1px solid var(--rule); }
  main h1 { font-size: 1.9rem; } .entry dl, .family dl { grid-template-columns: minmax(0, 1fr); }
  .entry dd, .family dd { margin-bottom: 0.2rem; } .family summary { grid-template-columns: minmax(0, 1fr); }
}`;
  // Search and status filters. Each item's text is read once; a section with nothing left to show is hidden.
  static readonly script = `(function () {
  var find = document.getElementById('find'); if (!find) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.item'));
  var text = items.map(function (el) { return el.textContent.toLowerCase(); });
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.sec')).reverse();
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.chips input'));
  var contents = document.querySelector('.toc details');
  if (contents && window.matchMedia('(max-width: 900px)').matches) contents.open = false;
  function apply() {
    var q = find.value.trim().toLowerCase(), on = {}, all = true;
    boxes.forEach(function (b) { on[b.value] = b.checked; if (!b.checked) all = false; });
    var shown = 0;
    items.forEach(function (el, i) {
      var s = el.getAttribute('data-status');
      var v = (!s || on[s]) && (!q || text[i].indexOf(q) >= 0);
      el.hidden = !v; if (v) shown++;
    });
    sections.forEach(function (sec) {
      if (!q && all) { sec.hidden = false; return; }
      sec.hidden = !sec.querySelector('.item:not([hidden])');
    });
    document.getElementById('nothing').hidden = shown > 0;
  }
  var timer; find.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 120); });
  boxes.forEach(function (b) { b.addEventListener('change', apply); });
  var q = new URLSearchParams(location.search).get('q'); if (q) { find.value = q; apply(); }
})();`;
}
