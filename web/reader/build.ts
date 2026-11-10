// Which commit of Westernesse this page was built from (SiteBuild.reader writes it in): said quietly on the title page,
// so whoever plays knows which version they are playing (the owner, 10 November: one app, one URL, its commit shown).
declare const KYRIE_COMMIT: string | undefined;
export class Build {
  static readonly commit: string = typeof KYRIE_COMMIT === 'string' ? KYRIE_COMMIT : 'dev';
}
