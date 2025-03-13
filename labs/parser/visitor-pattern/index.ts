import * as ts from 'typescript';
import { EnhancedImportParser, createConditionalGroups } from './parser';

/**
 * Demo to show the enhanced import formatter in action
 */
function runImportFormatterDemo() {
  // Example TypeScript code with various import styles
  const sampleCode = `
// External libraries
import React, { useState, useEffect, type FC, useCallback, /* important hook */ useRef } from 'react';
import * as lodash from 'lodash';
import axios from 'axios'; // HTTP client

// Design system components
import { Button, Card, Modal } from 'ds';

// Internal modules
import { 
  getUser, 
  updateUser, 
  type UserProfile,
  type UserPreferences
} from '@core/user';
import type { Theme, ColorScheme } from '@core/theme';
import { formatDate } from '@library/date-utils';
import { logger } from '@library/logging';

// Utilities
import { sanitize, escape, type HtmlOptions } from 'yutils/html';
import { debounce } from 'yutils/performance';

// Styles
import './styles.css';

// This is not an import
const Component = () => {
  // Component code...
};
  `;

  // Create source file
  const sourceFile = ts.createSourceFile(
    'sample.ts',
    sampleCode,
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

  // Create parser with all the enhanced features
  const parser = new EnhancedImportParser({
    importGroups: [
      { name: 'External', regex: /^(react|lodash|axios)$/, order: 1 },
      { name: 'Design System', regex: /^ds$/, order: 2 },
      { name: 'Core', regex: /^@core/, order: 3 },
      { name: 'Library', regex: /^@library/, order: 4 },
      { name: 'Utils', regex: /^yutils/, order: 5 },
      { name: 'Styles', regex: /\.css$/, order: 6 },
    ],
    sortImports: true,
    preserveComments: true,
    maxLineLength: 80,
    indentSize: 2,
    useTypeOnlyWhenPossible: true,
    useSingleQuotes: true,
    useMultipleLines: true,
    emptyLinesBetweenGroups: 1,
    conditionalGroups: createConditionalGroups()
  });

  // Process imports
  const formattedImports = parser.parse(sourceFile);
  console.log(`Processed ${formattedImports.length} formatted imports`);

  // Generate formatted code
  const formattedCode = parser.generateFormattedCode();
  
  console.log('\n--- Original Imports ---\n');
  console.log(sampleCode);
  
  console.log('\n--- Formatted Imports ---\n');
  console.log(formattedCode);

  // Show detailed analysis of what was processed
  console.log('\n--- Import Analysis ---\n');
  
  const groupedByModule = new Map<string, FormattedImport[]>();
  for (const imp of formattedImports) {
    if (!groupedByModule.has(imp.moduleName)) {
      groupedByModule.set(imp.moduleName, []);
    }
    groupedByModule.get(imp.moduleName)!.push(imp);
  }
  
  for (const [module, imports] of groupedByModule.entries()) {
    console.log(`Module: ${module}`);
    console.log(`  Group: ${imports[0].group.name}`);
    console.log(`  Import types: ${imports.map(i => i.isTypeImport ? 'type' : 'regular').join(', ')}`);
    
    for (const imp of imports) {
      console.log(`  Names: ${imp.importNames.join(', ')}`);
      console.log(`  Default import: ${imp.isDefaultImport}`);
      console.log(`  Named imports: ${imp.hasNamedImports}`);
      console.log(`  Statement: ${imp.statement}`);
      console.log();
    }
  }
}

// Run the demo
runImportFormatterDemo();

// Sample type definition to resolve imports in the demo
interface FormattedImport {
  statement: string;
  group: { name: string; order: number; regex: RegExp };
  moduleName: string;
  importNames: string[];
  isTypeImport: boolean;
  isDefaultImport: boolean;
  hasNamedImports: boolean;
}