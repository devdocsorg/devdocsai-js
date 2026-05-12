---
'@devdocsai/react': minor
---

Add React 19 to the supported peer dependency range and bump `react-markdown` to v9 so the package compiles cleanly on React 19 codebases. Previously `tsc --noEmit` failed under React 19 because `react-markdown@8.x` references the global `JSX` namespace that React 19 removed.
