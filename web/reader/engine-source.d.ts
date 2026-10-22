// The engine's worker script, built separately and handed to the page as text (see bin/site-build.ts), so it runs
// in a worker even from file://.
declare module 'kyrie:engine' {
  const source: string;
  export default source;
}
