const { ParseStore } = await import(`${process.env.W ?? process.cwd()}/src/lang/parse-store`);
const t = performance.now(); ParseStore.open(); console.log(`ParseStore.open ${Math.round(performance.now() - t)} ms`);
