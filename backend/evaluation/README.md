# Test sets

* [Scam checker](#scam-checker-test-sets)
* [AI-image detectors](image_detectors/README.md)

# Scam checker test sets

Two labeled sets of messages of the kind older adults in the US and UK
receive, used to measure the scam checker and make sure changes don't make it
worse.

| File | Contents | Use it for |
|---|---|---|
| `scam_messages.csv` | 160 messages: 80 scams, 80 ordinary | Developing and tuning rules |
| `scam_messages_holdout.csv` | 40 messages: 20 scams, 20 ordinary | Estimating real-world results. **Never tune rules against it** |

## Run it

From the `backend` folder:

```powershell
python -m evaluation.evaluate_scam_checker            # main set summary
python -m evaluation.evaluate_scam_checker --details  # list every mistake
python -m evaluation.evaluate_scam_checker --holdout  # held-out set
```

`python -m pytest` also runs `tests/test_scam_evaluation.py`, which fails if
the checker catches fewer scams or raises more false alarms than the baselines.

## Results

A message counts as caught when it's rated medium or high risk.

| Version | Main set: scams caught | Main set: false alarms | Holdout: scams caught | Holdout: false alarms |
|---|---|---|---|---|
| v1 keyword rules (2026-11-13) | 44/60 (73%) | 7/60 (12%) | 9/20 (45%)* | 1/20 (5%)* |
| v2 weighted rules (2026-11-15) | 73/80 (91%) | 1/80 (1%) | 12/20 (60%) | 1/20 (5%) |

\* v1 was measured on the first holdout set, which was then folded into the
main set (ids starting `r2-`) and replaced with a fresh one.

**What the gap means:** the rules score much better on messages they were
tuned on than on new ones. Expect real-world results closer to the holdout
column.

**Still missed:** fake alerts worded exactly like real bank alerts ("Did you
make this purchase? Reply YES or NO"), "wrong number" openers, first messages
from a "new number" that don't ask for anything yet, and fake subscription
renewals asking you to call.

**Still flagged by mistake:** a family member's genuine new number, and
"Can you keep this a secret?" about a surprise.

## Columns

| Column | Meaning |
|---|---|
| `id` | e.g. `scam-012`, `ok-034`, `r2-scam-005`, `hold-ok-007`; never reuse an id |
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

* **Small sets.** On the holdout, one message moves a rate by 5 points, so
  treat small differences as noise.
* **Written, not collected.** The same team wrote the rules and these messages,
  which can make results look better than they would on real messages. Add
  real examples over time, with personal details removed. Once the team has
  collected real messages, replace the holdout with them; it's the most honest
  measure you can have.
* **Scams change fast.** Review and extend the set every few months against new
  FTC, Action Fraud and NCSC warnings.

## Adding messages

Add a row with a new id, run the evaluation, and if the new message shows a
mistake, record it in your pull request. Never delete a row just because the
checker gets it wrong.

