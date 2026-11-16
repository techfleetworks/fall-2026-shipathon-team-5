# Content Credentials trust lists

The image checker reports a Content Credentials signer as "recognised" only if
its certificate chains to one of these lists. They're copied here, not
downloaded at run time, so results don't change unexpectedly and the server
never needs to fetch them.

| File | What it is | Source |
|---|---|---|
| `C2PA-TRUST-LIST.pem` | The official C2PA trust list | https://github.com/c2pa-org/conformance-public/blob/main/trust-list/C2PA-TRUST-LIST.pem |
| `legacy-anchors.pem` | Interim (legacy) trust list, anchors. Frozen since 1 Jan 2026 | https://github.com/contentauth/verify-site/blob/main/static/trust/anchors.pem |
| `legacy-allowed.pem` | Interim (legacy) trust list, allowed end-entity certificates | https://github.com/contentauth/verify-site/blob/main/static/trust/allowed.pem |
| `store.cfg` | Allowed certificate purposes (EKUs) | https://github.com/contentauth/verify-site/blob/main/static/trust/store.cfg |

Downloaded 2026-11-15. Background:
https://opensource.contentauthenticity.org/docs/conformance/trust-lists

## Updating

The official list grows as new organisations join, so refresh it every month
or two. From the repository root in PowerShell:

```powershell
curl.exe -fsSL -o backend/app/trust/C2PA-TRUST-LIST.pem https://raw.githubusercontent.com/c2pa-org/conformance-public/main/trust-list/C2PA-TRUST-LIST.pem
```

Then run the tests and open a pull request that says which list changed and
the date. The legacy files are frozen and don't need updating.
