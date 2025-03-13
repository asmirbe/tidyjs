import * as ts from 'typescript';
import { performance } from 'perf_hooks';
import { FormattedImport, ImportGroup } from '../../../src/types';
import { parseImports } from './original'; // Original implementation
import { ImportParser } from './improved'; // Alternative 1
import { parseImportsStream } from './stream'; // Alternative 2

// Sample test file content with various import styles
const testFileContent = `
import React, { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import * as lodash from 'lodash';
import defaultExport from './local/module';
import { something as somethingElse } from './utils';
import type { Type1, Type2 } from './types';
import { regular, type TypeImport } from './mixed';
import './styles.css';

// Code starts here
const Component = () => {
  // ...
};
`;

// Define import groups for testing
const testImportGroups: ImportGroup[] = [
  { name: 'React', regex: /^react$/, order: 1 },
  { name: 'Libraries', regex: /^[a-z@]/, order: 2 },
  { name: 'Local', regex: /^\./, order: 3 }
];

// Fixed type definition for the parser function
type ParserFunction = (
  importNodes: ts.ImportDeclaration[], 
  sourceFile: ts.SourceFile, 
  importGroups?: ImportGroup[]
) => FormattedImport[];

// Function to run a performance test
function runPerformanceTest(
  name: string,
  parserFn: ParserFunction,
  iterations: number = 1000
): void {
  console.log(`\n--- Testing ${name} ---`);

  // Create source file from test content
  const sourceFile = ts.createSourceFile(
    'test.ts',
    testFileContent,
    ts.ScriptTarget.Latest,
    true
  );

  // Find all import declarations
  const importNodes: ts.ImportDeclaration[] = [];
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      importNodes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  console.log(`Found ${importNodes.length} import declarations`);

  // Validate parser functionality first
  const result = parserFn(importNodes, sourceFile, testImportGroups);
  console.log(`Parsed ${result.length} formatted imports`);
  
  // Log the first result to verify correctness
  if (result.length > 0) {
    console.log('All parsed imports:');
    result.forEach((item, index) => {
      console.log(`Import ${index + 1}:`, {
        moduleName: item.moduleName,
        group: item.group.name,
        importNames: item.importNames,
        isTypeImport: item.isTypeImport
      });
    });
  }

  // Measure performance
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    parserFn(importNodes, sourceFile, testImportGroups);
  }
  
  const end = performance.now();
  const duration = end - start;
  
  console.log(`Time for ${iterations} iterations: ${duration.toFixed(2)}ms`);
  console.log(`Average per iteration: ${(duration / iterations).toFixed(3)}ms`);
}

// Create wrapper functions to match the ParserFunction type
const originalParserWrapper: ParserFunction = (nodes, file, groups) => {
  return parseImports(nodes, file);
};

const visitorPatternWrapper: ParserFunction = (nodes, file, groups) => {
  const parser = new ImportParser(groups);
  return parser.parse(file);
};

const streamProcessingWrapper: ParserFunction = (nodes, file, groups) => {
  return parseImportsStream(nodes, file);
};

// Test the original implementation
runPerformanceTest('Original Parser', originalParserWrapper);

// Test Alternative 1: Visitor Pattern
runPerformanceTest('Visitor Pattern Parser', visitorPatternWrapper);

// Test Alternative 2: Stream Processing
runPerformanceTest('Stream Processing Parser', streamProcessingWrapper);



// Summary
console.log('\n--- Key Improvements Summary ---');
console.log('0. Original Code:');
console.log('   - Kinda working but not very efficient');
console.log('\n1. Visitor Pattern (Alternative 1):');
console.log('   - Better encapsulation through class-based design');
console.log('   - More maintainable with dedicated methods for each responsibility');
console.log('   - Improved type safety and modularity');
console.log('\n2. Stream Processing (Alternative 2):');
console.log('   - Functional approach with immutable transformations');
console.log('   - Cleaner data flow with explicit input/output');
console.log('   - Better memory efficiency by avoiding unnecessary objects');
console.log('   - Reduced cyclomatic complexity through smaller functions');