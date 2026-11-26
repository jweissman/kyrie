// Which commit of Westernesse this page was built from (SiteBuild.reader writes it in): said quietly on the title page,
// so whoever plays knows which version they are playing (the owner, 10 November: one app, one URL, its commit shown).
// dev: a dev build (an author's preview, built unminified: SiteBuild.reader), where the oracle is shown (OR-1151).
declare const KYRIE_COMMIT: string | undefined;
declare const KYRIE_DEV: boolean | undefined;
export class Build {
  static readonly commit: string = typeof KYRIE_COMMIT === 'string' ? KYRIE_COMMIT : 'dev';
  static readonly dev: boolean = typeof KYRIE_DEV === 'boolean' ? KYRIE_DEV : Build.commit === 'dev';
}
