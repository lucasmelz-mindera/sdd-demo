# Resolve

Settle one decision ticket.

1. **Catch up the map**: any closed decision ticket missing from Decisions so far (a research subagent finished) gets its line now.
2. **Pick**: the ticket the user named, or the first open decision ticket with no open blocker and no assignee — grilling before research, since research subagents are usually still running. Claim it. Nothing takeable → say what's in flight and stop.
3. **Work it**, after reading the closed tickets it depends on:
   - `sdd:grilling` — grill on this ticket's question only, until the user confirms the decision.
   - `sdd:research` — a findings comment is there: summarise it for the user in two lines. None: do the research now from primary sources and post it.
4. **Record**: post the resolution comment, then close the ticket.

   ```markdown
   ## Decision

   ## Why

   ## Consequences for the spec
   ```

5. **Update the map**: append `- [<title> (#n)](url) — <one-line gist>` under Decisions so far. A new question the spec needs becomes a new ticket (sub-issue, wired). Anything the answer ruled out goes under Out of scope.
6. Name what's next — the next ticket, or "decisions done; the next run writes the spec". Stop.
