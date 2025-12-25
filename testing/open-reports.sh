#!/bin/bash
# Script to open test reports in browser

echo "Opening TestNG Reports..."
echo "=========================="
echo ""

# Check if reports exist
if [ ! -d "target/surefire-reports" ]; then
    echo "Error: No test reports found. Please run 'mvn test' first."
    exit 1
fi

# Open TestNG HTML report
if [ -f "target/surefire-reports/index.html" ]; then
    echo "Opening TestNG HTML Report..."
    open target/surefire-reports/index.html
else
    echo "Warning: TestNG index.html not found"
fi

# Open Emailable report
if [ -f "target/surefire-reports/emailable-report.html" ]; then
    echo "Opening TestNG Emailable Report..."
    open target/surefire-reports/emailable-report.html
else
    echo "Warning: Emailable report not found"
fi

# Open Cucumber HTML report
if [ -f "target/cucumber-reports/cucumber-html-report.html" ]; then
    echo "Opening Cucumber HTML Report..."
    open target/cucumber-reports/cucumber-html-report.html
else
    echo "Warning: Cucumber HTML report not found"
fi

echo ""
echo "Reports opened in your default browser!"
echo ""
echo "Available reports:"
echo "  - TestNG HTML Report: target/surefire-reports/index.html"
echo "  - TestNG Emailable Report: target/surefire-reports/emailable-report.html"
echo "  - Cucumber HTML Report: target/cucumber-reports/cucumber-html-report.html"
echo "  - TestNG XML Results: target/surefire-reports/testng-results.xml"
echo "  - Cucumber JSON: target/cucumber-reports/cucumber.json"
