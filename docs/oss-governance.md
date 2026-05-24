# OSS Governance Notes

Updated: 2026-05-24

## Purpose

Document the `devdocsai-js` OSS disposition for SOC 2 CC7.1 dependency
management and CC9.2 vendor governance. The aggregate SBOM flagged internal
package metadata, `type-fest` license expressions, and stale docs/test tooling;
this file narrows the runtime exposure for execution.

## Source Evidence

| Source                                          | Finding                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `package.json`                                  | Root workspace is private and MIT-licensed.                                                                        |
| `packages/core/package.json`                    | Publishable SDK package has `license: MIT`.                                                                        |
| `packages/css/package.json`                     | Publishable SDK package has `license: MIT`.                                                                        |
| `packages/docusaurus-theme-search/package.json` | Publishable SDK package has `license: MIT`.                                                                        |
| `packages/react/package.json`                   | Publishable SDK package has `license: MIT`.                                                                        |
| `packages/web/package.json`                     | Publishable SDK package has `license: MIT`.                                                                        |
| `examples/*/package.json`                       | Private examples are MIT-licensed to prevent internal example packages from appearing as Unknown in SBOM evidence. |

## Runtime Classification

| Dependency family                                                               | Runtime surface                                                            | License disposition                         | Maintenance disposition       | Notes                                                                                                                |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Internal `@devdocsai/*` packages                                                | Published SDK/runtime packages                                             | MIT                                         | Active internal packages      | Package metadata is explicit in each publishable package.                                                            |
| `type-fest`                                                                     | Type-only dependency under `@devdocsai/core`; used by tests/imported types | `MIT OR CC0-1.0`                            | Maintained                    | Non-standard expression is acceptable for policy review; no customer-data runtime processing.                        |
| `remark-*`, `unified-prettier`, `stylelint-*`, `npm-run-all`, `path-exists-cli` | Root workspace docs/lint/release tooling                                   | MIT or compatible unless separately flagged | Some packages stale/abandoned | Tooling-only; does not ship in SDK runtime bundles. Track replacement opportunistically, not as audit-entry blocker. |
| Docusaurus example dependencies                                                 | Private examples                                                           | MIT-compatible or documented upstream       | Non-production                | Examples are reference/dev surfaces and not production runtime.                                                      |

## Controls

- Keep every publishable `packages/*/package.json` license explicit.
- Keep private examples license-tagged so generated SBOMs do not classify
  DevDocs-owned example packages as unknown third-party OSS.
- Do not block SDK release solely on stale docs/lint tooling unless the package
  ships in `files` for a published package or executes in release CI.
- Review any newly introduced direct production dependency with a license
  outside MIT/Apache-2.0/BSD/ISC before release.
- Treat `type-fest` as accepted for this SDK because the license expression is
  permissive (`MIT OR CC0-1.0`) and the package is type-oriented.

## Follow-Up

| Ticket    | Purpose                                               |
| --------- | ----------------------------------------------------- |
| `DEV-786` | Current metadata/classification cleanup.              |
| `DEV-770` | Separate high npm audit remediation for this repo.    |
| `DEV-695` | CI/Snyk/CodeQL/SBOM baseline for recurring detection. |
