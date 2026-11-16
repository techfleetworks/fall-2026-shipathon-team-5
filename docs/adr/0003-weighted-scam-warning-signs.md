---
status: proposed
date: 2026-11-15
decision-makers: Team 5 backend developer
---

# Score scam warning signs by strength, not by count

## Context and Problem Statement

The first scam checker raised a warning for any single matched word. On the
test set it flagged 12% of ordinary messages, such as genuine one-time-code
texts, a grandchild mentioning Venmo, and "winner of the pie contest". It also
missed fake web addresses written without `www.` or `https://`. Older adults may
trust the result a lot, so false alarms erode confidence and missed scams cause
harm. How should the checker turn warning signs into a risk level?

## Decision Drivers

* Fewer false alarms on everyday messages.
* Keep every warning explainable in plain language.
* Measurable with `evaluation/`, including on a held-out set.
* No ML dependency yet.

## Considered Options

* Weighted rules: strong signs count 2, weak signs count 1, one per kind
* Keep counting kinds of signs (the first version)
* Train an ML text classifier now

## Decision Outcome

Chosen option: "Weighted rules", because it cut false alarms while staying
explainable and needing no training data. Risk is the sum of the strongest
weight of each kind of sign: 0–1 is low, 2 is medium, 3 or more is high. Three
new kinds of sign were added: `new_contact`, `unrealistic_offer` and
`remote_access`. Rules about credentials now match only *requests* for codes
or passwords, not messages that mention them.

### Consequences

* Good, because on the main set false alarms fell from 7/60 to 1/80, and
  scams caught rose from 73% to 91%.
* Good, because on messages written before the last rule changes and never
  tuned on (holdout), it catches 12/20 scams with 1/20 false alarms.
* Bad, because the gap between 91% and 60% shows the rules fit the examples
  they were tuned on. Expect real-world results nearer the holdout figure.
* Bad, because scams that look exactly like real bank alerts, and "wrong
  number" openers, are still missed. The site should always advise calling the
  number on the back of your card.
* Neutral: the API now returns three new `type` values in `red_flags`. The
  front end needs labels for them.

### Confirmation

`tests/test_scam_evaluation.py` fails if scams caught falls or false alarms
rise on either set. Gherkin scenarios cover a genuine security code (not
flagged), a lookalike web address (flagged) and a single everyday word (low).

## Pros and Cons of the Options

### Weighted rules

* Good, because each flag still comes with an explanation.
* Bad, because the weights are hand-set and must be re-checked as rules grow.

### Counting kinds of signs

* Good, because it's simple.
* Bad, because any one word triggered a warning (12% false alarms).

### ML text classifier now

* Good, because it could generalize beyond hand-written phrases.
* Bad, because there isn't enough labeled, real data yet, and it can't explain
  which words are the problem without extra work.
