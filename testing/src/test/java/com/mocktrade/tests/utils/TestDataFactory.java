package com.mocktrade.tests.utils;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Factory for creating test data objects
 */
public class TestDataFactory {
    
    /**
     * Create a simple order payload
     */
    public static Map<String, Object> createSimpleOrder(String side, String instrumentId, 
                                                        int qty, double price, 
                                                        String traderId, String accountId) {
        Map<String, Object> order = new HashMap<>();
        order.put("instrument", instrumentId);
        order.put("side", side.toUpperCase());
        order.put("qty", qty);
        order.put("price", price);
        order.put("type", "LIMIT");
        order.put("tif", "DAY");
        order.put("trader", traderId);
        order.put("account", accountId);
        return order;
    }
    
    /**
     * Create a simple order with default trader and account
     */
    public static Map<String, Object> createSimpleOrder(String side, String symbol, int qty, double price) {
        // Get default trader and account from config or use hardcoded test values
        String defaultTraderId = Config.getProperty("default.trader.id", "d168e0c6-0cc2-49ec-81b1-484ffd4e24e5");
        String defaultAccountId = Config.getProperty("default.account.id", "a6e7a42b-5812-4b8a-99ec-7f5d2e8d441a");
        
        Map<String, Object> order = new HashMap<>();
        order.put("instrument", getInstrumentIdBySymbol(symbol));
        order.put("side", side.toUpperCase());
        order.put("qty", qty);
        order.put("price", price);
        order.put("type", "LIMIT");
        order.put("tif", "DAY");
        order.put("trader", defaultTraderId);
        order.put("account", defaultAccountId);
        return order;
    }
    
    /**
     * Map symbol to instrument ID (for known test instruments)
     */
    private static String getInstrumentIdBySymbol(String symbol) {
        Map<String, String> symbolToId = new HashMap<>();
        symbolToId.put("AAPL", "25473d66-8d9a-4cb6-b084-54f1b1286c9a");
        symbolToId.put("GOOGL", "d2a9b71c-22c3-4c5e-881c-9db9e280717f");
        symbolToId.put("MSFT", "43fb5465-4535-4064-bd5e-9eb81a2a9bf1");
        symbolToId.put("TSLA", "190310b3-1948-44fd-88eb-7f1a5d3aabab");
        
        return symbolToId.getOrDefault(symbol, symbolToId.get("AAPL")); // Default to AAPL
    }
    
    /**
     * Create login credentials
     */
    public static Map<String, String> createLoginCredentials(String username, String password) {
        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", username);
        credentials.put("password", password);
        return credentials;
    }
    
    /**
     * Generate a random unique ID
     */
    public static String generateUniqueId() {
        return UUID.randomUUID().toString();
    }
}
