import * as ts from 'typescript';
import { FormattedImport, ImportGroup } from '../../../src/types';

// Configuration interface for the parser
export interface ImportParserConfig {
  importGroups: ImportGroup[];
  sortImports: boolean;
  preserveComments: boolean;
  maxLineLength: number;
  indentSize: number;
  useTypeOnlyWhenPossible: boolean;
  useSingleQuotes: boolean;
  useMultipleLines: boolean;
  emptyLinesBetweenGroups: number;
  conditionalGroups?: ConditionalGroupRule[];
}

// Default configuration
const DEFAULT_CONFIG: ImportParserConfig = {
  importGroups: [
    { name: 'Misc', regex: /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  sortImports: true,
  preserveComments: true,
  maxLineLength: 100,
  indentSize: 2,
  useTypeOnlyWhenPossible: true,
  useSingleQuotes: true,
  useMultipleLines: true,
  emptyLinesBetweenGroups: 1,
  conditionalGroups: []
};

// Interface for conditional grouping rules
export interface ConditionalGroupRule {
  name: string;
  condition: () => boolean;
  order: number;
}

// Interface to store import comment data
interface ImportCommentData {
  leadingComments: string[];
  trailingComments: string[];
  inlineComments: Map<string, string>; // Maps import name to its inline comment
}

// Type for a comment range in source code
type CommentRange = {
  pos: number;
  end: number;
  text: string;
  isLeading: boolean;
  isTrailing: boolean;
};

/**
 * Parse imports from an array of import declarations using a stream processing approach
 */
export function parseImportsStream(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
  configOptions: Partial<ImportParserConfig> = {}
): FormattedImport[] {
  // Input validation
  if (!importNodes?.length || !sourceFile) {
    return [];
  }

  // Merge provided config with defaults
  const config: ImportParserConfig = { ...DEFAULT_CONFIG, ...configOptions };
  
  try {
    // Create a group resolver with memoization
    const importGroupCache = new Map<string, ImportGroup>();
    const resolveGroup = createGroupResolver(config.importGroups, config.conditionalGroups ?? [], importGroupCache);
    
    // Extract comments if needed
    const commentMap = config.preserveComments 
      ? extractAllComments(importNodes, sourceFile)
      : new Map<string, ImportCommentData>();
    
    // Process import nodes into raw FormattedImports
    const rawImports = importNodes
      .filter(node => node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier))
      .flatMap(node => processImportDeclaration(node, sourceFile, resolveGroup));
    
    // Apply a series of transformations as a pipeline
    return rawImports
      .pipe(imports => consolidateTypeImportsIfNeeded(imports, config))
      .pipe(imports => sortImportsIfNeeded(imports, config))
      .pipe(imports => formatMultiLineImportsIfNeeded(imports, config, commentMap))
      .pipe(imports => addEmptyLinesBetweenGroups(imports, config));
  } catch (error) {
    console.error(`Error in parseImportsStream: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

/**
 * Utility to create a pipeline operator for arrays
 */
declare global {
  interface Array<T> {
    pipe<U>(fn: (arr: Array<T>) => Array<U>): Array<U>;
  }
}

if (!Array.prototype.pipe) {
  Array.prototype.pipe = function<T, U>(fn: (arr: T[]) => U[]): U[] {
    return fn(this);
  };
}

/**
 * Create a resolver function for import groups with memoization
 */
function createGroupResolver(
  importGroups: ImportGroup[],
  conditionalGroups: ConditionalGroupRule[],
  cache: Map<string, ImportGroup>
): (moduleName: string, importNames: string[]) => ImportGroup {
  return (moduleName: string, importNames: string[]): ImportGroup => {
    const cacheKey = `${moduleName}:${importNames.join(',')}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    // Try conditional grouping first
    if (conditionalGroups.length > 0) {
      for (const rule of conditionalGroups) {
        if (rule.condition(moduleName)) {
          const group = {
            name: rule.name,
            regex: new RegExp(''), // Dummy regex
            order: rule.order
          };
          cache.set(cacheKey, group);
          return group;
        }
      }
    }
    
    // Fall back to regex pattern matching
    const group = importGroups.find(g => g.regex.test(moduleName)) ?? 
      { name: 'Misc', regex: /.*/, order: 999 };
    
    cache.set(cacheKey, group);
    return group;
  };
}

/**
 * Extract comments from import declarations
 */
function extractAllComments(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile
): Map<string, ImportCommentData> {
  const commentMap = new Map<string, ImportCommentData>();
  const fullText = sourceFile.getFullText();
  
  for (const node of importNodes) {
    if (!ts.isStringLiteral(node.moduleSpecifier)) continue;
    
    const moduleName = node.moduleSpecifier.text;
    
    // Initialize comment data for this module
    if (!commentMap.has(moduleName)) {
      commentMap.set(moduleName, {
        leadingComments: [],
        trailingComments: [],
        inlineComments: new Map()
      });
    }
    
    const commentData = commentMap.get(moduleName)!;
    
    // Get leading comments
    const leadingComments = ts.getLeadingCommentRanges(fullText, node.pos) ?? [];
    for (const comment of leadingComments) {
      const commentText = fullText.substring(comment.pos, comment.end);
      commentData.leadingComments.push(commentText);
    }
    
    // Get trailing comments
    const trailingComments = ts.getTrailingCommentRanges(fullText, node.end) ?? [];
    for (const comment of trailingComments) {
      const commentText = fullText.substring(comment.pos, comment.end);
      commentData.trailingComments.push(commentText);
    }
    
    // Process inline comments for named imports
    if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const element of node.importClause.namedBindings.elements) {
        const importName = element.propertyName 
          ? `${element.propertyName.text} as ${element.name.text}`
          : element.name.text;
        
        // Check for trailing comment after this named import
        const inlineComments = ts.getTrailingCommentRanges(fullText, element.end) ?? [];
        
        if (inlineComments.length > 0) {
          const commentText = fullText.substring(inlineComments[0].pos, inlineComments[0].end);
          commentData.inlineComments.set(importName, commentText);
        }
      }
    }
  }
  
  return commentMap;
}

/**
 * Process a single import declaration into FormattedImport objects
 */
function processImportDeclaration(
  node: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  resolveGroup: (moduleName: string, importNames: string[]) => ImportGroup
): FormattedImport[] {
  // Skip invalid nodes
  if (!ts.isStringLiteral(node.moduleSpecifier)) {
    return [];
  }
  
  const moduleName = node.moduleSpecifier.text;
  const statement = sourceFile.text.substring(node.getStart(sourceFile), node.getEnd());
  
  // Side-effect import (import 'module')
  if (!node.importClause) {
    const group = resolveGroup(moduleName, []);
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
  
  const { importNames, typeImportNames, isTypeImport, isDefaultImport, hasNamedImports } = 
    extractImportNamesFromClause(node.importClause, sourceFile);
  
  const result: FormattedImport[] = [];
  
  // Regular import
  if (importNames.length > 0) {
    const group = resolveGroup(moduleName, importNames);
    result.push({
      statement,
      group,
      moduleName,
      importNames,
      isTypeImport,
      isDefaultImport,
      hasNamedImports
    });
  }
  
  // Type import
  if (typeImportNames.length > 0) {
    const typeGroup = resolveGroup(moduleName, typeImportNames);
    const typeStatement = `import type { ${typeImportNames.join(', ')} } from '${moduleName}';`;
    
    result.push({
      statement: typeStatement,
      group: typeGroup,
      moduleName,
      importNames: typeImportNames,
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
function extractImportNamesFromClause(
  importClause: ts.ImportClause,
  sourceFile: ts.SourceFile
): {
  importNames: string[];
  typeImportNames: string[];
  isTypeImport: boolean;
  isDefaultImport: boolean;
  hasNamedImports: boolean;
} {
  const importNames: string[] = [];
  const typeImportNames: string[] = [];
  const isTypeImport = !!importClause.isTypeOnly;
  let isDefaultImport = false;
  let hasNamedImports = false;
  
  // Process default import
  if (importClause.name) {
    isDefaultImport = true;
    importNames.push(importClause.name.text);
  }
  
  // Process named or namespace imports
  if (importClause.namedBindings) {
    if (ts.isNamedImports(importClause.namedBindings)) {
      processNamedImportsStream(
        importClause.namedBindings, 
        sourceFile, 
        importNames, 
        typeImportNames
      );
      hasNamedImports = importNames.length > 0;
    } else if (ts.isNamespaceImport(importClause.namedBindings)) {
      importNames.push(`* as ${importClause.namedBindings.name.text}`);
      hasNamedImports = true;
    }
  }
  
  return {
    importNames,
    typeImportNames,
    isTypeImport,
    isDefaultImport,
    hasNamedImports
  };
}

/**
 * Process named imports and separate regular and type imports
 */
function processNamedImportsStream(
  namedBindings: ts.NamedImports,
  sourceFile: ts.SourceFile,
  importNames: string[],
  typeImportNames: string[]
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
      typeImportNames.push(importName);
    } else {
      importNames.push(importName);
    }
  }
}

/**
 * Consolidate imports where all named imports are types if configured
 */
function consolidateTypeImportsIfNeeded(
  imports: FormattedImport[], 
  config: ImportParserConfig
): FormattedImport[] {
  if (!config.useTypeOnlyWhenPossible) {
    return imports;
  }
  
  // Group imports by module name
  const moduleMap = new Map<string, FormattedImport[]>();
  
  imports.forEach(imp => {
    if (!moduleMap.has(imp.moduleName)) {
      moduleMap.set(imp.moduleName, []);
    }
    moduleMap.get(imp.moduleName)!.push(imp);
  });
  
  // Process each module's imports
  const result: FormattedImport[] = [];
  
  moduleMap.forEach((moduleImports, moduleName) => {
    // Skip if there's just one import statement for this module
    if (moduleImports.length === 1) {
      result.push(moduleImports[0]);
      return;
    }
    
    // Check if all named imports are type imports
    const hasOnlyTypes = moduleImports.every(imp => 
      imp.isTypeImport ?? !imp.hasNamedImports);
    
    const defaultImport = moduleImports.find(imp => imp.isDefaultImport);
    const typeImports = moduleImports.filter(imp => imp.isTypeImport);
    const regularImports = moduleImports.filter(imp => !imp.isTypeImport);
    
    if (hasOnlyTypes && regularImports.length > 0 && typeImports.length > 0) {
      // Consolidate all into a type-only import
      const allImportNames = moduleImports.flatMap(imp => imp.importNames);
      const group = moduleImports[0].group;
      
      // Generate a consolidated statement
      const namedImports = allImportNames
        .filter(name => !name.startsWith('default as '))
        .sort()
        .join(', ');
      
      const defaultName = defaultImport 
        ? defaultImport.importNames.find(name => !name.includes(' as ')) 
        : null;
      
      const quoteChar = config.useSingleQuotes ? "'" : '"';
      
      let statement = 'import type ';
      if (defaultName) {
        statement += `${defaultName}`;
        if (namedImports) {
          statement += `, { ${namedImports} }`;
        }
      } else if (namedImports) {
        statement += `{ ${namedImports} }`;
      }
      statement += ` from ${quoteChar}${moduleName}${quoteChar};`;
      
      result.push({
        statement,
        group,
        moduleName,
        importNames: allImportNames,
        isTypeImport: true,
        isDefaultImport: !!defaultImport,
        hasNamedImports: namedImports.length > 0
      });
    } else {
      // Just add all existing imports
      result.push(...moduleImports);
    }
  });
  
  return result;
}

/**
 * Sort imports if configured
 */
function sortImportsIfNeeded(
  imports: FormattedImport[], 
  config: ImportParserConfig
): FormattedImport[] {
  if (!config.sortImports) {
    return imports;
  }
  
  return [...imports].sort((a, b) => {
    // First sort by group order
    if (a.group.order !== b.group.order) {
      return a.group.order - b.group.order;
    }
    
    // Then by module name
    if (a.moduleName !== b.moduleName) {
      return a.moduleName.localeCompare(b.moduleName);
    }
    
    // Type imports come after regular imports from the same module
    if (a.isTypeImport !== b.isTypeImport) {
      return a.isTypeImport ? 1 : -1;
    }
    
    // Default imports come before named imports
    if (a.isDefaultImport !== b.isDefaultImport) {
      return a.isDefaultImport ? -1 : 1;
    }
    
    return 0;
  });
}

/**
 * Format imports with many named imports into multi-line format if configured
 */
function formatMultiLineImportsIfNeeded(
  imports: FormattedImport[], 
  config: ImportParserConfig,
  commentMap: Map<string, ImportCommentData>
): FormattedImport[] {
  if (!config.useMultipleLines) {
    return imports;
  }
  
  return imports.map(imp => {
    // Skip imports without named imports or with few names
    if (!imp.hasNamedImports || imp.importNames.length <= 3) {
      return imp;
    }
    
    // Generate a well-formatted multi-line statement
    const quoteChar = config.useSingleQuotes ? "'" : '"';
    const indent = ' '.repeat(config.indentSize);
    
    let statement = imp.isTypeImport ? 'import type ' : 'import ';
    
    // Handle default import
    const namedImports = imp.importNames.filter(name => !name.startsWith('*'));
    const namespaceImport = imp.importNames.find(name => name.startsWith('*'));
    
    const defaultImport = imp.isDefaultImport 
      ? namedImports.shift() 
      : null;
    
    if (defaultImport) {
      statement += `${defaultImport}`;
      if (namedImports.length > 0) {
        statement += ', ';
      }
    }
    
    if (namespaceImport) {
      statement += `${namespaceImport} `;
    } else if (namedImports.length > 0) {
      // Format named imports on multiple lines
      statement += '{\n';
      
      // Add each import on its own line
      for (const name of namedImports.sort()) {
        let importLine = `${indent}${name}`;
        
        // Add inline comment if exists
        if (config.preserveComments) {
          const moduleData = commentMap.get(imp.moduleName);
          if (moduleData && moduleData.inlineComments.has(name)) {
            importLine += ` ${moduleData.inlineComments.get(name)}`;
          }
        }
        
        statement += `${importLine},\n`;
      }
      
      statement += '}';
    }
    
    statement += ` from ${quoteChar}${imp.moduleName}${quoteChar};`;
    
    // Add leading/trailing comments if preserving
    if (config.preserveComments) {
      const moduleData = commentMap.get(imp.moduleName);
      if (moduleData) {
        // Add leading comments
        if (moduleData.leadingComments.length > 0) {
          statement = moduleData.leadingComments.join('\n') + '\n' + statement;
        }
        
        // Add trailing comments
        if (moduleData.trailingComments.length > 0) {
          statement += ' ' + moduleData.trailingComments.join(' ');
        }
      }
    }
    
    return {
      ...imp,
      statement
    };
  });
}

/**
 * Mark imports that should have empty lines before them
 */
function addEmptyLinesBetweenGroups(
  imports: FormattedImport[], 
  config: ImportParserConfig
): FormattedImport[] {
  if (imports.length <= 1 || config.emptyLinesBetweenGroups <= 0) {
    return imports;
  }
  
  return imports.map((imp, index) => {
    if (index === 0) return imp;
    
    const prevImport = imports[index - 1];
    if (prevImport.group.name !== imp.group.name) {
      // Add empty lines property to mark where spacing should be added
      return {
        ...imp,
        emptyLinesBefore: config.emptyLinesBetweenGroups
      } as FormattedImport & { emptyLinesBefore: number };
    }
    
    return imp;
  });
}

/**
 * Generate formatted code from the processed imports
 */
export function generateFormattedCode(
  imports: FormattedImport[]
): string {
  if (imports.length === 0) {
    return '';
  }
  
  return imports
    .map((imp) => {
      const emptyLines = (imp as any).emptyLinesBefore 
        ? '\n'.repeat((imp as any).emptyLinesBefore) 
        : '';
      
      return emptyLines + imp.statement;
    })
    .join('\n') + '\n';
}

/**
 * Example usage of conditional groups
 */
export function createConditionalGroups(): ConditionalGroupRule[] {
  return [
    // Group React hooks together
    {
      name: 'React Hooks',
      order: 2,
      condition: (moduleName, importNames) => {
        return moduleName === 'react' && 
          importNames.some(name => name.startsWith('use') && name[3] === name[3].toUpperCase());
      }
    },
    // Group type definitions from @types packages
    {
      name: 'Type Definitions',
      order: 10,
      condition: (moduleName, importNames) => {
        return moduleName.startsWith('@types/') ?? 
          (importNames.length > 0 && importNames.every(name => /^[A-Z]/.test(name)));
      }
    }
  ];
}