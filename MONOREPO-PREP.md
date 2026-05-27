# Monorepo Promotion Prep — devdocsai-js → `packages/js-sdk`

Part of epic DEV-862 (`compliance/dev-to-prod-monorepo-promotion-architecture.md`). This PR lands the **safe, additive** Phase 0 contract. The transforms below are **validated, supervised** follow-ups (this is an npm *workspace* and the build standard targets Node 24, which the prep host doesn't have installed — so they were not auto-applied to avoid shipping an unvalidated build).

## Landed in this PR (additive, no build impact)
- `.nvmrc` = 24
- `.github/dependabot.yml`, `.github/workflows/codeql.yml`, `.github/workflows/sbom.yml`
- `repo.manifest.json` (target `packages/js-sdk`)

## Follow-up transforms (supervised; validate `pnpm install` + build on Node 24)
1. **pnpm**: replace `workspaces` field with `pnpm-workspace.yaml`; `pnpm import` to seed `pnpm-lock.yaml`, delete `package-lock.json`; set `packageManager: pnpm@<latest>`; rewrite npm-workspace scripts (`npm pack --workspaces`, `npm run -w …`) to pnpm (`pnpm -r`, `pnpm --filter …`).
2. **Node 24**: add `engines.node >= 24`; verify build/test on Node 24.
3. **React 19**: bump `@devdocsai/react` peer/dev React to 19; verify.
4. **CI**: replace with the standard `ci.yml` (pnpm/Node24/`vars.DEVDOCS_RUNNER`/`--with-deps`/25-min/`cancel-in-progress:false`) once pnpm lands.
5. **CODEOWNERS**: add once the prod-admins GitHub team slug is confirmed.
6. **Coverage**: vitest is on `^0.34` — upgrade and add coverage thresholds.
