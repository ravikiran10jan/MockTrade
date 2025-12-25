package com.mocktrade.tests.runners;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;

/**
 * TestNG runner for Cucumber tests
 * Generates TestNG HTML reports with detailed test execution results
 */
@CucumberOptions(
        features = "src/test/resources/features",
        glue = {"com.mocktrade.tests.steps"},
        tags = "@smoke",
        plugin = {
                "pretty",
                "html:target/cucumber-reports/cucumber-html-report.html",
                "json:target/cucumber-reports/cucumber.json",
                "junit:target/cucumber-reports/cucumber.xml",
                "testng:target/cucumber-reports/cucumber-testng.xml"
        },
        monochrome = true,
        publish = false
)
public class TestNGRunner extends AbstractTestNGCucumberTests {
    
    /**
     * Enable parallel execution of scenarios
     * @return Cucumber scenarios as TestNG data
     */
    @Override
    @DataProvider(parallel = false)
    public Object[][] scenarios() {
        return super.scenarios();
    }
}
