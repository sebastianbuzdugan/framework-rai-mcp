const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const tests = [
  { name: 'Manifest Test', file: 'simple-test.js' },
  { name: 'Scan Project Test', file: 'scan-test.js' },
  { name: 'Generate Suggestions Test', file: 'suggestions-test.js' },
  { name: 'Analyze Model Test', file: 'analyze-test.js' },
  { name: 'Documentation Test', file: 'documentation-test.js' }
];

async function runTest(test) {
  console.log(`\n======== Running ${test.name} ========\n`);
  try {
    const { stdout, stderr } = await execPromise(`node ${test.file}`);
    if (stderr) {
      console.error(`Error in ${test.name}:`, stderr);
    }
    console.log(stdout);
    return true;
  } catch (error) {
    console.error(`Failed to run ${test.name}:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Starting MCP server tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await runTest(test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n======== Test Summary ========');
  console.log(`Total tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! The MCP server is working correctly.');
  } else {
    console.log(`\n❌ ${failed} test(s) failed. Please check the logs above for details.`);
  }
}

runAllTests();
