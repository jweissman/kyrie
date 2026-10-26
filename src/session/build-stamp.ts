// Which build of the engine this is: a hash of the built engine itself, code and data together, written in when the
// site is built (SiteBuild.engine); "dev" wherever the engine runs unbuilt (tests, a script). A game is kept with the
// stamp of the build that kept it, and only one kept by this very build is trusted unchecked (the architecture review
// of 26 October, N2: Pages deploys every push, and a game kept last week was loaded unchecked under this week's).
declare const KYRIE_BUILD: string | undefined;
export class BuildStamp {
  static readonly placeholder = '__KYRIE_BUILD_STAMP__';
  static readonly current: string = typeof KYRIE_BUILD === 'string' ? KYRIE_BUILD : 'dev';
}
