# Westernesse: the register's archive

**What belongs here (the owner, 20 November: "We could also archive out old items once they're verified or have a
proof spec").** Closed rows of doc/architecture/open-register.md, moved out of its way once their closure holds:
the status cites a spec that exists, the closure lint (`bun scripts/closure-lint.ts`, MT-17) finds nothing on the
row, and the status names a second reading (verified, the tribunal's, a second reader's) or the closure is older
than fourteen days. `bun scripts/register-archive.ts` says which rows qualify and moves them with `--apply`; nothing
else moves a row here. A row closed "for a second reading" waits for it; a row met only in part waits for its split.
Open, deferred, duplicate and reference rows never come here.

The archive keeps the register's sections and table layouts, so that a row reads here as it read there. Both readers
(scripts/register-state.ts, scripts/register-tickets.ts) read both files as one, so every count, `scripts/m22-status.ts`
and the feature map still see every row; an id stands in only one of the two (test/small/register-archive). A row
reopened goes back to the register, its status saying why.
