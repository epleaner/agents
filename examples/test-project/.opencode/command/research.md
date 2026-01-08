---
description: Invoke the researcher agent to look up documentation, APIs, or context.
---
Research the following topic using available skills (exa-search, context7-docs, fathom-notes, knowledge-graph, etc.). Provide sourced summaries with citations.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**Guidelines**
1. Use `exa-search` and `context7-docs` for API/library documentation.
2. Use `fathom-notes` for meeting notes and action items.
3. Use `knowledge-graph` for project context and prior decisions.
4. Quote or cite key lines (URL, doc slug, timestamp) so findings can be verified.
5. Distill answers into bullet points: Summary, Implications, Follow-ups.
6. If no specific topic is given, ask what the user wants researched.
