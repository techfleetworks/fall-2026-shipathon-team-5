---
status: proposed
date: 2026-11-11
decision-makers: Team 5 backend developer
---

# Limit checks per visitor with an in-memory rate limiter

## Context and Problem Statement

The check endpoints run work that will get heavier once ML models are added.
Once the site is public, one script could send thousands of requests and slow
the service down for everyone. How do we cap use per visitor without adding
infrastructure we don't have yet?

## Decision Drivers

* Protect availability for real visitors (older adults who may not retry).
* No extra services to run during the shipathon.
* Tell visitors kindly what happened instead of showing a technical error.

## Considered Options

* slowapi with in-memory storage, keyed by IP address
* slowapi with Redis storage
* Rely only on the hosting provider's limits

## Decision Outcome

Chosen option: "slowapi with in-memory storage", because it needs no extra
service and can switch to Redis later by changing one storage setting.
The default is 10 checks per minute per IP (`APP_RATE_LIMIT`). `/api/health`
and `/api/quiz` are not limited.

### Consequences

* Good, because a single visitor can't overload the checkers.
* Good, because a visitor over the limit gets a plain-language 429 message.
* Bad, because counts reset on restart and aren't shared between server copies.
  Move to Redis before running more than one copy.
* Bad, because people sharing one IP address (a care home, a library) share one
  allowance. Revisit the number if real visitors hit it.
* Bad, because behind a hosting proxy every visitor appears to have the proxy's IP
  unless uvicorn trusts the proxy's forwarded headers (`--proxy-headers
  --forwarded-allow-ips`). This must be set when the backend is deployed.

### Confirmation

`tests/test_api.py` and the "too many checks" scenario in
`features/checks/check-text.feature` prove that the limit triggers on both check
endpoints and not on `/api/health`. Removing the limit makes those tests fail.

## Pros and Cons of the Options

### slowapi with in-memory storage

* Good, because it adds one small library and nothing else to run.
* Bad, because of the restart and multi-copy limits above.

### slowapi with Redis storage

* Good, because counts are shared and survive restarts.
* Bad, because it needs a Redis service before the team needs one.

### Rely only on the hosting provider's limits

* Good, because there's no code to write.
* Bad, because free hosting tiers often have none, and visitors would see a raw error page.
