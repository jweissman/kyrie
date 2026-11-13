((who) => { const m = window.kyrieMono.inspect().menu; if (!m) return 'nomenu'; return String(m.findIndex(x => x.label === who || x.label.endsWith(who)) + 1); })
