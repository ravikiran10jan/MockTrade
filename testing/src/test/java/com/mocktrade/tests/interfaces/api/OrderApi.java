package com.mocktrade.tests.interfaces.api;

import com.mocktrade.tests.wrappers.RestAssuredWrapper;
import io.restassured.response.Response;

import java.util.Collections;
import java.util.Map;

/**
 * API interface for Order operations
 */
public class OrderApi {
    
    private final RestAssuredWrapper client;
    
    public OrderApi(RestAssuredWrapper client) {
        this.client = client;
    }
    
    /**
     * Create a new order
     */
    public Response createOrder(Map<String, Object> orderPayload) {
        return client.post("/orders/", orderPayload);
    }
    
    /**
     * Get all orders
     */
    public Response getOrders() {
        return client.get("/orders/");
    }
    
    /**
     * Get a specific order by ID
     */
    public Response getOrderById(String orderId) {
        return client.get("/orders/" + orderId);
    }
    
    /**
     * Cancel an order
     */
    public Response cancelOrder(String orderId) {
        return client.post("/orders/" + orderId + "/cancel", null);
    }
    
    /**
     * Simulate fill for an order
     */
    public Response simulateFill(String orderId) {
        return client.post("/orders/" + orderId + "/simulate_fill", null);
    }
    
    /**
     * Create a strategy order
     */
    public Response createStrategyOrder(Map<String, Object> strategyOrderPayload) {
        return client.post("/orders/strategy", strategyOrderPayload);
    }
}
