package com.mocktrade.tests.utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Configuration utility for managing test environment settings
 */
public class Config {
    
    private static final String DEFAULT_BASE_URL = "http://localhost:8000";
    private static final String DEFAULT_BASE_PATH = "/api/v1";
    
    private static Properties properties;
    
    static {
        properties = new Properties();
        // Load from config.properties if exists, otherwise use defaults
        try {
            properties.load(new FileInputStream("src/test/resources/config.properties"));
        } catch (IOException e) {
            // Use defaults
            System.out.println("Using default configuration");
        }
    }
    
    public static String getBaseUrl() {
        return properties.getProperty("base.url", DEFAULT_BASE_URL);
    }
    
    public static String getBasePath() {
        return properties.getProperty("base.path", DEFAULT_BASE_PATH);
    }
    
    public static Map<String, String> getDefaultHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        return headers;
    }
    
    public static int getDefaultTimeout() {
        return Integer.parseInt(properties.getProperty("default.timeout", "30000"));
    }
    
    public static String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}
