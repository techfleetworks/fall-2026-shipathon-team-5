"""Rule-based scam warning signs.

Each rule finds words that scammers commonly use and explains, in plain
language, why they are a warning sign. Rules are in English and tuned for
the US and UK; extend them as new scam patterns appear.

Each rule has a weight: 2 for a strong sign (asking for codes, gift cards,
a fake company web address) and 1 for a weak sign that also appears in
ordinary messages (a link, "urgent", "winner"). The risk comes from adding the
strongest weight of each kind of sign found:

    0-1 -> low     2 -> medium     3 or more -> high

so a single everyday word never raises a warning on its own.
Measure every change with `python -m evaluation.evaluate_scam_checker`.
"""

import re
from dataclasses import dataclass

from app.schemas import RedFlag, RedFlagType, TextCheckResult

STRONG, WEAK = 2, 1
MEDIUM_AT, HIGH_AT = 2, 3


@dataclass(frozen=True)
class Rule:
    type: RedFlagType
    weight: int
    pattern: re.Pattern[str]
    explanation: str


def _words(*phrases: str) -> re.Pattern[str]:
    return re.compile(r"\b(" + "|".join(phrases) + r")\b", re.IGNORECASE)


# --- Web addresses ------------------------------------------------------------

# Finds web addresses with or without "https://" or "www.", but not email addresses.
_URL = re.compile(
    r"(?<![@\w.-])(?:https?://)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:/\S*)?", re.IGNORECASE
)

# Names scammers often copy in fake web addresses (e.g. "usps-redelivery.info").
_BRANDS = {
    "usps", "fedex", "ups", "dhl", "royalmail", "rm", "dpd", "evri", "hermes",
    "amazon", "amzn", "ezpass", "fastrak", "sunpass", "tollroads", "chase",
    "wellsfargo", "bankofamerica", "bofa", "barclays", "lloyds", "hsbc",
    "natwest", "santander", "paypal", "apple", "appleid", "icloud", "netflix",
    "microsoft", "hmrc", "irs", "dvla", "ee", "vodafone", "walmart", "ebay",
}

# Words phishing addresses add to look like a company's payment or login page.
_SERVICE_WORDS = {
    "billing", "pay", "payment", "payments", "verify", "verification", "secure",
    "security", "login", "signin", "update", "restore", "support", "refund",
    "rebate", "postage", "delivery", "redeliver", "redelivery", "rebook", "track",
    "tracking", "account", "customs", "invoice", "help", "confirm", "resolution",
    "unlock", "reactivate", "claim",
}

_LINK_EXPLANATION = (
    "Check where a link really goes before clicking. When in doubt, type the "
    "company's address yourself."
)
_LOOKALIKE_EXPLANATION = (
    "This web address is made to look like a company's payment or login page. "
    "Real companies use their own simple address, like amazon.com or royalmail.com."
)


def _link_flags(text: str) -> list[tuple[int, re.Match[str], str]]:
    flags = []
    for m in _URL.finditer(text):
        host = re.sub(r"^https?://", "", m.group(), flags=re.IGNORECASE).split("/")[0]
        if not re.search(r"[a-z]", host.rsplit(".", 1)[-1], re.IGNORECASE):
            continue
        parts = set(re.split(r"[.-]", host.lower()))
        lookalike = "-" in host and bool(parts & (_BRANDS | _SERVICE_WORDS))
        flags.append(
            (STRONG, m, _LOOKALIKE_EXPLANATION) if lookalike else (WEAK, m, _LINK_EXPLANATION)
        )
    return flags


# --- Word rules ---------------------------------------------------------------

_CREDENTIAL_NOUNS = (
    r"(password|passcode|verification code|one-time (pass)?code|security code|"
    r"(?-i:PIN)|card details|card number|bank (account )?details|account details|"
    r"social security number|national insurance number|medicare number)"
)

RULES: tuple[Rule, ...] = (
    # Rushing and threats
    Rule(
        "urgency", WEAK,
        _words(
            r"urgent(ly)?", r"immediately", r"right now", r"act now",
            r"within \d+ hours?", r"in (one|two|three|\d+) hours?", r"last chance",
            r"final (notice|warning|reminder)", r"blocked", r"suspended", r"locked",
            r"frozen", r"disabled", r"restricted", r"on hold", r"expires? today",
            r"settle (it|today|now)", r"pay (today|now)", r"in \d+ minutes",
        ),
        "Scammers try to rush you so you don't have time to think or ask someone.",
    ),
    Rule(
        "urgency", STRONG,
        _words(
            r"avoid (arrest|a warrant|prosecution|legal action)", r"warrant",
            r"(will be|is being) (shut off|disconnected|cut off)",
            r"(disconnect|shut off|cut off|suspend|close) (your )?(service|account|power|electricity|gas|internet|supply)",
            r"unless you pay( now| today)?",
            r"avoid (disconnection|suspension|losing)",
            r"(car accident|police station|bail)",
        ),
        "Threats and emergencies are used to scare you into acting before you can check.",
    ),
    # Unusual ways to pay
    Rule(
        "payment", STRONG,
        _words(
            r"(buy|send|pay( with)?|in|using|by) (\w+ ){0,2}gift ?cards?",
            r"gift ?card (numbers|codes)", r"wire transfer", r"Western Union",
            r"MoneyGram", r"bitcoin", r"crypto(currency)?", r"safe account",
            r"pay a (small )?fee",
            r"(redelivery|processing|release|customs|admin|handling|postage|call-out) (fee|charge)",
            r"unpaid postage", r"prepaid (debit )?cards?",
            r"to release (your|the) (parcel|package|money|funds|payment|winnings)",
            r"top up your account",
        ),
        "Real companies, government offices and family members don't ask for "
        "payment this way. Once sent, this money is very hard to get back.",
    ),
    Rule(
        "payment", WEAK,
        _words(
            r"gift ?cards?", r"vouchers?", r"bank transfer", r"Zelle", r"Venmo", r"Cash ?App",
            r"send (me )?(some )?(money|cash)", r"(send|lend|wire) me [$£]?\d[\d,]*",
            r"\d+ quid",
        ),
        "Be careful if someone asks you to pay this way: payments like these "
        "usually can't be reversed.",
    ),
    # Asking for codes, passwords and personal numbers
    Rule(
        "credentials", STRONG,
        re.compile(
            r"\b(confirm|verify|update|share|send|enter|provide|give|tell|read( me)?|submit|reply with)\b"
            r"[^.?!\n]{0,40}?\b" + _CREDENTIAL_NOUNS + r"\b",
            re.IGNORECASE,
        ),
        "Banks and real companies never ask for your password, codes or card "
        "details by message or phone.",
    ),
    Rule(
        "credentials", STRONG,
        _words(
            r"(social security|national insurance) number (has been|is) (suspended|compromised)",
            r"(the )?code (we('ve| have)? )?(just )?(sent|texted)( you| to you)?",
        ),
        "Your Social Security or National Insurance number can't be suspended or "
        "compromised by phone. This is a common way to scare people.",
    ),
    # Secrecy
    Rule(
        "secrecy", STRONG,
        _words(
            r"keep (this|it) (a )?secret", r"between us", r"don'?t tell (anyone|the (bank|branch|staff))",
            r"do not tell (anyone|the (bank|branch|staff))", r"don'?t (call|contact) the bank",
            r"don'?t tell your (children|family|kids)",
        ),
        "Asking you to keep a secret is a common way to stop you from getting help.",
    ),
    Rule(
        "secrecy", WEAK,
        _words(r"don'?t tell", r"do not tell"),
        "If someone asks you not to tell others, it's worth double-checking with someone you trust.",
    ),
    # Prizes and refunds
    Rule(
        "prize", WEAK,
        _words(r"you('ve| have) won", r"winner", r"prize", r"lottery", r"sweepstakes"),
        "Unexpected prizes are a classic hook to get your money or details.",
    ),
    Rule(
        "prize", STRONG,
        _words(
            r"(claim|release|collect) your (reward|refund|prize|winnings)",
            r"(due|eligible for|entitled to) a (tax )?(rebate|refund)",
            r"(owed|entitled to) (compensation|a payout)",
        ),
        "You never have to pay or hand over details to receive a real prize or refund.",
    ),
    # New phone number / moving the conversation
    Rule(
        "new_contact", STRONG,
        _words(
            r"(this is )?my new number", r"new number", r"(lost|dropped|broke) my phone",
            r"my phone (broke|is broken|stopped working)",
            r"(using|on|texting from) a friend'?s( phone)?",
        ),
        "Messages from a \"new number\" are a common family scam. Call the person "
        "on the number you already have to check it's really them.",
    ),
    Rule(
        "new_contact", WEAK,
        _words(r"message me (on|via) (WhatsApp|Telegram|Signal)", r"wrong number"),
        "Scammers often start with a friendly message from a stranger or move you "
        "to another app.",
    ),
    # Offers that are too good to be true
    Rule(
        "unrealistic_offer", STRONG,
        re.compile(
            r"\b(earn|make|get paid)\b[^.!?\n]{0,30}?\d[\d,]*[^.!?\n]{0,15}?\b"
            r"(a|per|each) (day|week)\b|\bdaily\b(?=[^.!?\n]{0,30}\bpaid)|"
            r"\bget paid \S+ (GBP|USD|dollars|pounds) daily\b|"
            r"[$£]\d[\d,]*\+? (a|per) (day|week)\b|\bno experience (needed|required)\b|"
            r"\bguaranteed \d+% (monthly |weekly )?returns?\b|\bdouble (it|your money)\b|"
            r"\bunlock your commission\b|\bearn thousands\b|"
            r"\b(secret|trick) (banks|doctors|experts|they) don'?t want you to know\b",
            re.IGNORECASE,
        ),
        "Jobs and investments that promise easy, guaranteed money are almost always scams.",
    ),
    # Taking over your computer
    Rule(
        "remote_access", STRONG,
        _words(
            r"remote access", r"AnyDesk", r"TeamViewer",
            r"(computer|pc|laptop|router|device|phone|mac) (has been|is) (hacked|infected)",
            r"infected with a virus", r"\d+ viruses? (found|detected)",
            r"do not (turn off your (computer|pc)|close this (window|page))",
            r"connect to your (computer|pc|laptop)",
        ),
        "Real tech companies don't contact you about viruses or ask to control "
        "your computer. Hang up or close the page.",
    ),
    # A link you're told to activate by replying
    Rule(
        "link", STRONG,
        _words(r"reply (y|yes)\b[^.!?\n]{0,20}?(activate|enable|unlock)[^.!?\n]{0,10}?link"),
        "Replying makes the link clickable. Scammers use this trick to get past "
        "your phone's protections.",
    ),
)


# --- Scoring ------------------------------------------------------------------

def check_text(text: str) -> TextCheckResult:
    found: list[tuple[RedFlagType, int, re.Match[str], str]] = []
    for rule in RULES:
        for m in rule.pattern.finditer(text):
            found.append((rule.type, rule.weight, m, rule.explanation))
    for weight, m, explanation in _link_flags(text):
        found.append(("link", weight, m, explanation))

    # One flag per stretch of text: keep the strongest when rules overlap.
    found.sort(key=lambda f: (f[2].start(), -f[1], -(f[2].end() - f[2].start())))
    kept: list[tuple[RedFlagType, int, re.Match[str], str]] = []
    for f in found:
        if kept and f[2].start() < kept[-1][2].end():
            if f[1] > kept[-1][1]:
                kept[-1] = f
            continue
        kept.append(f)

    strongest: dict[str, int] = {}
    for kind, weight, _, _ in kept:
        strongest[kind] = max(strongest.get(kind, 0), weight)
    score = sum(strongest.values())

    flags = [
        RedFlag(type=kind, start=m.start(), end=m.end(), explanation=explanation)
        for kind, _, m, explanation in kept
    ]

    if score >= HIGH_AT:
        risk, message = (
            "high",
            "This message has several warning signs of a scam. Don't reply, click "
            "or pay. Check with someone you trust first.",
        )
    elif score >= MEDIUM_AT:
        risk, message = (
            "medium",
            "This message has a warning sign. Take your time and check it with "
            "someone you trust before doing anything.",
        )
    elif flags:
        risk, message = (
            "low",
            "We didn't find strong warning signs, but we've highlighted a few things "
            "worth a second look. If something feels wrong, trust that feeling.",
        )
    else:
        risk, message = (
            "low",
            "We didn't find common warning signs, but scams can still look normal. "
            "If something feels wrong, trust that feeling.",
        )
    return TextCheckResult(risk=risk, red_flags=flags, message=message)
