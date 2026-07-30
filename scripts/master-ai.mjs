#!/usr/bin/env node
// Compatibility entry point. Generate the complete A15XQ lineage first,
// then require a whole-function rewrite in every candidate.
await import('./synthesize-factory.mjs');
await import('./enforce-structural.mjs');
