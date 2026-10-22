# Publishing Kyr on GitHub Pages

Kyr's browser reader is published at **https://jweissman.github.io/kyrie/** by the workflow
`.github/workflows/pages.yml`, on every push to `main`. `?world=<seed>` starts a generated world directly.

## What the workflow does

1. Checks out kyrie, and beside it the two packages it is built against: `deem` (`jweissman/deem`, or whatever the
   repository variable `DEEM_REPOSITORY` names) and `languages` (`jweissman/languages`). Both are public, so no
   token is needed.
2. Installs each, runs three quick tests that cover what the site depends on (`play-session`, `save-codec`,
   `frontier`), and builds the site with `bun run web:build` into `site/` (about 7 MB).
3. Uploads `site/` as the Pages artifact and deploys it.

Until 2026-10-22 every run failed at `bun install`: the `languages` package was never checked out, and one of the
tests the workflow named no longer existed. Both are fixed, and the build was also reproduced from fresh clones of
all three repositories. The first successful deploy was of 7c83327.

## Checked on the published site

At iPad size (820×1180, touch, an iPad user agent) on 2026-10-22, against the deploy of 7c83327, and again against
the deploy of 82f62fe:

- the title page is ready in 1.5–1.6 s, and a generated world (`?world=a1`) is drawn and started in 2.2 s;
- the first move takes about a quarter of a second; no page errors;
- after a reload, the title offers to continue where the company was (the game kept in the browser, packed).

This is Chromium with touch emulation, not Safari on an iPad: the gestures, Safari's own storage limits and its
text rendering still want a real device.

## Trying a build on an iPad before it is published

Build the site and serve it on the local network:

```
bun run web:build
bunx serve site            # or: python3 -m http.server --directory site 8080
```

Then open `http://<this machine's address>:<port>/` on the iPad (the reader is the site's index page).
