# 4. Deploy the backend to Render using a Docker image

Date: 2026-11-15

## Status

Proposed

## Context

The Next.js front end is hosted on Vercel. Vercel's Python functions have size
limits that the backend will outgrow once ML models are added, and the rate
limiter needs one long-running process to keep its counts. The team needs a
free or cheap host that a beginner can set up, and the front end needs a stable
address to call.

## Decision

Package the backend as a Docker image (`backend/Dockerfile`) and deploy it to
Render's free web service plan using a Blueprint (`render.yaml`). Render
deploys from `develop` only after GitHub's checks pass, and uses
`/api/health` as its health check. The image runs as a non-root user. The rate
limit tells visitors apart by the `True-Client-IP` header Cloudflare sets in
front of Render (`APP_CLIENT_IP_HEADER`).

## Consequences

* The same image runs locally, in CI and on Render, and can move to Railway,
  Fly.io or another Docker host without code changes.
* The free plan sleeps when idle: the first request after a quiet spell can
  take up to a minute. The front end must show a patient loading message.
* `X-Forwarded-For` is not trusted. A live test on 2026-11-16 showed that
  Render passes on entries the visitor adds, so trusting it let a script
  claim a new address per request and skip the rate limit. On another host,
  set `APP_CLIENT_IP_HEADER` to that host's equivalent header, or leave it
  unset.
* Only one instance runs, which matches the in-memory rate limiter (ADR 0002).
  Scaling out needs Redis first.
* Front-end addresses are configured in Render (`APP_ALLOWED_ORIGINS`, and
  optionally `APP_ALLOWED_ORIGIN_REGEX` for Vercel previews), not in code.
