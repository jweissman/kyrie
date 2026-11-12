(() => {
  const W = innerWidth, H = innerHeight, m = 16, out = [];
  const els = document.querySelectorAll('button, a[href], [role="button"], input, select, .portrait, .focus p, .focus h1, .focus h2, .world-bar h1, .when, .led li');
  for (const e of els) {
    const r = e.getBoundingClientRect(), st = getComputedStyle(e);
    if (!r.width || !r.height || st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0) continue;
    if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    const near = [r.left < m && 'left ' + Math.round(r.left), r.top < m && 'top ' + Math.round(r.top), W - r.right < m && 'right ' + Math.round(W - r.right), H - r.bottom < m && 'bottom ' + Math.round(H - r.bottom)].filter(Boolean);
    if (near.length) out.push(`${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)} "${(e.innerText || e.getAttribute('aria-label') || '').slice(0, 30).replace(/\n/g, ' ')}" ${near.join(', ')}`);
  }
  return out.length ? out : ['all inside'];
})()
