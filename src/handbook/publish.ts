import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Handbooks } from './handbooks';
import { HandbookHtml } from './render-html';
import { HandbookMarkdown } from './render-md';
import { CapabilityAudit } from './audit';

// Writes the books: HTML pages and coverage.json for the site, Markdown and coverage.json for the repository.
export class HandbookPublisher {
  static async html(handbooks: Handbooks, out: string) {
    await mkdir(out, { recursive: true });
    const html = new HandbookHtml(handbooks.index(), handbooks.books), coverage = handbooks.coverage();
    html.audit = CapabilityAudit.read(handbooks.root);
    for (const b of handbooks.books) { await writeFile(join(out, `${b.id}.html`), html.book(b)); }
    await writeFile(join(out, 'index.html'), html.landing(coverage));
    await writeFile(join(out, 'coverage.json'), `${JSON.stringify(coverage)}\n`);
  }
  static async markdown(handbooks: Handbooks, out: string) {
    await mkdir(out, { recursive: true });
    for (const b of handbooks.books) { await writeFile(join(out, `${b.id}.md`), `${HandbookMarkdown.book(b)}\n`); }
    const coverage = handbooks.coverage();
    await writeFile(join(out, 'README.md'), HandbookMarkdown.coverage(coverage));
    await writeFile(join(out, 'coverage.json'), `${JSON.stringify(coverage, null, 1)}\n`);
    await writeFile(join(handbooks.root, 'doc/architecture/capability-audit.md'),
      CapabilityAudit.markdown(CapabilityAudit.read(handbooks.root), coverage));
  }
}
