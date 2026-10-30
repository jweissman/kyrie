// The page's engine script, as the tests that read the page's own modules (ReaderOpening) see it: built separately and
// handed to the page as text (see web/reader/engine-source.d.ts, which the page's own typecheck reads).
declare module 'kyrie:engine' {
  const source: string;
  export default source;
}
