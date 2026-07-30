#!/usr/bin/env node
// Compatibility entry point. The workflow historically called this file.
// All candidate generation now routes through the full A15XQ lineage engine.
await import('./synthesize-factory.mjs');
