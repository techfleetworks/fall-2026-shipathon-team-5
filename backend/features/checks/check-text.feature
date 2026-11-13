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
