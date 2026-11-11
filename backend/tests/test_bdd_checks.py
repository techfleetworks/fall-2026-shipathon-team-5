"""Runs the Gherkin scenarios in features/checks/ against the API."""

import re

import pytest
from pytest_bdd import given, parsers, scenarios, then, when

from app.config import get_settings
from tests.conftest import PNG_BYTES

scenarios("checks/check-text.feature", "checks/check-image.feature")


@pytest.fixture
def ctx() -> dict:
    return {}


# --- Messages ---------------------------------------------------------------

@given(parsers.parse('a visitor pastes the message "{text}"'))
def paste_message(ctx, text):
    ctx["text"] = text


@given("a visitor pastes a message longer than the allowed length")
def paste_long_message(ctx):
    ctx["text"] = "a" * (get_settings().max_text_chars + 1)


@given("a visitor has already used all their checks for this minute")
def use_up_checks(ctx, client):
    ctx["text"] = "Hi Grandma, see you at lunch on Sunday. I'll bring the dessert."
    allowed = int(get_settings().rate_limit.split("/")[0])
    for _ in range(allowed):
        assert client.post("/api/check-text", json={"text": ctx["text"]}).status_code == 200


@then("the visitor is asked to wait a minute")
def asked_to_wait(ctx):
    assert "wait a minute" in ctx["response"].json()["detail"]


@when("they check the message")
def check_message(ctx, client):
    ctx["response"] = client.post("/api/check-text", json={"text": ctx["text"]})


@then(parsers.parse('the risk is "{risk}"'))
def risk_is(ctx, risk):
    assert ctx["response"].status_code == 200
    assert ctx["response"].json()["risk"] == risk


@then(parsers.parse("the warning signs include {kinds}"))
def warning_signs_include(ctx, kinds):
    expected = set(re.findall(r'"(\w+)"', kinds))
    found = {f["type"] for f in ctx["response"].json()["red_flags"]}
    assert expected <= found


@then("each warning sign comes with a plain-language explanation")
def each_flag_explained(ctx):
    assert all(f["explanation"].strip() for f in ctx["response"].json()["red_flags"])


@then("no warning signs are shown")
def no_flags(ctx):
    assert ctx["response"].json()["red_flags"] == []


@then("the visitor is asked to paste the whole message")
def asked_for_whole_message(ctx):
    assert "whole message" in ctx["response"].json()["detail"]


# --- Pictures ---------------------------------------------------------------

@given("a visitor has a PNG picture")
def png_picture(ctx):
    ctx["upload"] = ("photo.png", PNG_BYTES, "image/png")


@given(parsers.parse('a visitor has a PDF file named "{name}"'))
def pdf_file(ctx, name):
    ctx["upload"] = (name, b"%PDF-1.7 fake", "image/png")


@given("a visitor has a picture larger than the size limit")
def large_picture(ctx):
    ctx["upload"] = ("big.png", PNG_BYTES + b"\x00" * get_settings().max_image_bytes, "image/png")


@when("they upload it for checking")
def upload(ctx, client):
    ctx["response"] = client.post("/api/check-image", files={"file": ctx["upload"]})


@then("they receive an estimate between 0 and 1")
def estimate_in_range(ctx):
    assert ctx["response"].status_code == 200
    assert 0 <= ctx["response"].json()["ai_likelihood"] <= 1


@then("they receive at least one clue with an explanation")
def has_clues(ctx):
    signals = ctx["response"].json()["signals"]
    assert signals and all(s["explanation"].strip() for s in signals)


@then("they receive a plain-language message")
def has_message(ctx):
    assert ctx["response"].json()["message"].strip()


# --- Shared -----------------------------------------------------------------

@then(parsers.parse("the request is refused with status {code:d}"))
def refused(ctx, code):
    assert ctx["response"].status_code == code
