package com.mocktrade.tests.utils;

import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;

/**
 * Utility for common test assertions
 */
public class AssertionUtils {
    
    /**
     * Assert response status code
     */
    public static void assertStatusCode(Response response, int expectedStatusCode) {
        int actualStatusCode = response.getStatusCode();
        Assertions.assertEquals(expectedStatusCode, actualStatusCode, 
            String.format("Expected status code %d but got %d. Response: %s", 
                expectedStatusCode, actualStatusCode, response.getBody().asString()));
    }
    
    /**
     * Assert response contains field
     */
    public static void assertResponseContainsField(Response response, String fieldPath) {
        Object fieldValue = response.jsonPath().get(fieldPath);
        Assertions.assertNotNull(fieldValue, 
            String.format("Expected field '%s' not found in response", fieldPath));
    }
    
    /**
     * Assert response field equals expected value
     */
    public static void assertResponseFieldEquals(Response response, String fieldPath, Object expectedValue) {
        Object actualValue = response.jsonPath().get(fieldPath);
        Assertions.assertEquals(expectedValue, actualValue,
            String.format("Expected field '%s' to be '%s' but got '%s'", 
                fieldPath, expectedValue, actualValue));
    }
    
    /**
     * Assert response body contains text
     */
    public static void assertResponseBodyContains(Response response, String text) {
        String body = response.getBody().asString();
        Assertions.assertTrue(body.contains(text),
            String.format("Expected response body to contain '%s' but it didn't", text));
    }
}
