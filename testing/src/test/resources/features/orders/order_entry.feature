Feature: Order Entry
  As a trader
  I want to create and manage orders
  So that I can execute trades

  Background:
    Given the API is available
    And I am authenticated as "TRADER001"

  @smoke @order
  Scenario: Create a simple BUY order
    When I create a BUY order for "AAPL" with quantity 100 and price 150.50
    Then the order should be created successfully
    And the order status should be "NEW"
    And the order should have BUY side
    And the order should have quantity 100
    And the order should have price 150.50
    And I should see the order in the order list

  @smoke @order
  Scenario: Create a simple SELL order
    When I create a SELL order for "GOOGL" with quantity 50 and price 2800.00
    Then the order should be created successfully
    And the order status should be "NEW"
    And the order should have SELL side
    And the order should have quantity 50

  @order
  Scenario: Create and cancel an order
    When I create a BUY order for "MSFT" with quantity 25 and price 350.00
    Then the order should be created successfully
    When I cancel the order
    Then the order should be cancelled
    And the order status should be "CANCELLED"

  @order @fill
  Scenario: Create and fill an order
    When I create a BUY order for "TSLA" with quantity 10 and price 800.00
    Then the order should be created successfully
    When I simulate a fill for that order
    Then the order should be filled
    And the order status should be "FILLED"

  @order
  Scenario Outline: Create orders for different instruments
    When I create a <Side> order for "<Instrument>" with quantity <Quantity> and price <Price>
    Then the order should be created successfully
    And the order should have <Side> side

    Examples:
      | Side | Instrument | Quantity | Price  |
      | BUY  | AAPL       | 100      | 150.00 |
      | SELL | GOOGL      | 50       | 2800.0 |
      | BUY  | MSFT       | 75       | 350.00 |
      | SELL | TSLA       | 20       | 800.00 |
