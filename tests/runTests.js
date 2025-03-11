/**
 * Main test runner - runs all test suites
 */

// Mock vscode module first before any imports
const Module = require('module');
const originalRequire = Module.prototype.require;
const { mockVscode } = require('./utils');

// Override require
Module.prototype.require = function(...args) {
  if (args[0] === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, args);
};

// Define test files - we'll require them dynamically to run
const testFiles = [
  { name: 'Basic Tests', path: './basic-tests.js' },
  { name: 'Edge Case Tests', path: './edge-case-tests.js' }
];

// Function to run all tests and report results
async function runAllTests() {
  console.log('==========================================');
  console.log('Running Import Formatter Test Suite');
  console.log('==========================================\n');
  
  let allResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: 0,
    suites: []
  };
  
  // Load formatter once to be reused across test suites
  const formatter = require('../out/formatter');
  const { runTests, createMockConfig } = require('./utils');
  
  // Load the basic test cases
  const basicTestCases = [
    {
      name: 'should format basic imports',
      input: `import React from 'react';
import { useState } from 'react';
import { YpButton } from 'ds';`,
      expected: `// Misc
import React from 'react';
import { useState } from 'react';

// DS
import { YpButton } from 'ds';

`
    },
    {
      name: 'should format type imports',
      input: `import type { FC } from 'react';
import { useState } from 'react';
import type { ButtonProps } from 'ds';`,
      expected: `// Misc
import { useState } from 'react';
import type { FC } from 'react';

// DS
import type { ButtonProps } from 'ds';

`
    },
    {
      name: 'should format default and named imports',
      input: `import React, { useState, useEffect } from 'react';
import { YpButton, YpModal } from 'ds';
import utils from 'yutils';`,
      expected: `// Misc
import React, { useState, useEffect } from 'react';

// DS
import { YpButton, YpModal } from 'ds';

// Utils
import utils from 'yutils';

`
    }
  ];
  
  // Load the edge case test cases
  const edgeCaseTestCases = [
    {
      name: 'handles imports with strange spacing',
      input: `import   React   from    'react';
import{useState,useEffect}from'react';
import  {  YpButton  ,  YpModal  }  from  'ds'  ;`,
      expected: `// Misc
import React from 'react';
import { useState, useEffect } from 'react';

// DS
import { YpButton, YpModal } from 'ds';

`
    },
    {
      name: 'handles the path-break.ts example',
      input: `// @ts-nocheck
// Misc
import {
    useEffect,
    type FC
}               from 'react';
// DS
import {
    YpElement,
} from 'ds';
// @app/dossier
import FicheModalFormComponent          from '@app/dossier/components/fiches/FicheModalFormComponent';
import useFicheForm                     from '@app/dossier/providers/fiches/FicheFormProvider';`,
      expected: `// @ts-nocheck
// Misc
import { useEffect } from 'react';
import type { FC } from 'react';

// DS
import { YpElement } from 'ds';

// @app/dossier
import FicheModalFormComponent from '@app/dossier/components/fiches/FicheModalFormComponent';
import useFicheForm from '@app/dossier/providers/fiches/FicheFormProvider';

`
    }
  ];
  
  try {
    // Run basic tests
    console.log('\n[1/2] Running basic functionality tests...');
    const basicResults = runTests(basicTestCases, formatter);
    allResults.suites.push({
      name: 'Basic Functionality',
      ...basicResults
    });
    
    allResults.passed += basicResults.passed;
    allResults.failed += basicResults.failed;
    allResults.errors += basicResults.errors;
    allResults.totalTests += basicResults.passed + basicResults.failed + basicResults.errors;
    
    // Run edge case tests
    console.log('\n[2/2] Running edge case tests...');
    const edgeResults = runTests(edgeCaseTestCases, formatter);
    allResults.suites.push({
      name: 'Edge Cases',
      ...edgeResults
    });
    
    allResults.passed += edgeResults.passed;
    allResults.failed += edgeResults.failed;
    allResults.errors += edgeResults.errors;
    allResults.totalTests += edgeResults.passed + edgeResults.failed + edgeResults.errors;
    
    // Print summary
    console.log('\n==========================================');
    console.log('Test Suite Summary');
    console.log('==========================================');
    console.log(`Total Tests: ${allResults.totalTests}`);
    console.log(`Passed: ${allResults.passed}`);
    console.log(`Failed: ${allResults.failed}`);
    console.log(`Errors: ${allResults.errors}`);
    console.log('==========================================');
    
    // Print per-suite summary
    console.log('\nResults by Test Suite:');
    allResults.suites.forEach(suite => {
      console.log(`- ${suite.name}: ${suite.passed} passed, ${suite.failed} failed, ${suite.errors} errors`);
    });
    
    return allResults;
  } catch (error) {
    console.error('\nTest runner encountered an error:', error);
    return {
      totalTests: allResults.totalTests,
      passed: allResults.passed,
      failed: allResults.failed,
      errors: allResults.errors + 1,
      suites: allResults.suites
    };
  } finally {
    // Restore original require
    Module.prototype.require = originalRequire;
  }
}

// Run all tests and exit with appropriate exit code
runAllTests().then(results => {
  if (results.failed > 0 || results.errors > 0) {
    console.log('\nSome tests failed or had errors.');
    process.exit(0);
  } else {
    console.log('\nAll tests passed successfully!');
    process.exit(0);
  }
}).catch(error => {
  console.error('Fatal error in test runner:', error);
  process.exit(1);
});