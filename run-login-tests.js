#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running LoginApi Tests...\n');

// Test configurations
const testConfigs = [
    {
        name: 'All LoginApi Tests',
        command: 'npx playwright test tests/api/login.spec.ts',
        description: 'Run all LoginApi tests'
    },
    {
        name: 'LoginApi Tests with UI',
        command: 'npx playwright test tests/api/login.spec.ts --headed',
        description: 'Run tests with browser UI'
    },
    {
        name: 'LoginApi Tests with Debug',
        command: 'npx playwright test tests/api/login.spec.ts --debug',
        description: 'Run tests in debug mode'
    },
    {
        name: 'LoginApi Tests with Report',
        command: 'npx playwright test tests/api/login.spec.ts --reporter=html',
        description: 'Generate HTML report'
    }
];

// Function to run a test configuration
function runTest(config) {
    console.log(`📋 ${config.name}`);
    console.log(`   ${config.description}`);
    console.log(`   Command: ${config.command}\n`);

    try {
        execSync(config.command, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(`✅ ${config.name} completed successfully!\n`);
    } catch (error) {
        console.log(`❌ ${config.name} failed!\n`);
    }
}

// Function to show menu
function showMenu() {
    console.log('🔧 LoginApi Test Runner');
    console.log('========================\n');

    testConfigs.forEach((config, index) => {
        console.log(`${index + 1}. ${config.name}`);
        console.log(`   ${config.description}\n`);
    });

    console.log('0. Run all tests\n');
}

// Main execution
if (process.argv.includes('--all')) {
    console.log('Running all test configurations...\n');
    testConfigs.forEach(runTest);
} else if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showMenu();
    console.log('Usage:');
    console.log('  node run-login-tests.js --all     # Run all test configurations');
    console.log('  node run-login-tests.js --help    # Show this help');
    console.log('  npx playwright test tests/api/login.spec.ts  # Run tests directly');
} else {
    showMenu();
    console.log('💡 Tip: Use --all to run all test configurations');
    console.log('💡 Tip: Use --help to see available options');
} 