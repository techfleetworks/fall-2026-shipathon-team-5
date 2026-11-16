Feature: Check a suspicious message
  An older adult pastes a message they received and learns which parts are
  common scam warning signs, explained in plain language.

  @audience:visitor @usecase:scam-message-flagged @category:happy @quality:functional @severity:critical
  Scenario: A message with several scam warning signs is rated high risk
    Given a visitor pastes the message "URGENT: your bank account is blocked. Pay a fee with a gift card immediately at www.bank-secure-login.com"
    When they check the message
    Then the risk is "high"
    And the warning signs include "urgency", "payment" and "link"
    And each warning sign comes with a plain-language explanation

  @audience:visitor @usecase:ordinary-message @category:happy @quality:functional @severity:high
  Scenario: An ordinary message has no warning signs
    Given a visitor pastes the message "Hi Grandma, see you at lunch on Sunday. I'll bring the dessert."
    When they check the message
    Then the risk is "low"
    And no warning signs are shown

  @audience:visitor @usecase:message-too-short @category:boundary @quality:functional @severity:medium
  Scenario: A message that is too short is refused with a helpful note
    Given a visitor pastes the message "hello"
    When they check the message
    Then the request is refused with status 422
    And the visitor is asked to paste the whole message

  @audience:visitor @usecase:message-too-long @category:empty-overflow @quality:security @severity:high
  Scenario: A very long message is refused so the service stays available
    Given a visitor pastes a message longer than the allowed length
    When they check the message
    Then the request is refused with status 422

  @audience:visitor @usecase:too-many-checks @category:adverse @quality:reliability @severity:high
  Scenario: A visitor who runs too many checks is kindly asked to wait
    Given a visitor has already used all their checks for this minute
    When they check the message
    Then the request is refused with status 429
    And the visitor is asked to wait a minute

  @audience:visitor @usecase:genuine-security-code @category:edge @quality:functional @severity:high
  Scenario: A genuine security code message is not treated as a scam
    Given a visitor pastes the message "Your verification code is 482913. We will never call you to ask for this code. Do not share it with anyone."
    When they check the message
    Then the risk is "low"
    And no warning signs are shown

  @audience:visitor @usecase:lookalike-web-address @category:negative @quality:security @severity:critical
  Scenario: A fake company web address without www or https is flagged
    Given a visitor pastes the message "EE: we failed to take payment for your bill. Update your account to avoid disconnection: ee-billing.example"
    When they check the message
    Then the risk is "high"
    And the warning signs include "link" and "urgency"

  @audience:visitor @usecase:single-everyday-word @category:edge @quality:functional @severity:medium
  Scenario: One everyday word on its own doesn't raise a warning
    Given a visitor pastes the message "I paid you back for the concert tickets through Venmo, thanks again!"
    When they check the message
    Then the risk is "low"
