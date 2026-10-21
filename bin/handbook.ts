#!/usr/bin/env bun
// Builds the Player's Handbook, Dungeon Master's Guide and Monster Manual from the game's definitions:
// Markdown and coverage.json into doc/handbook, and (with --html <dir>) the site pages.
import { resolve } from 'node:path';
import { Handbooks } from '../src/handbook/handbooks';
import { HandbookPublisher } from '../src/handbook/publish';

const root = resolve(import.meta.dir, '..');
const handbooks = new Handbooks(root);
await HandbookPublisher.markdown(handbooks, resolve(root, 'doc/handbook'));
const at = process.argv.indexOf('--html');
if (at > 0) { await HandbookPublisher.html(handbooks, resolve(process.argv[at + 1] ?? 'site/handbook')); }
const coverage = handbooks.coverage();
console.log(`${coverage.entries.length} entries; ${coverage.problems.length} problems`);
