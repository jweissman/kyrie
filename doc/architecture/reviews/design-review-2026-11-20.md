# An independent design review of the contact sheets (20 November)

The owner had the first contact sheets (the CI job `contact-sheets`, run 44786761494: 41 pages at 390×844 and
820×1180, world a1) read by an outside reviewer for composition and design only. The review, summarised, with the
lead's triage; the owner's word on it: "we don't necessarily need to adopt these right away (I think scrim in
particular should be used only if we measure the contrast as unacceptable, otherwise it seems much cleaner without
it) — it does seem like there may be some useful ideas in here".

| # | The review says | Triage | Row |
|---|---|---|---|
| 1 | Light text over painterly art shifts in contrast with what lies behind each line; standardise dark scrims, verify WCAG AA | Measure first: the contrast of each line of text over the art behind it, from the contact sheets, against AA (4.5:1 body, 3:1 large). A scrim only where a page fails, never as a style. | UI-19 (defect check) |
| 2 | The Encyclopedia's light parchment page after dark scenes is a jolt; handbooks dense, small type at 820 wide | The register break is real; which way is the owner's (dark vellum by default with a light page as a choice, or as it is). The handbooks' measure and type at tablet width are checkable. | UI-20 (direction) |
| 3 | Ten creation pages over one woodland scene: no sense of the build accumulating; empty space below | A summary of what has been chosen, building as the pages go (the act of choosing, M22); not the steps merged, which the owner's creation design keeps. | UI-21 (direction) |
| 4 | Choices and prose in one typographic voice; the pack's and fight's square tiles detached; the fight's actors crowded | Choices distinct from prose at a glance, and the fight's status apart from its acts: a design pass. | UI-22 (direction) |
| 5 | A typed view-model between the interpreter and React; overlays routed above the turn; contact sheets on fixed seeds | Under way: the engine's one projection (Doable) is the snapshot every client draws (MT-18; the parity measure holds the runner at 0, the page and serve measured); the contact sheets run nightly on a fixed seed. | MT-18 |
