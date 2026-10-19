import { Battle, aggressive, batch, createArena, simulate } from '../src/arena';

const [mode = 'auto', seed = 'arena', count = '1000'] = process.argv.slice(2);
if (mode === 'batch') {
  console.log(JSON.stringify(batch(Number(count), seed), null, 2));
} else if (mode === 'auto') {
  const result = simulate(createArena(seed), seed);
  for (const event of result.events) {console.log(JSON.stringify(event));}
  console.table(result.state.combatants.map(({ name, hp, maxHp }) => ({ name, hp, maxHp })));
} else if (mode === 'play') {
  const battle = new Battle(createArena(seed), seed);
  const { createInterface } = await import('node:readline/promises');
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (!battle.state.outcome) {
      const state = battle.state;
      const legal = battle.legalCommands();
      const actor = state.combatants.find(f => f.id === state.actor)!;
      let command;
      if (actor.team === 'fighters') {
        console.table(state.combatants.map(({ id, hp, maxHp, guarding }) => ({ id, hp, maxHp, guarding })));
        console.log(`Turn ${state.turn}: ${actor.name}`);
        legal.forEach((c, i) => console.log(`${i + 1}. ${c.ability} → ${c.target}`));
        const answer = await input.question('Action number (q to quit): ');
        if (answer === 'q') {break;}
        const index = Number(answer) - 1;
        command = Number.isInteger(index) ? legal[index] : undefined;
        if (!command) { console.log('Choose a listed action.'); continue; }
      } else {command = aggressive(state, legal);}
      for (const event of battle.step(command)) {console.log(JSON.stringify(event));}
    }
  } finally { input.close(); }
} else {
  throw new Error('Usage: bun run arena [auto|play|batch] [seed] [count]');
}
