"""Rule-based scam warning signs.

Each rule finds words that scammers commonly use and explains, in plain
language, why they are a warning sign. Rules are in English and tuned for
the US and UK; extend the lists as new scam patterns appear.
A machine-learning classifier can be added later on top of these rules.
"""

import re
from dataclasses import dataclass

from app.schemas import RedFlag, RedFlagType, TextCheckResult


@dataclass(frozen=True)
class Rule:
    type: RedFlagType
    pattern: re.Pattern[str]
    explanation: str


def _words(*phrases: str) -> re.Pattern[str]:
    return re.compile(r"\b(" + "|".join(phrases) + r")\b", re.IGNORECASE)


RULES: tuple[Rule, ...] = (
    Rule(
        "urgency",
        _words(
            r"urgent(ly)?", r"immediately", r"right now", r"within \d+ hours?",
            r"last chance", r"act now", r"final (notice|warning|reminder)",
            r"blocked", r"suspended", r"locked", r"frozen", r"expires? today",
        ),
        "Scammers try to rush you so you don't have time to think or ask someone.",
    ),
    Rule(
        "payment",
        _words(
            r"gift ?cards?", r"vouchers?", r"wire transfer", r"bank transfer",
            r"Western Union", r"MoneyGram", r"Zelle", r"Venmo", r"Cash ?App",
            r"bitcoin", r"crypto(currency)?", r"pay a (small )?fee",
            r"redelivery fee", r"safe account",
        ),
        "Real companies and family members rarely ask for payment this way.",
    ),
    Rule(
        "link",
        re.compile(r"\b(https?://\S+|www\.\S+|bit\.ly/\S+)", re.IGNORECASE),
        "Check where a link really goes before clicking. When in doubt, type the "
        "company's address yourself.",
    ),
    Rule(
        "secrecy",
        _words(
            r"don'?t tell", r"do not tell", r"keep (this|it) (a )?secret",
            r"between us", r"don'?t (call|contact) the bank",
        ),
        "Asking you to keep a secret is a common way to stop you from getting help.",
    ),
    Rule(
        "credentials",
        _words(
            r"password", r"passcode", r"verification code", r"one-time (pass)?code",
            r"(?-i:PIN)", r"security code", r"card details",
            r"social security number", r"National Insurance number",
        ),
        "Banks and real companies never ask for your password, codes or card "
        "details by message.",
    ),
    Rule(
        "prize",
        _words(
            r"you('ve| have) won", r"winner", r"prize", r"lottery",
            r"claim your (reward|refund)",
        ),
        "Unexpected prizes and refunds are a classic hook to get your money or details.",
    ),
)


def check_text(text: str) -> TextCheckResult:
    flags = [
        RedFlag(type=rule.type, start=m.start(), end=m.end(), explanation=rule.explanation)
        for rule in RULES
        for m in rule.pattern.finditer(text)
    ]
    flags.sort(key=lambda f: f.start)

    kinds = {f.type for f in flags}
    if len(kinds) >= 2:
        risk, message = (
            "high",
            "This message has several warning signs of a scam. Don't reply, click "
            "or pay. Check with someone you trust first.",
        )
    elif kinds:
        risk, message = (
            "medium",
            "This message has a warning sign. Take your time and check it with "
            "someone you trust before doing anything.",
        )
    else:
        risk, message = (
            "low",
            "We didn't find common warning signs, but scams can still look normal. "
            "If something feels wrong, trust that feeling.",
        )
    return TextCheckResult(risk=risk, red_flags=flags, message=message)
