# Package Security and Provenance Baseline

This SEC-004 baseline documents package security, npm publishing controls,
release provenance, and SOC 2 evidence expectations for the public packages
built from `devdocsorg/devdocsai-js`.

## Scope

In-scope published packages:

| Package                              | Current source path                | Published artifact boundary                                     |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------- |
| `@devdocsai/core`                    | `packages/core`                    | `dist`                                                          |
| `@devdocsai/css`                     | `packages/css`                     | `devdocsai.css`, `index.d.ts`                                   |
| `@devdocsai/docusaurus-theme-search` | `packages/docusaurus-theme-search` | `dist`, `src/theme`                                             |
| `@devdocsai/react`                   | `packages/react`                   | `dist`                                                          |
| `@devdocsai/web`                     | `packages/web`                     | `dist/globals.*`, `dist/index.*`, `dist/init.*`, `dist/types.*` |

The controlled source of truth is this GitHub repository. Package build and
publish behavior is defined by:

- Root package manifest: `package.json`
- Workspace manifests: `packages/*/package.json`
- CI workflow: `.github/workflows/ci.yml`
- Release workflow: `.github/workflows/release.yml`
- npm config: `.npmrc`
- Changesets config: `.changeset/config.json`

## SOC 2 Control Mapping

| Control | Package security obligation                                    | Repo evidence                                                                   |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| CC6.1   | Restrict release authority to named maintainers                | GitHub branch protection and npm owner evidence, verified outside the repo      |
| CC6.7   | Keep publish tokens and package credentials out of source      | `.npmrc` has no token; release uses `secrets.NPM_TOKEN`                         |
| CC6.8   | Detect malicious or vulnerable dependencies before release     | CI dependency install, tests, and required security-scan PR checks once enabled |
| CC7.1   | Generate vulnerability and SBOM evidence for release artifacts | `npm audit`, `npm sbom`, and pending SBOM workflow evidence                     |
| CC8.1   | Require reviewed PRs and reproducible release changes          | Changesets workflow, PR checks, release workflow history                        |
| CC9.2   | Treat npm and GitHub as package supply-chain vendors           | Vendor register, npm account controls, GitHub SOC 2/CUEC review                 |
| C1.1    | Protect confidential release credentials and source integrity  | GitHub Actions secrets, scoped npm token, provenance evidence                   |

## Publishing Controls

Maintainers publish packages through the GitHub Actions release workflow after
changes merge to `main`. The workflow runs `npm ci`, then invokes the Changesets
action with:

- `version: npm run version`
- `publish: npm run publish`
- `GITHUB_TOKEN` from the GitHub-provided token
- `NPM_TOKEN` from GitHub Actions secrets

Required operating controls:

- Direct pushes to `main` stay disabled.
- Release pull requests are reviewed before merge.
- Version changes are generated through Changesets instead of ad hoc manual
  edits.
- npm package publish access is limited to named DevDocs package owners.
- npm 2FA is enforced for package owners.
- The release workflow retains the narrow permissions currently required for
  Changesets: `id-token: write`, `contents: write`, and `pull-requests: write`.
- Release evidence includes the PR, CI run, release workflow run, published npm
  package versions, and package provenance verification.

## Token Handling

The release workflow currently uses `secrets.NPM_TOKEN`. Treat this token as
production release infrastructure.

Required token controls:

- Store npm publish credentials only in GitHub Actions secrets.
- Do not commit npm auth tokens, registry passwords, or local `.npmrc`
  credentials.
- Do not publish production packages from developer laptops.
- Rotate `NPM_TOKEN` after suspected exposure, maintainer offboarding, npm owner
  changes, or release workflow compromise.
- Review token scope quarterly with the SOC 2 access review.
- Prefer npm trusted publishing with GitHub Actions OIDC once every scoped
  package is configured for trusted publishers in npm.

## Provenance Target State

The repository already has `id-token: write` in the release workflow and a
commented `.npmrc` provenance setting. That is not enough by itself to prove
provenance for SOC 2.

Target release state:

- Configure npm trusted publishing for each package in scope.
- Publish only from the GitHub Actions release workflow.
- Enable npm provenance for every public package release.
- Confirm each npm package page links provenance metadata to the GitHub workflow
  run, source commit, and release artifact.
- Run signature and provenance verification from a clean install before
  archiving release evidence.

## Package Integrity

Each package uses a package `files` allowlist. Packages with generated
JavaScript output rebuild during `prepack`, and the root `npm run build` command
creates publishable workspace tarballs with `npm pack --workspaces`.

Integrity requirements:

- Review `npm pack --workspaces --dry-run --json` before publishing a new
  package or changing any package `files` allowlist.
- Keep package allowlists narrow so local config, tests, source-only files,
  build caches, and credentials are excluded.
- Keep `package-lock.json` committed.
- Use `npm ci` in CI and release jobs.
- Archive tarball manifests for every production release.

## SBOM and Vulnerability Evidence

Release evidence should be regenerated from a clean checkout for every
production release.

```sh
npm ci
mkdir -p artifacts/security
npm sbom --workspaces --json > artifacts/security/npm-sbom.cdx.json
npm audit --json > artifacts/security/npm-audit.json
npm audit signatures > artifacts/security/npm-audit-signatures.txt
npm pack --workspaces --dry-run --json > artifacts/security/npm-pack-manifest.json
```

The files under `artifacts/security` are evidence artifacts. Attach them to the
release record or compliance evidence store; do not commit generated evidence by
default.

## CI Gates

The required SEC-004 PR checks are:

```sh
npm run lint
npm run test
npm run build
```

The current `main` branch CI runs lint, tests, example builds, coverage upload,
and bundle-size checks. Additional SOC 2 security workflow coverage for Snyk,
CodeQL, and SBOM generation is tracked in separate open PRs and must be merged
before those checks can be made required in branch protection.

## Release Evidence Checklist

Capture these artifacts for each production package release:

| Artifact                | Source or command                        | Evidence owner |
| ----------------------- | ---------------------------------------- | -------------- |
| Release PR              | GitHub pull request                      | Release owner  |
| CI workflow run         | GitHub Actions `ci` workflow             | Release owner  |
| Release workflow run    | GitHub Actions `Release` workflow        | Release owner  |
| Lockfile                | `package-lock.json` at release commit    | Release owner  |
| Tarball manifest        | `npm pack --workspaces --dry-run --json` | Release owner  |
| SBOM                    | `npm sbom --workspaces --json`           | Security owner |
| Vulnerability audit     | `npm audit --json`                       | Security owner |
| Signature verification  | `npm audit signatures`                   | Security owner |
| npm provenance metadata | npm package page and registry metadata   | Release owner  |
| npm owner review        | npm organization owner/member export     | Security owner |

## Explicit Gaps

These gaps must remain visible until closed by a follow-up PR or account-level
evidence:

- npm trusted publishing is not proven as configured for each scoped package.
- Release still depends on long-lived `NPM_TOKEN`.
- `.npmrc` documents provenance but keeps `provenance=true` commented out.
- Snyk, CodeQL, and SBOM workflows are not present on `main` at the time of this
  baseline.
- SBOM, audit, signature, and tarball-manifest artifacts are not uploaded by the
  current `main` release workflow.
- Branch protection, npm owner list, npm 2FA, and required-check enforcement are
  external controls that must be verified from GitHub and npm account evidence.

## Verification Commands

Use these commands from the repository root to verify this baseline:

```sh
git status --short --branch
git fetch origin main
git rev-parse --verify origin/main
npm ci
npm run lint
npm run test
npm run build
npm pack --workspaces --dry-run --json
npm sbom --workspaces --json
npm audit --json
npm audit signatures
```

Remove generated tarballs before committing:

```sh
rm -f ./*.tgz
git status --short
```
