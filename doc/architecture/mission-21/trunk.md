# Back to trunk (15 November, late)

Branches had become the unit of fear: a `ci/lead-NN` for every batch, a full run before main, the owner's checkout kept
current by hand. With the loop cheap (the gate is about 30 s; a push runs the push lane in about 9 minutes; the whole
suite is nightly and on demand in about 30), the branch is no longer needed to protect main from slowness, only from
risk. The rules, as practised from today:

1. **Main is the trunk.** A change that is small, gated locally (`bun run check:fast`, alone, exit read) and does not
   touch the page's behaviour or a generated world's content goes straight to main, as a small commit.
2. **A branch only for risk.** A change that can break a browser spec, a kept trace or the generated country goes on a
   short-lived `ci/<n>`, gets one full run (`gh workflow run ci.yml --ref ci/<n>`), and is merged fast-forward (or a plain
   merge) the same day. No branch lives overnight.
3. **A branch is deleted when merged.** Abandoned work is archived as a tag (`archive/<name>`) and its branch deleted:
   nothing is lost and nothing lingers. (Done today: sixteen branches, among them the unlanded SRD spell layer.)
4. **The owner's checkout is only fast-forwarded** (`git -C … merge --no-edit origin/main`); their local commits and
   untracked reviews are theirs.
5. **Landing is gate, push, sync, delete**, in the landing worktree (`/var/tmp/kyrie/wt-land`), one job at a time.
6. **Main stays green for the owner's play.** A failure on main is the next thing done, before anything new.

What the CI run is for: the push lane catches the fast breakage after the fact; the full run before merge is the
confidence for risky changes. If the push lane begins to catch what only a full run caught before (a browser spec broken
by a presentation change), that change should have been a branch.
