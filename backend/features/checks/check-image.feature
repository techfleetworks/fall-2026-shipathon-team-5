Feature: Check a picture
  An older adult uploads a picture and learns what its own data says about how
  it was made, in plain language, with clues to look at. When there's no
  evidence, they're told so honestly and pointed to other checks.
  Pictures are never stored.

  @audience:visitor @usecase:image-ai-credentials @category:happy @quality:functional @severity:critical
  Scenario: A picture whose Content Credentials say it was made with AI
    Given a visitor has the test picture "ai_generated.jpg"
    When they upload it for checking
    Then the verdict is "likely_ai"
    And a clue mentions "Example Image Generator"
    And they receive a plain-language message

  @audience:visitor @usecase:image-untrusted-signer @category:edge @quality:security @severity:critical
  Scenario: Credentials from a signer we don't recognise are flagged as unconfirmed
    Given a visitor has the test picture "camera.jpg"
    When they upload it for checking
    Then the verdict is "uncertain"
    And the content credentials status is "untrusted_signer"
    And a clue mentions "we don't recognise the signer"

  @audience:visitor @usecase:image-tampered-credentials @category:adverse @quality:security @severity:critical
  Scenario: A picture changed after it was signed is not trusted
    Given a visitor has the test picture "tampered.jpg"
    When they upload it for checking
    Then the verdict is "uncertain"
    And the content credentials status is "invalid"
    And a clue mentions "changed after it was signed"

  @audience:visitor @usecase:image-no-credentials @category:happy @quality:functional @severity:critical
  Scenario: A picture with no record gets an honest "can't tell"
    Given a visitor has a PNG picture
    When they upload it for checking
    Then the verdict is "uncertain"
    And no estimate is given
    And a clue mentions "reverse image search"
    And they receive a plain-language message

  @audience:visitor @usecase:image-ai-label @category:happy @quality:functional @severity:high
  Scenario: A picture with a hidden "made with AI" label
    Given a visitor has the test picture "xmp_ai_tag.jpg"
    When they upload it for checking
    Then the verdict is "likely_ai"
    And a clue mentions "aren't signed"

  @audience:visitor @usecase:image-wrong-type @category:negative @quality:security @severity:high
  Scenario: A file that only pretends to be a picture is refused
    Given a visitor has a PDF file named "photo.png"
    When they upload it for checking
    Then the request is refused with status 415

  @audience:visitor @usecase:image-too-large @category:empty-overflow @quality:security @severity:high
  Scenario: A picture over the size limit is refused
    Given a visitor has a picture larger than the size limit
    When they upload it for checking
    Then the request is refused with status 413
