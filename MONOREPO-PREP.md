# Monorepo Promotion Prep — devdocsai-js → `packages/js-sdk`

Part of epic DEV-862
(`compliance/dev-to-prod-monorepo-promotion-architecture.md`). Phase 0 promotes
this repo to the monorepo standard: **pnpm workspace + Node 24 + standard CI**.

## Phase 0 — DONE (npm-workspace → pnpm + Node 24)

Validated locally on Node 22 (`COREPACK_ENABLE_DOWNLOAD_PROMPT=0 CI=1`,
engine-strict off): `pnpm install` succeeds, all buildable packages build, and
the full vitest suite passes (143/143).

### Workspace / package manager

- Removed the `workspaces` field from `package.json`; added
  `pnpm-workspace.yaml` with `packages: [examples/*, packages/*]`.
- `packageManager: pnpm@11.0.9`; `engines.node >= 24`; `.nvmrc = 24`.
- `pnpm import` seeded `pnpm-lock.yaml` from the old `package-lock.json`, which
  was then deleted.
- Root scripts rewritten from npm-workspace syntax to pnpm:
  - `build`: `npm pack --workspaces` → `pnpm -r pack`
  - `build:packages`: `npm run build -w …` →
    `pnpm --filter @devdocsai/core --filter @devdocsai/docusaurus-theme-search --filter @devdocsai/react --filter @devdocsai/web run build`
  - `lint:ts`: `npm run build && rm *.tgz` →
    `pnpm run build && rm -f packages/*/*.tgz examples/*/*.tgz`
  - `publish`: `npm run build:packages …` → `pnpm run build:packages …`
  - `version`: `changeset version && npm install` →
    `changeset version && pnpm install`

### pnpm-specific fixes required to build cleanly

- **`nodeLinker: hoisted`** (in `pnpm-workspace.yaml`). The old npm workspace
  relied on hoisting so `tsc --build` could _name_ inferred types from
  transitive deps. Under pnpm's default isolated store, the declaration emit
  produced unportable `.pnpm/immer@…` paths (TS2742, via
  `zustand/middleware/immer`). A flat layout restores the prior, working
  behavior. NOTE: `node-linker` in `.npmrc` is **not** honored by pnpm 11 — it
  must live in `pnpm-workspace.yaml` (`nodeLinker`).
- **`@devdocsai/react`**: added `@types/react`, `@types/react-dom`, `react`,
  `react-dom` to `devDependencies`. Under npm these resolved via hoisting from
  `@devdocsai/web`'s devDeps + root `overrides`; pnpm's stricter resolution
  surfaced the missing direct declaration ("Could not find a declaration file
  for module 'react'").
- **`onlyBuiltDependencies`** (in `pnpm-workspace.yaml`): `@swc/core`,
  `core-js`, `esbuild`, `msw`, `sharp`, `unrs-resolver`. pnpm 11 does not run
  dependency build scripts by default; `esbuild` in particular is required for
  the `@devdocsai/web` build. A first `pnpm install` followed by `pnpm rebuild`
  runs the approved scripts.
- A few deeply-nested transitive build scripts (`esbuild@0.21.5`, `msw`,
  `unrs-resolver` instances) still log `ERR_PNPM_IGNORED_BUILDS`. This is
  non-fatal for `install`, but pnpm's pre-run "deps status check" treats it as
  fatal, so `pnpm run <script>` must be invoked with
  `--config.verify-deps-before-run=false` locally. CI uses
  `pnpm install --frozen-lockfile` then `pnpm run …`, where the deps-status
  check is a no-op against a satisfied lockfile.

### CI / Node 24

- `.github/workflows/ci.yml` rewritten to the standard form:
  `pnpm/action-setup@v4`, Node 24, `vars.DEVDOCS_RUNNER`,
  `cancel-in-progress: false`, 25-min timeouts, jobs `lint` / `build` / `test`.
  (The example-app build uses `pnpm --filter`.)
- `release.yml` migrated to pnpm + Node 24 (`changesets/action` with
  `pnpm run version` / `pnpm run publish`).
- `sbom.yml` switched from `@cyclonedx/cyclonedx-npm --package-lock-only` (needs
  the deleted `package-lock.json`) to `@cyclonedx/cdxgen -t pnpm`.
- `codeql.yml` is language-agnostic — unchanged. `dependabot.yml` keeps the
  `npm` ecosystem (Dependabot reads pnpm workspaces under that ecosystem).

### React 19

- `@devdocsai/react` / `@devdocsai/docusaurus-theme-search` already peer
  `react ^18 || ^19`; root `overrides` pin React 19 and `@devdocsai/web` builds
  against `@preact/compat`. Already on the React 19 standard (commit 2fe9564) —
  no further change needed in Phase 0.

## Follow-ups (not Phase 0)

- **CODEOWNERS**: add once the prod-admins GitHub team slug is confirmed.
- **Coverage**: vitest is on `^0.34` — upgrade and add coverage thresholds.
- **Bundle-size gate**: the old `preactjs/compressed-size-action` job was
  dropped from `ci.yml` during the pnpm rewrite; re-add against the pnpm package
  `dist` output if the size gate is still desired.
- **Flaky test**: `packages/react/src/search/SearchView.test.tsx`
  (`option[selected]` `waitFor`) intermittently times out under parallel
  execution; it passes in isolation and single-threaded
  (`vitest run --no-threads` → 143/143). Pre-existing async-timing flake, not
  introduced by the pnpm migration.
