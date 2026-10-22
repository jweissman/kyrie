# Publishing Kyr on GitHub Pages

The workflow `.github/workflows/pages.yml` builds the browser reader and deploys it to GitHub Pages on every push to
`main`. As of 2026-10-22 the build half works end to end; the deploy half cannot, for a reason only the repository's
owner can change.

## What the workflow does

1. Checks out kyrie, and beside it the two packages it is built against: `deem` (`jweissman/deem`, or whatever the
   repository variable `DEEM_REPOSITORY` names) and `languages` (`jweissman/languages`). Both are public, so no
   token is needed.
2. Installs each, runs three quick tests that cover what the site depends on (`play-session`, `save-codec`,
   `frontier`), and builds the site with `bun run web:build` into `site/` (about 7 MB).
3. Uploads `site/` as the Pages artifact and deploys it.

The build was reproduced in a clean directory with fresh clones of all three repositories: the tests pass (11) and
the site builds.

## Why it is not published

- **Pages is not enabled for the repository.** `gh api repos/jweissman/kyrie/pages` answers 404.
- **The repository is private.** GitHub Pages for a private repository needs a paid plan (Pro, Team or Enterprise).

Until one of those changes, the deploy job fails after a successful build.

Earlier runs failed sooner, for reasons now fixed in the workflow: `languages` was never checked out (the build
stopped at `bun install`), and one of the tests the workflow named no longer exists.

## What the owner can do

Either:

- make the repository public, or move it to a plan that allows Pages for private repositories; and then
- in **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**; and
- re-run the **Pages** workflow (it has a manual trigger), or push to `main`.

Optionally, set the repository variable `DEEM_REPOSITORY` to build against a fork of DEEM.

## Trying it on an iPad meanwhile

Build the site and serve it on the local network:

```
bun run web:build
bunx serve site            # or: python3 -m http.server --directory site 8080
```

Then open `http://<this machine's address>:<port>/` on the iPad (the reader is the site's index page).
`?world=<seed>` starts a generated world directly. A game in progress is kept in the browser (packed, see `web/engine/save-codec.ts`) and continues after a
reload.
