package com.mocktrade.tests.steps;

import com.mocktrade.tests.interfaces.api.AuthApi;
import com.mocktrade.tests.interfaces.api.OrderApi;
import com.mocktrade.tests.utils.AssertionUtils;
import com.mocktrade.tests.utils.TestDataFactory;
import com.mocktrade.tests.wrappers.RestAssuredWrapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.response.Response;

import java.util.Map;

/**
 * Centralized reusable step definitions
 * All generic, parameterized steps go here to avoid duplication
 */
public class CommonSteps {
    
    // Shared state across steps
    private final RestAssuredWrapper restClient;
    private final AuthApi authApi;
    private final OrderApi orderApi;
    
    private Response lastResponse;
    private String lastOrderId;
    private String lastTradeId;
    private String currentUsername;
    
    public CommonSteps() {
        this.restClient = new RestAssuredWrapper();
        this.authApi = new AuthApi(restClient);
        this.orderApi = new OrderApi(restClient);
    }
    
    // ============ Authentication Steps ============
    
    @Given("the API is available")
    public void theApiIsAvailable() {
        lastResponse = orderApi.getOrders();
        AssertionUtils.assertStatusCode(lastResponse, 200);
    }
    
    @Given("I am authenticated as {string}")
    public void iAmAuthenticatedAs(String username) {
        currentUsername = username;
        // For now, MockTrade doesn't require explicit login for API calls
        // This step is a placeholder for future auth token implementation
        System.out.println("Authenticated as: " + username);
    }
    
    @When("I login with username {string} and password {string}")
    public void iLoginWithUsernameAndPassword(String username, String password) {
        lastResponse = authApi.login(username, password);
        currentUsername = username;
    }
    
    @Then("the API response status should be {int}")
    public void theApiResponseStatusShouldBe(int expectedStatus) {
        AssertionUtils.assertStatusCode(lastResponse, expectedStatus);
    }
    
    @Then("I should be logged in successfully")
    public void iShouldBeLoggedInSuccessfully() {
        AssertionUtils.assertStatusCode(lastResponse, 200);
        AssertionUtils.assertResponseContainsField(lastResponse, "user");
    }
    
    @Then("I should see login error")
    public void iShouldSeeLoginError() {
        int statusCode = lastResponse.getStatusCode();
        org.junit.jupiter.api.Assertions.assertTrue(
            statusCode == 401 || statusCode == 403,
            "Expected 401 or 403 but got " + statusCode
        );
    }
    
    // ============ Order Creation Steps ============
    
    @When("I create a {word} order for {string} with quantity {int} and price {double}")
    public void iCreateAnOrderFor(String side, String symbol, int qty, double price) {
        Map<String, Object> orderPayload = TestDataFactory.createSimpleOrder(side, symbol, qty, price);
        lastResponse = orderApi.createOrder(orderPayload);
        
        AssertionUtils.assertStatusCode(lastResponse, 200);
        lastOrderId = lastResponse.jsonPath().getString("id");
        
        System.out.println("Created order: " + lastOrderId);
    }
    
    @When("I book a {word} order for {string} quantity {int} price {double}")
    public void iBookAnOrder(String side, String symbol, int qty, double price) {
        iCreateAnOrderFor(side, symbol, qty, price);
    }
    
    @Then("the order should be created successfully")
    public void theOrderShouldBeCreatedSuccessfully() {
        AssertionUtils.assertStatusCode(lastResponse, 200);
        AssertionUtils.assertResponseContainsField(lastResponse, "id");
        AssertionUtils.assertResponseFieldEquals(lastResponse, "status", "NEW");
    }
    
    @Then("I should see the order in the order list")
    public void iShouldSeeTheOrderInTheOrderList() {
        Response response = orderApi.getOrders();
        AssertionUtils.assertStatusCode(response, 200);
        
        String responseBody = response.getBody().asString();
        org.junit.jupiter.api.Assertions.assertTrue(
            responseBody.contains(lastOrderId),
            "Order " + lastOrderId + " not found in order list"
        );
    }
    
    @Then("the order status should be {string}")
    public void theOrderStatusShouldBe(String expectedStatus) {
        AssertionUtils.assertResponseFieldEquals(lastResponse, "status", expectedStatus);
    }
    
    @Then("the order should have {word} side")
    public void theOrderShouldHaveSide(String expectedSide) {
        AssertionUtils.assertResponseFieldEquals(lastResponse, "side", expectedSide.toUpperCase());
    }
    
    @Then("the order should have quantity {int}")
    public void theOrderShouldHaveQuantity(int expectedQty) {
        AssertionUtils.assertResponseFieldEquals(lastResponse, "qty", expectedQty);
    }
    
    @Then("the order should have price {double}")
    public void theOrderShouldHavePrice(double expectedPrice) {
        Object actualPriceObj = lastResponse.jsonPath().get("price");
        double actualPrice;
        
        if (actualPriceObj instanceof Integer) {
            actualPrice = ((Integer) actualPriceObj).doubleValue();
        } else if (actualPriceObj instanceof Float) {
            actualPrice = ((Float) actualPriceObj).doubleValue();
        } else if (actualPriceObj instanceof Double) {
            actualPrice = (Double) actualPriceObj;
        } else {
            throw new AssertionError("Unexpected price type: " + actualPriceObj.getClass());
        }
        
        org.junit.jupiter.api.Assertions.assertEquals(
            expectedPrice, 
            actualPrice, 
            0.01,
            "Expected price " + expectedPrice + " but got " + actualPrice
        );
    }
    
    // ============ Order Operations Steps ============
    
    @When("I cancel the order")
    public void iCancelTheOrder() {
        lastResponse = orderApi.cancelOrder(lastOrderId);
        AssertionUtils.assertStatusCode(lastResponse, 200);
    }
    
    @When("I simulate a fill for that order")
    public void iSimulateAFillForThatOrder() {
        lastResponse = orderApi.simulateFill(lastOrderId);
        AssertionUtils.assertStatusCode(lastResponse, 200);
    }
    
    @Then("the order should be cancelled")
    public void theOrderShouldBeCancelled() {
        AssertionUtils.assertResponseFieldEquals(lastResponse, "status", "CANCELLED");
    }
    
    @Then("the order should be filled")
    public void theOrderShouldBeFilled() {
        AssertionUtils.assertResponseFieldEquals(lastResponse, "status", "FILLED");
    }
    
    // ============ Utility Steps ============
    
    @Then("the response should contain field {string}")
    public void theResponseShouldContainField(String fieldPath) {
        AssertionUtils.assertResponseContainsField(lastResponse, fieldPath);
    }
    
    // ============ Getters for shared state ============
    
    public String getLastOrderId() {
        return lastOrderId;
    }
    
    public String getLastTradeId() {
        return lastTradeId;
    }
    
    public void setLastTradeId(String tradeId) {
        this.lastTradeId = tradeId;
    }
    
    public Response getLastResponse() {
        return lastResponse;
    }
    
    public void setLastResponse(Response response) {
        this.lastResponse = response;
    }
}
