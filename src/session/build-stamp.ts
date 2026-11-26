// Which build of the engine this is: a hash of the built engine itself, code and data together, written in when the
// site is built (SiteBuild.engine); "dev" wherever the engine runs unbuilt (tests, a script). A game is kept with the
// stamp of the build that kept it, and only one kept by this very build is trusted unchecked (the architecture review
// of 26 October, N2: Pages deploys every push, and a game kept last week was loaded unchecked under this week's).
// The commit it was built from is written in after the stamp is taken (SiteBuild.engine), so that a commit that changes
// nothing of the engine leaves its stamp as it was; said by the oracle (OR-1151), "dev" unbuilt.
declare const KYRIE_BUILD: string | undefined;
declare const KYRIE_ENGINE_COMMIT: string | undefined;
export class BuildStamp {
  static readonly placeholder = '__KYRIE_BUILD_STAMP__';
  static readonly committed = '__KYRIE_ENGINE_COMMIT__';
  static readonly current: string = typeof KYRIE_BUILD === 'string' ? KYRIE_BUILD : 'dev';
  static readonly commit: string = typeof KYRIE_ENGINE_COMMIT === 'string' ? KYRIE_ENGINE_COMMIT : 'dev';
  static get about(): { commit: string; stamp: string } { return { commit: this.commit, stamp: this.current }; }
}
