---
'@devdocsai/react': major
---

**BREAKING**: Drop React 16 and React 17 support. The peer range is now `^18 || ^19`.

Why: `react-markdown@9` (required to compile under React 19's removed-global `JSX` namespace) itself peers `react: ">=18"`, so a `@devdocsai/react` install on a React 17 host hits an unmet-peer error transitively even if our own peer range allowed it. Cleanly dropping React 16/17 here makes the supported range honest.

Migration: pin `@devdocsai/react@^0.30.x` if you must stay on React 17. Otherwise upgrade your host to React 18 or 19.

Also bumps:
- `react-markdown` 8 → 9
- `remark-gfm` 3 → 4
- `@testing-library/react` 12 → 16 (dev dep)
- `@testing-library/dom` 8 → 10 (dev dep)
- Drops `@testing-library/react-hooks` (deprecated; its `renderHook` was merged into `@testing-library/react` in v13).
