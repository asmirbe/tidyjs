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
 * Import parser using the visitor pattern with performance optimizations
 */
export class ImportParser {
  private readonly importGroups: ImportGroup[];
  private readonly importGroupCache = new Map<string, ImportGroup>();
  private readonly result: FormattedImport[] = [];
  
  constructor(importGroups: ImportGroup[] = DEFAULT_IMPORT_GROUPS) {
    this.importGroups = importGroups.length > 0 ? importGroups : DEFAULT_IMPORT_GROUPS;
  }
  
  /**
   * Parse imports from TypeScript source
   */
  public parse(sourceFile: ts.SourceFile): FormattedImport[] {
    if (!sourceFile) {
      return [];
    }
    
    try {
      // Visit all nodes and process import declarations
      this.visitNode(sourceFile);
      return this.result;
    } catch {
      return [];
    }
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
    const importGroup = this.getImportGroup(moduleName);
    
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
      this.result.push({
        statement: `import type { ${Array.from(typeImports).join(', ')} } from '${moduleName}';`,
        group: importGroup,
        moduleName,
        importNames: Array.from(typeImports),
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
   * Get the import group for a module name with caching
   */
  private getImportGroup(moduleName: string): ImportGroup {
    // Use cache to avoid repeated pattern matching
    if (this.importGroupCache.has(moduleName)) {
      return this.importGroupCache.get(moduleName)!;
    }
    
    const importGroup = this.importGroups.find((group) => group.regex.test(moduleName)) ?? { name: 'Misc', regex: /.*/, order: 0 };
    
    // Store in cache
    this.importGroupCache.set(moduleName, importGroup);
    return importGroup;
  }
}

/**
 * Parse imports from an array of import declarations
 */
export function parseImports(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile
): FormattedImport[] {
  // Input validation
  if (!importNodes || importNodes.length === 0 || !sourceFile) {
    return [];
  }
  
  const parser = new ImportParser(DEFAULT_IMPORT_GROUPS);
  
  // Create a temporary source file with only the import declarations
  const tempSourceFile = ts.createSourceFile(
    'temp.ts',
    importNodes.map(node => sourceFile.text.substring(node.getStart(), node.getEnd())).join('\n'),
    ts.ScriptTarget.Latest
  );
  
  return parser.parse(tempSourceFile);
}