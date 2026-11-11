Feature: Check a picture
  An older adult uploads a picture and gets a plain-language estimate of
  whether it was computer-made, with clues to look at. Pictures are never stored.

  @audience:visitor @usecase:image-checked @category:happy @quality:functional @severity:critical
  Scenario: A valid picture gets an estimate with clues
    Given a visitor has a PNG picture
    When they upload it for checking
    Then they receive an estimate between 0 and 1
    And they receive at least one clue with an explanation
    And they receive a plain-language message

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
