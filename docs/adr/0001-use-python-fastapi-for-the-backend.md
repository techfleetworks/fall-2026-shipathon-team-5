---
status: proposed
date: 2026-11-11
decision-makers: Team 5 backend and front-end developers
---

# Use Python with FastAPI for the backend API

## Context and Problem Statement

The site checks pictures (is it likely AI-made?) and messages (does it show
scam warning signs?) for an audience of older adults. The front end and backend
are built by two different people in parallel, and the backend will host
machine-learning models. Which language and framework should the backend use?

## Decision Drivers

* The ML ecosystem for image classifiers and text models is strongest in Python.
* The front end must be able to build against a clear, always-current API contract.
* Uploaded pictures and messages must be validated and not stored.
* A small team that needs to move fast during the shipathon.

## Considered Options

* Python + FastAPI
* Python + Flask
* Node.js + Express

## Decision Outcome

Chosen option: "Python + FastAPI", because it keeps the models and the API in
one language and generates interactive API docs (/docs) from typed schemas, so
the contract the front end relies on can't drift from the code.

### Consequences

* Good, because `app/schemas.py` is the single source of truth for the API contract.
* Good, because request validation comes from the schemas.
* Bad, because the front end and backend use different languages, so the two
  sides can't share code or types directly.
* Bad, because ML dependencies make the backend image large; Docker is recommended later.

### Confirmation

`pytest` runs the unit tests and the Gherkin scenarios in `backend/features/`
against the API on every change.

## Pros and Cons of the Options

### Python + FastAPI

* Good, because it publishes typed, automatic OpenAPI docs.
* Good, because it handles async file uploads.
* Neutral, because it's younger than Flask, though widely adopted.

### Python + Flask

* Good, because it's simple and mature.
* Bad, because validation and API docs need extra libraries.

### Node.js + Express

* Good, because it uses the same language as a JavaScript front end.
* Bad, because ML model options are weaker and models would likely need a
  separate Python service anyway.
