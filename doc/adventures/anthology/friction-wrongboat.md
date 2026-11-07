# Friction met writing The Wrong Boat

*New frictions only; those already in [friction.md](friction.md) and [friction-muster.md](friction-muster.md) are not repeated. 7 November 2026.*

1. **A worktree that starts from main lacks the branch.** The fork's worktree began at main's tip and `adventure/anthology` had to be reset onto; the brief said "branch from current adventure/anthology" but the tool starts elsewhere. *Could:* a fork flag for the base ref.
2. **A pursuit that must start late needs a start time of its own.** There is no "wait N watches" in a `Pursuit`; each stage of Bess is a `when since(N)` clause on a measure the module has to set (`t0`), and the highest priority whose time has come wins, which means a late pursuit can *skip* a stage. *Could:* `Pursuit … after N` or a leg list.
3. **A pursuer's speed is the passages' times.** Bess crosses a five-hour road in one hop and is "at" the start until she arrives. A company cannot see her on the road, only learn of her. *Could:* a person in transit as a place the company can see from (a road room with sight-lines).
4. **A closed way's text appears every time the room is described** (circus friction 5 again): five gangplank passages with reasons made the deck read like a timetable; the fix was to give them none. *Could:* closed-way text only when asked.
5. **A scenery State needs `Initially Assert state(...)`** (friction 7 again): the mist read nothing until asserted.
6. **A territorial pair on a path meets the company wherever it crosses a room.** The lads, walking to the weir by the shortest road, ran into the company at the fen landing; the fix was a second, longer land way (`back_road`) that is shorter *for them*. *Could:* a person's route preference or a `Uses go avoiding …`.
7. **A rule in a Topic's `On discuss` cannot retract a variable-bound `at`** (`Retract at(bess, ?w)` is refused). Hence "she goes the wrong way" is expressed as a flag, not a move.
8. **Race names**: a dwarf cannot be a thief (the lint says so only after load); halflings are not playable; the scaffolded default party needed repairing.
9. **Name collisions** (Garrity, Teague, Quill, Thwaite, Hebden, Mudge) were found by the corpus-wide name lint one batch at a time.
10. **Endings say nothing of their titles in the page**: the epilogue is told, the title is not, so a spec must assert on a phrase of the epilogue. *Could:* `Journey.reached(title)` on a fresh checkpoint.
11. **`over` was needed** to say that `Without Shim` outranks `Down the Weir`; the journey warned of the contest (as the guide says).
12. **A Chapter text is told at the opening of the room** and cannot depend on what the player carries; ours first said "a hamper that is not yours" before the hamper was given.
