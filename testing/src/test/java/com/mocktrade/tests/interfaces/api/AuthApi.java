package com.mocktrade.tests.interfaces.api;

import com.mocktrade.tests.wrappers.RestAssuredWrapper;
import io.restassured.response.Response;

import java.util.Map;

/**
 * API interface for Authentication operations
 */
public class AuthApi {
    
    private final RestAssuredWrapper client;
    
    public AuthApi(RestAssuredWrapper client) {
        this.client = client;
    }
    
    /**
     * Login with credentials
     */
    public Response login(Map<String, String> credentials) {
        return client.post("/auth/login", credentials);
    }
    
    /**
     * Login with username and password
     */
    public Response login(String username, String password) {
        Map<String, String> credentials = Map.of(
            "username", username,
            "password", password
        );
        return login(credentials);
    }
    
    /**
     * Logout
     */
    public Response logout() {
        return client.post("/auth/logout", null);
    }
    
    /**
     * Get current user info
     */
    public Response getCurrentUser() {
        return client.get("/auth/me");
    }
}
