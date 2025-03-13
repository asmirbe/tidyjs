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
  condition: (moduleName: string, importNames: string[]) => boolean;
  order: number;
}

// Interface to store import comment data
interface ImportCommentData {
  leadingComments: string[];
  trailingComments: string[];
  inlineComments: Map<string, string>; // Maps import name to its inline comment
}

/**
 * Enhanced import parser with advanced formatting features
 */
export class EnhancedImportParser {
  private readonly config: ImportParserConfig;
  private readonly importGroupCache = new Map<string, ImportGroup>();
  private readonly result: FormattedImport[] = [];
  private readonly commentMap = new Map<string, ImportCommentData>();
  
  constructor(config: Partial<ImportParserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Parse imports from TypeScript source
   */
  public parse(sourceFile: ts.SourceFile): FormattedImport[] {
    if (!sourceFile) {
      return [];
    }
    
    try {
      // Clear previous results
      this.result.length = 0;
      this.commentMap.clear();
      
      // Extract comments first if preserving comments
      if (this.config.preserveComments) {
        this.extractComments(sourceFile);
      }
      
      // Visit all nodes and process import declarations
      this.visitNode(sourceFile);
      
      // Apply post-processing (sorting, consolidation, etc.)
      return this.postProcessImports();
    } catch (error) {
      console.error(`Error in parse: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
  
  /**
   * Post-process imports (sort, consolidate types, etc.)
   */
  private postProcessImports(): FormattedImport[] {
    let processedImports = [...this.result];
    
    // Consolidate type-only imports if configured
    if (this.config.useTypeOnlyWhenPossible) {
      processedImports = this.consolidateTypeImports(processedImports);
    }
    
    // Sort imports if configured
    if (this.config.sortImports) {
      processedImports = this.sortImports(processedImports);
    }
    
    // Format multi-line imports if configured
    if (this.config.useMultipleLines) {
      processedImports = this.formatMultiLineImports(processedImports);
    }
    
    return processedImports;
  }
  
  /**
   * Sort imports by group order and then alphabetically by module name
   */
  private sortImports(imports: FormattedImport[]): FormattedImport[] {
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
   * Consolidate imports where all named imports are types
   */
  private consolidateTypeImports(imports: FormattedImport[]): FormattedImport[] {
    // Group imports by module name
    const moduleImports = new Map<string, FormattedImport[]>();
    
    for (const imp of imports) {
      if (!moduleImports.has(imp.moduleName)) {
        moduleImports.set(imp.moduleName, []);
      }
      moduleImports.get(imp.moduleName)!.push(imp);
    }
    
    const result: FormattedImport[] = [];
    
    // Process each module's imports
    for (const [moduleName, moduleImpList] of moduleImports.entries()) {
      // Skip if there's just one import statement for this module
      if (moduleImpList.length === 1) {
        result.push(moduleImpList[0]);
        continue;
      }
      
      // Check if all named imports are type imports
      const hasOnlyTypes = moduleImpList.every(imp => 
        imp.isTypeImport || !imp.hasNamedImports);
      
      const defaultImport = moduleImpList.find(imp => imp.isDefaultImport);
      const typeImports = moduleImpList.filter(imp => imp.isTypeImport);
      const regularImports = moduleImpList.filter(imp => !imp.isTypeImport);
      
      if (hasOnlyTypes && regularImports.length > 0 && typeImports.length > 0) {
        // Consolidate all into a type-only import
        const allImportNames = moduleImpList.flatMap(imp => imp.importNames);
        const group = moduleImpList[0].group;
        
        // Generate a consolidated statement
        const namedImports = allImportNames
          .filter(name => !name.startsWith('default as '))
          .sort()
          .join(', ');
        
        const defaultName = defaultImport ? defaultImport.importNames.find(name => 
          !name.includes(' as ')) : null;
        
        let statement = 'import type ';
        if (defaultName) {
          statement += `${defaultName}`;
          if (namedImports) {
            statement += `, { ${namedImports} }`;
          }
        } else if (namedImports) {
          statement += `{ ${namedImports} }`;
        }
        statement += ` from '${moduleName}';`;
        
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
        result.push(...moduleImpList);
      }
    }
    
    return result;
  }
  
  /**
   * Format imports with many named imports into multi-line format
   */
  private formatMultiLineImports(imports: FormattedImport[]): FormattedImport[] {
    return imports.map(imp => {
      // Skip imports without named imports or with few names
      if (!imp.hasNamedImports || imp.importNames.length <= 3) {
        return imp;
      }
      
      // Generate a well-formatted multi-line statement
      const quoteChar = this.config.useSingleQuotes ? "'" : '"';
      const indent = ' '.repeat(this.config.indentSize);
      
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
          if (this.config.preserveComments) {
            const moduleData = this.commentMap.get(imp.moduleName);
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
      if (this.config.preserveComments) {
        const moduleData = this.commentMap.get(imp.moduleName);
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
   * Extract comments from the source file
   */
  private extractComments(sourceFile: ts.SourceFile): void {
    const fullText = sourceFile.getFullText();
    
    function forEachChild<T>(node: ts.Node, callback: (node: ts.Node) => T | undefined): T | undefined {
      return ts.forEachChild(node, child => {
        const result = callback(child);
        if (result !== undefined) {
          return result;
        }
        return forEachChild(child, callback);
      });
    }
    
    forEachChild(sourceFile, node => {
      if (!ts.isImportDeclaration(node)) {
        return undefined;
      }
      
      const moduleSpecifier = node.moduleSpecifier;
      if (!ts.isStringLiteral(moduleSpecifier)) {
        return undefined;
      }
      
      const moduleName = moduleSpecifier.text;
      
      // Initialize comment data for this module
      if (!this.commentMap.has(moduleName)) {
        this.commentMap.set(moduleName, {
          leadingComments: [],
          trailingComments: [],
          inlineComments: new Map()
        });
      }
      
      const commentData = this.commentMap.get(moduleName)!;
      
      // Get leading comments
      const leadingComments = ts.getLeadingCommentRanges(fullText, node.pos) || [];
      for (const comment of leadingComments) {
        const commentText = fullText.substring(comment.pos, comment.end);
        commentData.leadingComments.push(commentText);
      }
      
      // Get trailing comments
      const trailingComments = ts.getTrailingCommentRanges(fullText, node.end) || [];
      for (const comment of trailingComments) {
        const commentText = fullText.substring(comment.pos, comment.end);
        commentData.trailingComments.push(commentText);
      }
      
      // Process inline comments for named imports
      if (node.importClause && node.importClause.namedBindings) {
        const namedBindings = node.importClause.namedBindings;
        
        if (ts.isNamedImports(namedBindings)) {
          for (const element of namedBindings.elements) {
            const importName = element.propertyName 
              ? `${element.propertyName.text} as ${element.name.text}`
              : element.name.text;
            
            // Check for trailing comment after this named import
            const importEnd = element.end;
            const inlineComments = ts.getTrailingCommentRanges(fullText, importEnd) || [];
            
            if (inlineComments.length > 0) {
              const commentText = fullText.substring(inlineComments[0].pos, inlineComments[0].end);
              commentData.inlineComments.set(importName, commentText);
            }
          }
        }
      }
      
      return undefined;
    });
  }
  
  /**
   * Process a TypeScript node and its children recursively
   */
  private visitNode(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      this.processImportDeclaration(node);
    }
    
    ts.forEachChild(node, child => this.visitNode(child));
  }
  
  /**
   * Process an import declaration node
   */
  private processImportDeclaration(node: ts.ImportDeclaration): void {
    // Skip invalid nodes
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }
    
    const sourceFile = node.getSourceFile();
    const moduleName = node.moduleSpecifier.text;
    
    // Try conditional grouping first, then fall back to regex pattern matching
    let importGroup = this.getConditionalGroup(moduleName, []);
    if (!importGroup) {
      importGroup = this.getImportGroup(moduleName);
    }
    
    // Collections for import names
    const regularImports = new Set<string>();
    const typeImports = new Set<string>();
    
    let isTypeImport = false;
    let isDefaultImport = false;
    let hasNamedImports = false;
    
    if (node.importClause) {
      const importClause = node.importClause;
      isTypeImport = !!importClause.isTypeOnly;
      
      // Handle default import
      if (importClause.name) {
        isDefaultImport = true;
        regularImports.add(importClause.name.text);
      }
      
      // Handle named imports or namespace import
      if (importClause.namedBindings) {
        if (ts.isNamedImports(importClause.namedBindings)) {
          this.processNamedImports(
            importClause.namedBindings,
            sourceFile,
            regularImports,
            typeImports
          );
          hasNamedImports = regularImports.size > 0;
        } else if (ts.isNamespaceImport(importClause.namedBindings)) {
          regularImports.add(`* as ${importClause.namedBindings.name.text}`);
          hasNamedImports = true;
        }
      }
    }
    
    // Extract the original text for reference
    const statement = sourceFile.text.substring(
      node.getStart(sourceFile),
      node.getEnd()
    );
    
    // Create the main import if it contains regular names or is a side-effect import
    if (regularImports.size > 0 || !node.importClause) {
      this.result.push({
        statement,
        group: importGroup,
        moduleName,
        importNames: Array.from(regularImports),
        isTypeImport,
        isDefaultImport,
        hasNamedImports
      });
    }
    
    // Create a separate import for inline types if needed
    if (typeImports.size > 0) {
      // Update conditional grouping based on the actual imports
      const typeImportNames = Array.from(typeImports);
      const typeGroup = this.getConditionalGroup(moduleName, typeImportNames) || importGroup;
      
      const typeStatement = `import type { ${typeImportNames.join(', ')} } from '${moduleName}';`;
      
      this.result.push({
        statement: typeStatement,
        group: typeGroup,
        moduleName,
        importNames: typeImportNames,
        isTypeImport: true,
        isDefaultImport: false,
        hasNamedImports: true
      });
    }
  }
  
  /**
   * Process named imports and separate regular and type imports
   */
  private processNamedImports(
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
      
      // Extract just the name without comments
      let importName = '';
      if (element.propertyName) {
        importName = `${element.propertyName.text} as ${element.name.text}`;
      } else {
        importName = element.name.text;
      }
      
      if (TYPE_KEYWORD_REGEX.test(sourceText)) {
        typeImports.add(importName);
      } else {
        regularImports.add(importName);
      }
    }
  }
  
  /**
   * Get the import group based on conditional rules
   */
  private getConditionalGroup(
    moduleName: string, 
    importNames: string[]
  ): ImportGroup | null {
    if (!this.config.conditionalGroups || this.config.conditionalGroups.length === 0) {
      return null;
    }
    
    for (const rule of this.config.conditionalGroups) {
      if (rule.condition(moduleName, importNames)) {
        return {
          name: rule.name,
          regex: new RegExp(''), // Dummy regex, not used for conditional groups
          order: rule.order
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get the import group for a module name with caching
   */
  private getImportGroup(moduleName: string): ImportGroup {
    // Use cache to avoid repeated pattern matching
    if (this.importGroupCache.has(moduleName)) {
      return this.importGroupCache.get(moduleName)!;
    }
    
    const importGroup = this.config.importGroups.find((group) => group.regex.test(moduleName)) ?? 
      { name: 'Misc', regex: /.*/, order: 999 };
    
    // Store in cache
    this.importGroupCache.set(moduleName, importGroup);
    return importGroup;
  }
  
  /**
   * Generate formatted import statements with empty lines between groups
   */
  public generateFormattedCode(): string {
    const processedImports = this.postProcessImports();
    
    if (processedImports.length === 0) {
      return '';
    }
    
    let result = '';
    let currentGroup = '';
    
    for (const imp of processedImports) {
      // Add empty lines between different groups
      if (currentGroup && currentGroup !== imp.group.name) {
        result += '\n'.repeat(this.config.emptyLinesBetweenGroups);
      }
      
      result += imp.statement + '\n';
      currentGroup = imp.group.name;
    }
    
    return result;
  }
}

/**
 * Parse imports from an array of import declarations
 */
export function parseImports(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
  config: Partial<ImportParserConfig> = {}
): FormattedImport[] {
  // Input validation
  if (!importNodes || importNodes.length === 0 || !sourceFile) {
    return [];
  }
  
  const parser = new EnhancedImportParser(config);
  
  // Create a temporary source file with only the import declarations
  const tempSourceFile = ts.createSourceFile(
    'temp.ts',
    importNodes.map(node => sourceFile.text.substring(node.getStart(), node.getEnd())).join('\n'),
    ts.ScriptTarget.Latest,
    true
  );
  
  return parser.parse(tempSourceFile);
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
        return moduleName.startsWith('@types/') || 
          (importNames.length > 0 && importNames.every(name => /^[A-Z]/.test(name)));
      }
    }
  ];
}