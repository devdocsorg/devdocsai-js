# SOC 2 CI and Security Baseline

Last reviewed: 2026-05-26

This repository publishes the DevDocs.ai JavaScript SDK packages. The SOC 2
baseline for this repo is focused on change management, vulnerability detection,
malware prevention, and release evidence for npm package artifacts.

## Control Mapping

| Control | Evidence                                                             | Purpose                                                                                 |
| ------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| CC6.1   | `.github/CODEOWNERS`                                                 | Requires production admin review for SDK, CI, release, and package-surface changes.     |
| CC6.8   | `.github/workflows/snyk.yml`                                         | Runs Snyk dependency, code, IaC, and secret scans when `SNYK_TOKEN` is configured.      |
| CC7.1   | `.github/workflows/codeql.yml` and `.github/workflows/snyk.yml`      | Adds static analysis and vulnerability detection on pull requests, main, and schedules. |
| CC8.1   | `.github/workflows/ci.yml`, `.github/dependabot.yml`, and CODEOWNERS | Enforces tested pull request changes and creates auditable dependency update evidence.  |
| CC9.2   | `SECURITY.md`                                                        | Defines vulnerability reporting and response targets for external reports.              |

## Baseline Files

| File                           | Status                      | Notes                                                                                                      |
| ------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.github/CODEOWNERS`           | Active                      | Owns all paths to `@devdocsorg/prod-admins`; branch protection must require CODEOWNERS review after merge. |
| `.github/dependabot.yml`       | Active                      | Weekly npm and GitHub Actions update checks.                                                               |
| `.github/workflows/ci.yml`     | Active                      | Pull request and main checks for lint, tests, package builds, and bundle size.                             |
| `.github/workflows/codeql.yml` | Active                      | JavaScript and TypeScript CodeQL analysis with extended security queries.                                  |
| `.github/workflows/sbom.yml`   | Active                      | CycloneDX JSON SBOM generation through Syft on release and manual dispatch.                                |
| `.github/workflows/snyk.yml`   | Active after secret install | Requires `SNYK_TOKEN` in GitHub Actions secrets before it becomes a required branch protection check.      |
| `SECURITY.md`                  | Active                      | Uses GitHub private vulnerability reporting and documents response targets.                                |

## Required Post-Merge Settings

- Make CI, CodeQL, Snyk, and CODEOWNERS review required checks in branch
  protection.
- Add `SNYK_TOKEN` as a repository or organization Actions secret.
- Keep GitHub secret scanning and push protection enabled at the organization
  level.
- Archive each release SBOM artifact with the release evidence package.

## Current Known Gaps

- `npm audit` reports 0 critical, 8 high, 37 moderate, and 2 low findings as of
  this review. Remediation is tracked separately so this PR remains a CI and
  evidence baseline only.
- Branch protection and required check settings are GitHub organization settings
  and are not visible from this repository until configured by an admin.
