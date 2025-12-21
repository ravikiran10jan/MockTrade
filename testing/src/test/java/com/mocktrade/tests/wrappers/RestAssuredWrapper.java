package com.mocktrade.tests.wrappers;

import com.mocktrade.tests.utils.Config;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.Collections;
import java.util.Map;

/**
 * Wrapper class for Rest Assured HTTP operations
 * Centralizes all HTTP mechanics: auth, headers, logging, etc.
 */
public class RestAssuredWrapper {
    
    static {
        RestAssured.baseURI = Config.getBaseUrl();
        RestAssured.basePath = Config.getBasePath();
    }
    
    /**
     * Build base request with common settings
     */
    private RequestSpecification getBaseRequest() {
        return RestAssured.given()
                .relaxedHTTPSValidation()
                .headers(Config.getDefaultHeaders())
                .log().ifValidationFails();
    }
    
    /**
     * GET request
     */
    public Response get(String path) {
        return get(path, Collections.emptyMap());
    }
    
    /**
     * GET request with query parameters
     */
    public Response get(String path, Map<String, ?> queryParams) {
        return getBaseRequest()
                .queryParams(queryParams)
                .when()
                .get(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
    
    /**
     * POST request with body
     */
    public Response post(String path, Object body) {
        return post(path, body, Collections.emptyMap());
    }
    
    /**
     * POST request with body and query parameters
     */
    public Response post(String path, Object body, Map<String, ?> queryParams) {
        RequestSpecification request = getBaseRequest()
                .queryParams(queryParams);
        
        if (body != null) {
            request = request.body(body);
        }
        
        return request
                .when()
                .post(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
    
    /**
     * PUT request with body
     */
    public Response put(String path, Object body) {
        return put(path, body, Collections.emptyMap());
    }
    
    /**
     * PUT request with body and query parameters
     */
    public Response put(String path, Object body, Map<String, ?> queryParams) {
        return getBaseRequest()
                .queryParams(queryParams)
                .body(body)
                .when()
                .put(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
    
    /**
     * DELETE request
     */
    public Response delete(String path) {
        return delete(path, Collections.emptyMap());
    }
    
    /**
     * DELETE request with query parameters
     */
    public Response delete(String path, Map<String, ?> queryParams) {
        return getBaseRequest()
                .queryParams(queryParams)
                .when()
                .delete(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
    
    /**
     * Add custom headers to request
     */
    public Response getWithHeaders(String path, Map<String, String> headers) {
        return getBaseRequest()
                .headers(headers)
                .when()
                .get(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
    
    /**
     * POST with custom headers
     */
    public Response postWithHeaders(String path, Object body, Map<String, String> headers) {
        RequestSpecification request = getBaseRequest()
                .headers(headers);
        
        if (body != null) {
            request = request.body(body);
        }
        
        return request
                .when()
                .post(path)
                .then()
                .log().ifValidationFails()
                .extract()
                .response();
    }
}
