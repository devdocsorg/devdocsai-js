---
'@devdocsai/css': patch
---

Fix invalid `:first-child(.DevDocsAISearchResultIndented)` pseudo-class syntax — `:first-child` doesn't accept arguments. Now correctly written as `.DevDocsAISearchResultIndented:first-child`. Surfaces in stricter CSS parsers like Lightning CSS (Next.js 16+).
