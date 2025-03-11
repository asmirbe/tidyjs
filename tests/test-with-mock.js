/**
 * Improved testing framework for VSCode extensions
 * This provides a more robust approach for testing the import formatter
 */

// Create a complete mock vscode module
const mockVscode = {
  window: {
    createOutputChannel: (name) => ({
      name,
      appendLine: () => {},
      show: () => {},
      dispose: () => {},
      clear: () => {},
      replace: () => {},
      append: () => {},
      hide: () => {}
    }),
    showErrorMessage: (msg) => console.error(`[VSCode Error]: ${msg}`),
    showInformationMessage: (msg) => console.log(`[VSCode Info]: ${msg}`)
  },
  workspace: {
    getConfiguration: (section) => ({
      get: (key) => {
        // Define extension configuration here
        const config = {
          importFormatter: {
            groups: [
              { name: 'Misc', regex: '^(react|react-.*|lodash)$', order: 0 },
              { name: 'DS', regex: '^ds$', order: 1 },
              { name: '@app', regex: '^@app$', order: 2 }
            ],
            alignmentSpacing: 1
          }
        };
        
        return config[section]?.[key] || null;
      }
    })
  },
  EventEmitter: class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    event = (listener) => {
      this.listeners.push(listener);
      return { dispose: () => {} };
    };
    fire = (data) => {
      this.listeners.forEach(listener => listener(data));
    };
  },
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  Range: class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
      this.start = { line: startLine, character: startCharacter };
      this.end = { line: endLine, character: endCharacter };
    }
  },
  commands: {
    registerCommand: (id, handler) => ({ 
      dispose: () => {},
      id,
      handler
    })
  }
};

// Create a more comprehensive formatter config with all required properties
const createMockConfig = () => ({
  importGroups: [
    { name: 'Misc', regex: /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@app', regex: /^@app/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  alignmentSpacing: 1,
  regexPatterns: {
    importLine: /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm,
    sectionComment: /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils|.*\b(?:misc|ds|dossier|client|notification|core|library|utils)\b.*)\s*$/gim,
    importFragment: /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/,
    sectionCommentPattern: /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils)/,
    anyComment: /^\s*\/\//,
    typeDeclaration: /^type\s+[A-Za-z0-9_]+(<.*>)?\s*=/,
    codeDeclaration: /^(interface|class|enum|function|const|let|var|export)\s+[A-Za-z0-9_]+/,
    orphanedFragments: /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm,
    possibleCommentFragment: /^\s*[a-z]{1,5}\s*$|^\s*\/?\s*[A-Z][a-z]+\s*$|(^\s*\/+\s*$)/,
    appSubfolderPattern: /^@app\/([a-zA-Z0-9_-]+)/
  }
});

// Override require to return our mock when 'vscode' is requested
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  if (args[0] === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, args);
};

// Helper function to run the tests with improved reporting
function runTests(testCases) {
  console.log('Running formatter tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: 0,
    details: []
  };

  // Load formatter module after mocking vscode
  const formatter = require('../out/formatter');
  const mockConfig = createMockConfig();

  testCases.forEach((testCase, index) => {
    const testNumber = index + 1;
    const testResult = {
      name: testCase.name,
      number: testNumber,
      status: 'pending'
    };

    try {
      const result = formatter.formatImports(testCase.input, mockConfig);
      
      if (result === testCase.expected) {
        testResult.status = 'passed';
        results.passed++;
        console.log(`✅ Test ${testNumber}: ${testCase.name}`);
      } else {
        testResult.status = 'failed';
        testResult.input = testCase.input;
        testResult.expected = testCase.expected;
        testResult.actual = result;
        results.failed++;
        console.log(`❌ Test ${testNumber}: ${testCase.name}`);
        console.log(`Input:\n${testCase.input}\n`);
        console.log(`Expected:\n${testCase.expected}\n`);
        console.log(`Actual:\n${result}\n`);
        
        // Show detailed diff to help identify issues
        console.log('Difference analysis:');
        const expectedLines = testCase.expected.split('\n');
        const actualLines = result.split('\n');
        const maxLines = Math.max(expectedLines.length, actualLines.length);
        
        for (let i = 0; i < maxLines; i++) {
          const expectedLine = expectedLines[i] || '';
          const actualLine = actualLines[i] || '';
          
          if (expectedLine !== actualLine) {
            console.log(`Line ${i + 1}:`);
            console.log(`  Expected: "${expectedLine}"`);
            console.log(`  Actual:   "${actualLine}"`);
          }
        }
      }
    } catch (error) {
      testResult.status = 'error';
      testResult.error = error;
      results.errors++;
      console.log(`❌ Test ${testNumber}: ${testCase.name} (Error)`);
      console.log(error);
    }

    results.details.push(testResult);
  });

  console.log(`\nTest Results: ${results.passed} passed, ${results.failed} failed, ${results.errors} errors`);
  
  // Return full results object for potential further processing
  return results;
}

// Load test cases from separate file or define them here
const testCases = [
  {
    name: 'should format basic imports',
    input: `import React from 'react';
import { useState } from 'react';
import { YpButton } from 'ds';`,
    expected: `// Misc
import { useState }  from 'react';
import React         from 'react';

// DS
import { YpButton }  from 'ds';

`
  },
  {
    name: 'should format type imports',
    input: `import type { FC } from 'react';
import { useState } from 'react';
import type { ButtonProps } from 'ds';`,
    expected: `// Misc
import type { FC }   from 'react';
import { useState }  from 'react';

// DS
import type { ButtonProps }  from 'ds';

`
  },
  {
    name: 'should format default and named imports',
    input: `import React, { useState, useEffect } from 'react';
import { YpButton, YpModal } from 'ds';
import utils from 'yutils';`,
    expected: `// Misc
import React from 'react';
import {
    useEffect,
    useState
}  from 'react';

// DS
import {
    YpButton,
    YpModal
}  from 'ds';

// Utils
import utils  from 'yutils';

`
  },
  {
    name: 'should format multi-line imports',
    input: `import {
  useState,
  useEffect,
  useContext
} from 'react';
import {
  YpButton,
  YpModal,
  YpInput
} from 'ds';`,
    expected: `// Misc
import {
    useContext,
    useEffect,
    useState
}  from 'react';

// DS
import {
    YpButton,
    YpInput,
    YpModal
}  from 'ds';

`
  },
  {
    name: 'should handle comments in imports',
    input: `// Misc
import React from 'react';
// DS components
import { YpButton } from 'ds';
// Utilities
import utils from 'yutils';`,
    expected: `// Misc
import React  from 'react';

// DS
import { YpButton }  from 'ds';

// Utils
import utils  from 'yutils';

`
  },
  {
    name: 'should handle app subfolder imports',
    input: `import { useState } from 'react';
import { YpButton } from 'ds';
import { getUser } from '@app/dossier/utils';
import { getConfig } from '@core/config';`,
    expected: `// Misc
import { useState } from 'react';

// DS
import { YpButton } from 'ds';

// @app/dossier
import { getUser } from '@app/dossier/utils';

// @core
import { getConfig } from '@core/config';

`
  },
  {
    name: 'should not modify files without imports',
    input: `const x = 1;
function test() {
  return x + 1;
}`,
    expected: `const x = 1;
function test() {
  return x + 1;
}`
  },
  {
    name: 'should format imports at the beginning of a file',
    input: `import React from 'react';
import { YpButton } from 'ds';

const Component = () => {
  return <YpButton>Click me</YpButton>;
};

export default Component;`,
    expected: `// Misc
import React from 'react';

// DS
import { YpButton } from 'ds';

const Component = () => {
  return <YpButton>Click me</YpButton>;
};

export default Component;`
  }
];

// Run the tests
const results = runTests(testCases);

// Restore the original require function to avoid affecting other modules
Module.prototype.require = originalRequire;

// You could potentially save test results to a file
// This would be useful for CI/CD pipelines
if (results.failed > 0 || results.errors > 0) {
  process.exit(1); // Exit with error code if any tests failed
}