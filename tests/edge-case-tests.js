/**
 * Edge case tests for the import formatter
 * This tests more complex scenarios that might break the formatter
 */

// Reuse mock setup from the main test framework
const { mockVscode, createMockConfig, runTests } = require('./utils');

// Override require to return our mock when 'vscode' is requested
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  if (args[0] === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, args);
};

// Define edge case test scenarios
const edgeCases = [
  {
    name: 'handles partially broken imports with missing closing brace',
    input: `import React from 'react';
import {
  useState,
  useEffect,
from 'react';
import { YpButton } from 'ds';`,
    expected: `// Misc
import React from 'react';
import { useState, useEffect } from 'react';

// DS
import { YpButton } from 'ds';

`
  },
  {
    name: 'handles imports with multiple empty lines between them',
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
    name: 'handles type imports with complex type parameters',
    input: `import type { FC<Props>, ReactNode, PropsWithChildren<T extends unknown> } from 'react';
import { useState } from 'react';
import type { ButtonProps, Variant } from 'ds';`,
    expected: `// Misc
import { useState } from 'react';
import type { FC<Props>, PropsWithChildren<T extends unknown>, ReactNode } from 'react';

// DS
import type { ButtonProps, Variant } from 'ds';

`
  },
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
    name: 'handles imports with trailing commas',
    input: `import React, { 
  useState, 
  useEffect, 
} from 'react';
import { 
  YpButton, 
  YpModal,
} from 'ds';`,
    expected: `// Misc
import React, {
    useEffect,
    useState
} from 'react';

// DS
import {
    YpButton,
    YpModal
} from 'ds';

`
  },
  {
    name: 'handles imports mixed with code',
    input: `import React from 'react';
const x = 1;
import { useState } from 'react';
function test() {}
import { YpButton } from 'ds';`,
    expected: `// Misc
import React from 'react';
import { useState } from 'react';

// DS
import { YpButton } from 'ds';

const x = 1;
function test() {}`
  },
  {
    name: 'handles imports with renamed variables',
    input: `import React from 'react';
import { useState as useStateHook, useEffect as useEffectHook } from 'react';
import { YpButton as Button } from 'ds';`,
    expected: `// Misc
import React from 'react';
import { useEffect as useEffectHook, useState as useStateHook } from 'react';

// DS
import { YpButton as Button } from 'ds';

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

// Create a function to run these edge case tests
function runEdgeCaseTests() {
  console.log('Running edge case tests for import formatter...\n');
  
  try {
    // Load formatter module after mocking vscode
    const formatter = require('../out/formatter');
    const mockConfig = createMockConfig();
    
    let passed = 0;
    let failed = 0;
    
    edgeCases.forEach((testCase, index) => {
      const testNumber = index + 1;
      
      try {
        const result = formatter.formatImports(testCase.input, mockConfig);
        
        if (result === testCase.expected) {
          passed++;
          console.log(`✅ Edge case ${testNumber}: ${testCase.name}`);
        } else {
          failed++;
          console.log(`❌ Edge case ${testNumber}: ${testCase.name}`);
          console.log(`Input:\n${testCase.input}\n`);
          console.log(`Expected:\n${testCase.expected}\n`);
          console.log(`Actual:\n${result}\n`);
          
          // Show line-by-line diff
          const expectedLines = testCase.expected.split('\n');
          const actualLines = result.split('\n');
          const maxLines = Math.max(expectedLines.length, actualLines.length);
          
          console.log('Line-by-line comparison:');
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
        failed++;
        console.log(`❌ Edge case ${testNumber}: ${testCase.name} (Error)`);
        console.log(error);
      }
    });
    
    console.log(`\nEdge Case Test Results: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  } catch (error) {
    console.error('Failed to load formatter module:', error);
    return { passed: 0, failed: edgeCases.length };
  }
}

// Run the edge case tests
const results = runEdgeCaseTests();

// Restore original require
Module.prototype.require = originalRequire;

// Exit with error code if any tests failed
if (results.failed > 0) {
  process.exit(1);
}