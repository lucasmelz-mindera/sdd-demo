# Build

Implement one build ticket.

1. **Pick**: the ticket the user named, or the first open `sdd:build` ticket with no open blocker and no assignee. Claim it. Nothing takeable → say what's in flight and stop.
2. **Read** the ticket, the spec, and the decision tickets it cites.
3. **Branch** `ticket-<n>-<slug>` from the latest main.
4. **Build it**. Pure game logic goes test-first: red, green, refactor. Run the tests often.
5. **Verify** every acceptance criterion by running it — tests for logic, two browser tabs (one hosting, one joining) for anything networked.
6. **Open the PR**: title is the ticket title; the body starts with `Closes #<n>`, then one line per criterion saying how it was verified. Tick the criteria on the ticket.
7. Report the PR link and what becomes buildable once it merges. Stop — the human reviews and merges.

Two sessions can build two frontier tickets at once, each in its own git worktree; name the ticket in each so they don't race for the same one.
