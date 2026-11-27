export async function noColor<T>(run: () => Promise<T>): Promise<T> {
  const before = process.env.NO_COLOR;
  process.env.NO_COLOR = '1';
  try { return await run(); } finally {
    if (before === undefined) { delete process.env.NO_COLOR; } else { process.env.NO_COLOR = before; }
  }
}