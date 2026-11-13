(() => {
  const s = window.kyrieMono.inspect(), c = s.combat;
  if (s.mode !== 'combat' || !c || c.outcome) return 'done';
  if (s.pending || !c.ours) return 'wait';
  const rows = s.rows.map(r => r.label);
  const foe = c.foes.filter(f => !f.down).sort((a, b) => a.hp - b.hp)[0];
  const hurt = c.allies.filter(a => !a.down).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  const dori = c.allies.find(a => a.name === 'Dori');
  let ability = 'Melee Attack', who = foe?.name;
  if (c.actorName === 'Dori' && hurt.hp / hurt.maxHp < 0.5) { ability = (dori.slots?.[0] ?? 0) > 0 ? 'Cure Light Wounds' : 'Cure Minor Wounds'; who = hurt.name; }
  else if (c.actorName === 'Bran' && rows.includes('Charge')) { ability = 'Charge'; }
  return [rows.indexOf(ability) + 1, who, `${c.actorName}: ${ability} -> ${who}`].join('|');
})()
