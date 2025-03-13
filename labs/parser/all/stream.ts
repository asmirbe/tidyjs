
import * as ts from 'typescript';
import { FormattedImport, ImportGroup } from '../../../src/types';

const DEFAULT_IMPORT_GROUPS: ImportGroup[] = [
  { name: 'React', regex: /^react(-dom)?$/, order: 1 },
  { name: 'Node', regex: /^(fs|path|http|crypto)$/, order: 2 },
  { name: 'Third party', regex: /^(?!@\/).+/, order: 3 },
  { name: 'Absolute', regex: /^@\//, order: 4 },
  { name: 'Relative', regex: /^\.\.?\//, order: 5 }
];

/**
 * Functional import parser with stream processing approach
 */
export function parseImportsStream(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
): FormattedImport[] {
  // Input validation
  if (!importNodes?.length || !sourceFile) {
    return [];
  }

  const groups = DEFAULT_IMPORT_GROUPS;
  
  // Create a lookup map for faster import group resolution
  const importGroupMap = new Map<string, ImportGroup>();
  
  try {
    // Process each import declaration and transform it to FormattedImport objects
    return importNodes
      .filter(node => node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))
      .flatMap(node => {
        const moduleName = (node.moduleSpecifier as ts.StringLiteral).text;
        const group = resolveImportGroup(moduleName, groups, importGroupMap);
        
        return processImportDeclaration(node, sourceFile, moduleName, group);
      });
  } catch {
    return [];
  }
}

/**
 * Resolve the import group for a module with memoization
 */
function resolveImportGroup(
  moduleName: string, 
  groups: ImportGroup[], 
  cache: Map<string, ImportGroup>
): ImportGroup {
  if (cache.has(moduleName)) {
    return cache.get(moduleName)!;
  }
  
  const group = groups.find(g => g.regex.test(moduleName)) ?? { name: 'Misc', regex: /.*/, order: 0 };
  
  cache.set(moduleName, group);
  return group;
}

/**
 * Process a single import declaration node
 */
function processImportDeclaration(
  node: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  moduleName: string,
  group: ImportGroup
): FormattedImport[] {
  const statement = sourceFile.text.substring(
    node.getStart(sourceFile),
    node.getEnd()
  );
  
  const result: FormattedImport[] = [];
  
  if (!node.importClause) {
    // Side-effect import (import 'module')
    return [{
      statement,
      group,
      moduleName,
      importNames: [],
      isTypeImport: false,
      isDefaultImport: false,
      hasNamedImports: false
    }];
  }
  
  const importClause = node.importClause;
  const isTypeImport = !!importClause.isTypeOnly;
  
  // Process default, named, and namespace imports
  const { regularImports, typeImports, isDefaultImport, hasNamedImports } = 
    extractImportNames(importClause, sourceFile);
  
  // Create the main import if it contains regular names
  if (regularImports.size > 0) {
    result.push({
      statement,
      group,
      moduleName,
      importNames: Array.from(regularImports),
      isTypeImport,
      isDefaultImport,
      hasNamedImports
    });
  }
  
  // Create a separate import for inline types if needed
  if (typeImports.size > 0) {
    result.push({
      statement: `import type { ${Array.from(typeImports).join(', ')} } from '${moduleName}';`,
      group,
      moduleName,
      importNames: Array.from(typeImports),
      isTypeImport: true,
      isDefaultImport: false,
      hasNamedImports: true
    });
  }
  
  return result;
}

/**
 * Extract all import names from an import clause
 */
function extractImportNames(
  importClause: ts.ImportClause,
  sourceFile: ts.SourceFile
): {
  regularImports: Set<string>;
  typeImports: Set<string>;
  isDefaultImport: boolean;
  hasNamedImports: boolean;
} {
  const regularImports = new Set<string>();
  const typeImports = new Set<string>();
  let isDefaultImport = false;
  let hasNamedImports = false;
  
  // Process default import
  if (importClause.name) {
    isDefaultImport = true;
    regularImports.add(importClause.name.text);
  }
  
  // Process named or namespace imports
  if (importClause.namedBindings) {
    if (ts.isNamedImports(importClause.namedBindings)) {
      processNamedImportsStream(importClause.namedBindings, sourceFile, regularImports, typeImports);
      hasNamedImports = regularImports.size > 0;
    } else if (ts.isNamespaceImport(importClause.namedBindings)) {
      regularImports.add(`* as ${importClause.namedBindings.name.text}`);
      hasNamedImports = true;
    }
  }
  
  return { regularImports, typeImports, isDefaultImport, hasNamedImports };
}

/**
 * Process named imports into regular and type collections
 */
function processNamedImportsStream(
  namedBindings: ts.NamedImports,
  sourceFile: ts.SourceFile,
  regularImports: Set<string>,
  typeImports: Set<string>
): void {
  const TYPE_KEYWORD_REGEX = /^type\s+/;
  
  for (const element of namedBindings.elements) {
    const sourceText = sourceFile.text.substring(
      element.getStart(sourceFile),
      element.getEnd()
    );
    
    const importName = element.propertyName
      ? `${element.propertyName.text} as ${element.name.text}`
      : element.name.text;
    
    if (TYPE_KEYWORD_REGEX.test(sourceText)) {
      typeImports.add(importName);
    } else {
      regularImports.add(importName);
    }
  }
}