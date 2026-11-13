# Scam checker test set

`scam_messages.csv` holds 120 labeled messages: 60 scams and 60 ordinary
messages of the kind older adults in the US and UK receive. Use it to measure
the scam checker and to make sure changes don't make it worse.

## Run it

From the `backend` folder:

```powershell
python -m evaluation.evaluate_scam_checker            # summary
python -m evaluation.evaluate_scam_checker --details  # list every mistake
```

`python -m pytest` also runs `tests/test_scam_evaluation.py`, which fails if the
checker catches fewer scams or raises more false alarms than the baseline.

## Baseline (rule-based checker, 2026-11-13)

| Measure | Result |
|---|---|
| Scams caught (rated medium or high risk) | 44 of 60 (73%) |
| Ordinary messages wrongly flagged | 7 of 60 (12%) |

**Missed most often:** "wrong number" openers, job and task scams, "Hi Mum"
messages with no request yet, and links written without `www.` or `https://`
(for example `ee-billing.example`).

**False alarms:** genuine one-time-code texts ("Your verification code is…"),
a family member mentioning Venmo, a surprise party ("don't tell Dad"), and
everyday words like "winner" and "gift card".

## Columns

| Column | Meaning |
|---|---|
| `id` | `scam-NNN` or `ok-NNN`; never reuse an id |
| `label` | `scam` or `ok` |
| `message_type` | Kind of message, such as `delivery`, `bank`, `family`, `toll` |
| `region` | `US` or `UK` |
| `channel` | `sms`, `email`, `whatsapp`, `phone-script`, etc. |
| `based_on` | Where the pattern comes from (see Sources) |
| `text` | The message |

## Where the messages come from

All messages were written for this test set. None is a real person's message.
Scam messages follow the patterns described by the sources below. Links use the
reserved `.example` domain, and phone numbers use ranges set aside for fiction
(US 555-01xx, UK Ofcom drama numbers), so nothing in the file points anywhere real.

| `based_on` | Source |
|---|---|
| `ftc-2025-top-text-scams` | [FTC: top text message scams of 2024](https://www.ftc.gov/news-events/news/press-releases/2025/04/new-ftc-data-show-top-text-message-scams-2024-overall-losses-text-scams-hit-470-million) |
| `ftc-2025-unpaid-tolls` | [FTC consumer alert: unpaid toll texts](https://www.consumer.ftc.gov/consumer-alerts/2025/01/got-text-about-unpaid-tolls-its-probably-scam) |
| `which-sneaky-texts` | [Which?: text message scams to watch out for](https://www.which.co.uk/news/article/four-new-sneaky-text-message-scams-to-watch-out-for-aGVa83r4iH2v) |
| `resolver-text-email-scams` | [Resolver: text and email scams you should know about](https://news.resolver.co.uk/the-text-and-email-scams-you-should-know-about/) |
| `team-written` | Written by the team from common, widely reported scam patterns |

## Limitations

* **Small set.** With 60 of each kind, one message moves a rate by about 1.7
  points, so treat differences of a few points as noise.
* **Written, not collected.** The same team wrote the rules and these messages,
  which can make results look better than they would on real messages. Add
  real examples over time, with personal details removed, and keep some
  messages aside that nobody looks at while tuning the rules.
* **Scams change fast.** Review and extend the set every few months against new
  FTC, Action Fraud and NCSC warnings.

## Adding messages

Add a row with a new id, run the evaluation, and if the new message shows a
mistake, record it in your pull request. Never delete a row just because the
checker gets it wrong.
