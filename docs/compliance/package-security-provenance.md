# Package Security and Provenance Baseline

This SEC-004 baseline covers npm package security, publishing controls, and
release provenance for the public packages built from this repository:

- `@devdocsai/core`
- `@devdocsai/css`
- `@devdocsai/docusaurus-theme-search`
- `@devdocsai/react`
- `@devdocsai/web`

The controlled source of truth is the GitHub repository at
`devdocsorg/devdocsai-js`. Package build and publish behavior is defined by the
[root package manifest](../../package.json), package workspace manifests under
`packages/*`, the [CI workflow](../../.github/workflows/ci.yml), and the
[release workflow](../../.github/workflows/release.yml).

## Publishing Controls

Package publication is limited to the release workflow that runs after changes
land on `main`. Maintainers use Changesets for version management; the release
workflow installs dependencies with `npm ci`, runs the configured Changesets
version or publish command, and relies on GitHub repository permissions for
release execution.

Required controls:

- Direct pushes to `main` must remain restricted to maintainers.
- Pull requests must pass CI before merge.
- Version changes must be produced by Changesets instead of manual edits to
  published package versions.
- npm package publish access must be limited to the DevDocs.ai npm
  organization/package owners.
- Release workflow permissions must stay scoped to the minimum needed for
  publishing. The current release workflow grants `id-token: write`,
  `contents: write`, and `pull-requests: write`.

## Token Handling

The current release workflow references `NPM_TOKEN` from GitHub Actions secrets.
That token must be treated as production release infrastructure.

Token requirements:

- Store npm publish credentials only as GitHub Actions secrets.
- Do not commit `.npmrc` files containing tokens or registry credentials.
- Do not run package publishing from developer laptops.
- Rotate `NPM_TOKEN` immediately after suspected exposure, maintainer
  offboarding, or release workflow compromise.
- Prefer npm trusted publishing with GitHub Actions OIDC over long-lived npm
  automation tokens once each published package is configured for trusted
  publishers in npm.

## Package Integrity

Package contents are constrained by each workspace package manifest. Packages
with build steps use `prepack` scripts so generated `dist` output is rebuilt
before tarballs are created. The root `npm run build` command runs
`npm pack --workspaces`, which creates the publishable tarballs for inspection.

Integrity requirements:

- Review `npm pack --workspaces --dry-run` output before publishing a new
  package or changing package `files` entries.
- Keep package `files` allowlists narrow so source-only files, secrets, local
  config, test output, and build caches are excluded.
- Keep `package-lock.json` committed and use `npm ci` in CI and release jobs.
- Verify installed dependency signatures and provenance attestations with
  `npm audit signatures` after `npm ci`.

## Provenance

The release workflow already grants `id-token: write`, which is required for
OIDC-backed provenance flows. The repository still uses `NPM_TOKEN` for
publishing, so provenance depends on the npm and Changesets publishing mode used
at release time.

Target provenance state:

- Configure npm trusted publishing for every package listed in scope.
- Publish public packages from the public GitHub Actions release workflow.
- Generate npm provenance attestations for every published package version.
- Confirm the npm package page shows provenance metadata linking back to the
  release workflow run, source commit, and build file.
- Run `npm audit signatures` against a fresh install to verify registry
  signatures and provenance attestations.

## SBOM And Dependency Evidence

Dependency evidence is anchored by `package-lock.json` and can be regenerated on
demand from a clean checkout.

Evidence commands:

```sh
npm ci
mkdir -p artifacts/security
npm sbom --workspaces --json > artifacts/security/npm-sbom.cdx.json
npm audit --json > artifacts/security/npm-audit.json
npm audit signatures > artifacts/security/npm-audit-signatures.txt
```

The generated `artifacts/security` files are evidence artifacts. They should be
attached to the release record, audit request, or compliance evidence store
rather than committed by default.

## CI Gates

The CI workflow runs on pull requests and on pushes to `main`. It installs with
`npm ci` and runs linting, tests, package builds, example builds, coverage
upload, and compressed-size checks.

Required SEC-004 PR checks:

```sh
npm run lint
npm run test
npm run build
```

If local execution is blocked, record the command, the exact error, and whether
the same command is covered by CI.

## Release Workflow

Maintainer release sequence:

```sh
git fetch origin main
git switch -c release/<changeset-slug> origin/main
npm ci
npm run lint
npm run test
npm run build
npx changeset
git push -u origin release/<changeset-slug>
gh pr create --base main --head release/<changeset-slug>
```

Automated release sequence after merge:

1. GitHub Actions runs the release workflow on `main`.
2. The workflow installs dependencies using `npm ci`.
3. Changesets opens or updates the version PR when unreleased changesets exist.
4. After the version PR is merged, Changesets publishes changed workspaces to
   npm.
5. Maintainers archive the release workflow run, package tarball manifest, SBOM,
   audit output, and provenance verification evidence.

## Evidence Artifacts

Capture these artifacts for each production release:

| Artifact                 | Command or source                        | Retention target          |
| ------------------------ | ---------------------------------------- | ------------------------- |
| CI workflow run          | GitHub pull request checks               | Pull request              |
| Release workflow run     | GitHub Actions release run               | Release record            |
| Lockfile                 | `package-lock.json` at release commit    | Repository                |
| Package tarball manifest | `npm pack --workspaces --dry-run --json` | Release record            |
| SBOM                     | `npm sbom --workspaces --json`           | Compliance evidence store |
| Vulnerability audit      | `npm audit --json`                       | Compliance evidence store |
| Signature verification   | `npm audit signatures`                   | Compliance evidence store |
| Provenance metadata      | npm package provenance view              | Release record            |

## Explicit Gaps

- npm trusted publishing is not documented as configured for each scoped
  package.
- The release workflow still passes `NPM_TOKEN`, so long-lived token risk
  remains until trusted publishing is fully enabled and token publishing is
  disabled.
- The publish command does not explicitly set `--provenance` or
  `NPM_CONFIG_PROVENANCE=true`.
- SBOM, audit, and package tarball manifests are not currently uploaded as CI or
  release artifacts.
- Branch protection, required reviewers, npm organization membership, and npm
  package 2FA settings are external controls and must be verified outside this
  repository.

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

Clean up local tarballs generated by `npm run build` before committing:

```sh
rm -f ./*.tgz
git status --short
```
