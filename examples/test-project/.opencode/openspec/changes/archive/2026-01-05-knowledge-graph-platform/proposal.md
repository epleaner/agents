# Change: Add Knowledge Graph Platform

## Why
We require a standalone specification for the unified knowledge graph so ingestion, governance, and querying can evolve independently of other capabilities. Consolidating these requirements under plan-opencode-setup hides the responsibilities agents have when recording or retrieving context.

## What Changes
- Define the data sources (beads, OpenSpec, Slack, Fathom, Jira/Linear, GitHub, CI/CD) that populate the knowledge graph.
- Specify schema, provenance tracking, and permission rules for read/write operations across agents.
- Establish scenarios for querying past decisions and appending updates with full audit trails.

## Impact
- Affected specs: `knowledge-graph-platform`
- Affected code/process: ingestion pipelines, knowledge-graph API/skills, auditing/tooling for provenance.
