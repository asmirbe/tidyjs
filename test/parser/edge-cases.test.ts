import { ImportParser } from '../../src/parser';
import { Config } from '../../src/types';

describe('ImportParser - Edge Cases and Corner Cases', () => {
  const basicConfig: Config = {
    groups: [
      {
        name: 'Default',
        order: 1,
        isDefault: true
      }
    ],
    importOrder: {
      default: 1,
      named: 1,
      typeOnly: 1,
      sideEffect: 1
    },
    format: {
      onSave: true
    }
  };

  let parser: ImportParser;

  beforeEach(() => {
    parser = new ImportParser(basicConfig);
  });

  test('should handle import statements with comments', () => {
    const sourceCode = `
      // Import React for components
      import React from "react";
      /* Import utilities
         for helper functions */
      import { utils } from "./utils";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(2);
    expect(result.groups[0].imports[0].source).toBe('react');
    expect(result.groups[0].imports[1].source).toBe('./utils');
  });

  test('should handle multiline import statements', () => {
    const sourceCode = `
      import {
        useState,
        useEffect,
        useCallback,
        useMemo
      } from "react";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports[0].type).toBe('named');
    expect(result.groups[0].imports[0].specifiers).toHaveLength(4);
    expect(result.groups[0].imports[0].specifiers).toContain('useState');
    expect(result.groups[0].imports[0].specifiers).toContain('useEffect');
    expect(result.groups[0].imports[0].specifiers).toContain('useCallback');
    expect(result.groups[0].imports[0].specifiers).toContain('useMemo');
  });

  test('should handle imports with trailing commas', () => {
    const sourceCode = `
      import {
        useState,
        useEffect,
      } from "react";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports[0].specifiers).toHaveLength(2);
    expect(result.groups[0].imports[0].specifiers).toContain('useState');
    expect(result.groups[0].imports[0].specifiers).toContain('useEffect');
  });

  test('should handle imports with renamed default exports', () => {
    const sourceCode = `
      import { default as React } from "react";
      import { default as ReactDOM } from "react-dom";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(2);
    expect(result.groups[0].imports[0].type).toBe('named');
    expect(result.groups[0].imports[0].specifiers).toContain('default');
    expect(result.groups[0].imports[1].specifiers).toContain('default');
  });

  test('should handle very long module paths', () => {
    const longPath = 'very/long/path/that/goes/deep/into/nested/directories/and/keeps/going/module';
    const sourceCode = `import module from "${longPath}";`;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports[0].source).toBe(longPath);
  });

  test('should handle imports with special characters in module names', () => {
    const sourceCode = `
      import module1 from "@scope/package-name";
      import module2 from "package_with_underscores";
      import module3 from "package.with.dots";
      import module4 from "package-with-dashes";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(4);
    expect(result.groups[0].imports[0].source).toBe('@scope/package-name');
    expect(result.groups[0].imports[1].source).toBe('package_with_underscores');
    expect(result.groups[0].imports[2].source).toBe('package.with.dots');
    expect(result.groups[0].imports[3].source).toBe('package-with-dashes');
  });

  test('should handle imports with numeric module names', () => {
    const sourceCode = `
      import module1 from "package123";
      import module2 from "123package";
      import module3 from "pack4ge";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(3);
    expect(result.groups[0].imports[0].source).toBe('package123');
    expect(result.groups[0].imports[1].source).toBe('123package');
    expect(result.groups[0].imports[2].source).toBe('pack4ge');
  });

  test('should handle imports with file extensions', () => {
    const sourceCode = `
      import component from "./component.jsx";
      import styles from "./styles.css";
      import data from "./data.json";
      import worker from "./worker.js";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(4);
    expect(result.groups[0].imports[0].source).toBe('./component.jsx');
    expect(result.groups[0].imports[1].source).toBe('./styles.css');
    expect(result.groups[0].imports[2].source).toBe('./data.json');
    expect(result.groups[0].imports[3].source).toBe('./worker.js');
  });

  test('should handle imports with query parameters', () => {
    const sourceCode = `
      import worker from "./worker?worker";
      import styles from "./styles.css?inline";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(2);
    expect(result.groups[0].imports[0].source).toBe('./worker?worker');
    expect(result.groups[0].imports[1].source).toBe('./styles.css?inline');
  });

  test('should handle mixed quote styles', () => {
    const sourceCode = `
      import module1 from 'single-quotes';
      import module2 from "double-quotes";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(2);
    expect(result.groups[0].imports[0].source).toBe('single-quotes');
    expect(result.groups[0].imports[1].source).toBe('double-quotes');
  });

  test('should handle imports with whitespace variations', () => {
    const sourceCode = `
      import   React   from   "react"  ;
      import{useState,useEffect}from"react";
      import * as Utils from "./utils";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(3);
    expect(result.groups[0].imports[0].source).toBe('react');
    expect(result.groups[0].imports[1].source).toBe('react');
    expect(result.groups[0].imports[2].source).toBe('./utils');
  });

  test('should handle empty import lists', () => {
    const sourceCode = `
      import {} from "empty-imports";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports[0].type).toBe('named');
    expect(result.groups[0].imports[0].specifiers).toHaveLength(0);
  });

  test('should handle complex nested imports', () => {
    const sourceCode = `
      import DefaultExport, {
        namedExport1,
        namedExport2 as renamed,
        namedExport3
      } from "complex-module";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports[0].type).toBe('mixed');
    expect(result.groups[0].imports[0].defaultImport).toBe('DefaultExport');
    expect(result.groups[0].imports[0].specifiers).toContain('namedExport1');
    expect(result.groups[0].imports[0].specifiers).toContain('namedExport2');
    expect(result.groups[0].imports[0].specifiers).toContain('namedExport3');
  });

  test('should handle imports at different code positions', () => {
    const sourceCode = `
      "use strict";
      
      import React from "react";
      
      const someCode = true;
      
      // This would normally be invalid, but we test parser behavior
      import { utils } from "./utils";
    `;
    
    const result = parser.parse(sourceCode);
    
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].imports).toHaveLength(2);
  });

  test('should preserve exact import raw text', () => {
    const sourceCode = `import React from "react";`;
    
    const result = parser.parse(sourceCode);
    
    expect(result.originalImports).toHaveLength(1);
    expect(result.originalImports[0]).toContain('import React from "react"');
    expect(result.groups[0].imports[0].raw).toContain('import React from "react"');
  });
});