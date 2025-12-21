# MockTrade API Test Automation Framework

## Overview
BDD-style API test automation framework for MockTrade using:
- **Cucumber** for BDD (Gherkin feature files)
- **Rest Assured** for API testing
- **JUnit** for test execution
- **Maven** for build and dependency management

## Architecture

The framework follows a layered architecture:

```
Features (Gherkin)
    ↓
Step Definitions (thin glue)
    ↓
Interface Layer (API clients)
    ↓
Wrapper Layer (Rest Assured wrapper)
    ↓
Utilities (config, data, assertions)
```

### Key Principles
- **Centralized reusable steps**: All generic steps in `CommonSteps.java`
- **No duplication**: Parameterized steps reused across features
- **Clean separation**: HTTP logic in wrappers, business logic in API interfaces

## Project Structure

```
testing/
├── pom.xml                                 # Maven configuration
├── src/test/
│   ├── java/com/mocktrade/tests/
│   │   ├── runners/
│   │   │   └── ApiTestRunner.java         # Cucumber runner
│   │   ├── steps/
│   │   │   └── CommonSteps.java           # Reusable step definitions
│   │   ├── interfaces/api/
│   │   │   ├── AuthApi.java               # Login/auth operations
│   │   │   └── OrderApi.java              # Order operations
│   │   ├── wrappers/
│   │   │   └── RestAssuredWrapper.java    # HTTP wrapper
│   │   └── utils/
│   │       ├── Config.java                # Configuration
│   │       ├── TestDataFactory.java       # Test data builders
│   │       └── AssertionUtils.java        # Common assertions
│   └── resources/
│       ├── features/
│       │   ├── auth/
│       │   │   └── login.feature          # Login scenarios
│       │   └── orders/
│       │       └── order_entry.feature    # Order entry scenarios
│       └── config.properties              # Test configuration
```

## Prerequisites

1. **Java 11+** installed
2. **Maven 3.6+** installed
3. **MockTrade backend** running on `http://localhost:8000`

## Running Tests

### Run all smoke tests
```bash
cd testing
mvn clean test
```

### Run specific tags
```bash
# Run only login tests
mvn clean test -Dcucumber.filter.tags="@login"

# Run only order tests
mvn clean test -Dcucumber.filter.tags="@order"

# Run smoke and order tests
mvn clean test -Dcucumber.filter.tags="@smoke and @order"
```

### Run all tests (not just smoke)
```bash
mvn clean test -Dcucumber.filter.tags=""
```

## Test Reports

After test execution, reports are generated in:
- **HTML Report**: `target/cucumber-reports/cucumber-html-report.html`
- **JSON Report**: `target/cucumber-reports/cucumber.json`
- **JUnit XML**: `target/cucumber-reports/cucumber.xml`

## Configuration

Edit `src/test/resources/config.properties` to change:
- Base URL
- Test credentials
- Default trader/account IDs
- Timeouts

## Phase 1 Implementation Status

✅ **Completed Components:**

1. **Utilities Layer**
   - Config management
   - Test data factory
   - Assertion utilities

2. **Wrapper Layer**
   - RestAssuredWrapper (centralized HTTP operations)

3. **Interface Layer**
   - AuthApi (login operations)
   - OrderApi (order CRUD operations)

4. **Step Definitions**
   - CommonSteps (centralized reusable steps)
   - Login steps
   - Order creation/management steps

5. **Feature Files**
   - login.feature (3 scenarios)
   - order_entry.feature (5 scenarios including data-driven)

6. **Test Runner**
   - ApiTestRunner configured for smoke tests

## Example Test Execution

```bash
# Ensure backend is running
cd /Users/ravikiranreddygajula/MockTrade
docker-compose up -d

# Run tests
cd testing
mvn clean test

# View report
open target/cucumber-reports/cucumber-html-report.html
```

## Adding New Tests

### 1. Create a new feature file
```gherkin
Feature: New Feature
  Scenario: Test scenario
    Given the API is available
    When I perform some action
    Then I should see expected result
```

### 2. Add steps to CommonSteps.java (if generic)
Or create a new step definition file for domain-specific steps.

### 3. Add API interface methods (if needed)
Add new methods to existing API classes or create new ones.

## Next Phases

- **Phase 2**: Trade lifecycle & audit trail tests
- **Phase 3**: Permissions & security tests
- **Phase 4**: CI/CD integration

## Tags Reference

- `@smoke`: Quick smoke tests
- `@login`: Authentication tests
- `@order`: Order-related tests
- `@fill`: Order fill tests
