# Security Policy

## Supported Scope

Security reports are accepted for the maintained DevDocs.ai JavaScript SDK
packages in this repository:

- `@devdocsai/core`
- `@devdocsai/react`
- `@devdocsai/web`
- `@devdocsai/css`
- `@devdocsai/docusaurus-theme-search`

Example applications are provided for integration testing and implementation
guidance. They are not treated as supported production artifacts unless a
finding affects one of the maintained packages above.

## Reporting a Vulnerability

Do not open a public issue for suspected vulnerabilities.

Report security findings through GitHub private vulnerability reporting for this
repository:

https://github.com/devdocsorg/devdocsai-js/security/advisories/new

Include the affected package or workflow, impacted version or commit,
reproduction steps, expected impact, and any suggested remediation. Avoid
including production credentials, customer data, or other secrets in the report.

## Response Targets

The maintainers target the following handling times for valid reports:

- Initial acknowledgement within 2 business days.
- Triage and severity assessment within 5 business days.
- Remediation plan or mitigation guidance based on severity and exploitability.

Security fixes are released through the normal package release process after
validation. When appropriate, the maintainers will publish advisory details
after a fix or mitigation is available.
