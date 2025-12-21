Feature: User Authentication
  As a user of MockTrade
  I want to be able to login to the system
  So that I can access my trading account

  Background:
    Given the API is available

  @smoke @login
  Scenario: API is accessible without authentication
    Given the API is available
    Then the API response status should be 200

  @login
  Scenario: Authenticated user can access protected resources
    Given I am authenticated as "TRADER001"
    When I create a BUY order for "AAPL" with quantity 10 and price 150.00
    Then the order should be created successfully
