// Misc
import { parse }    from '@typescript-eslint/parser';
import { TSESTree } from '@typescript-eslint/types';

// Utils
import { GroupMatcher } from './utils/group-matcher';

// Types
import { Config as ExtensionGlobalConfig } from './types';

export type ConfigImportGroup = {
  name: string;
  order: number;
  priority?: number;
} & (
  | {
      isDefault: true;
      match?: RegExp;
    }
  | {
      isDefault?: false;
      match: RegExp;
    }
);

export enum ImportType {
  DEFAULT = "default",
  NAMED = "named",
  TYPE_DEFAULT = "typeDefault",
  TYPE_NAMED = "typeNamed",
  SIDE_EFFECT = "sideEffect"
}
export type ImportSource = string;
export type ImportSpecifier = string | { imported: string; local: string };

export type TypeOrder = Record<ImportType, number>;

export interface FormattingOptions {
  quoteStyle?: "single" | "double";
  semicolons?: boolean;
  multilineIndentation?: number | "tab";
}

interface InternalProcessedConfig {
  importGroups: ConfigImportGroup[];
  typeOrder: TypeOrder;
  formatting: FormattingOptions;
}

const DEFAULT_PARSER_SETTINGS: InternalProcessedConfig = {
  formatting: {
    quoteStyle: "single",
    semicolons: true,
    multilineIndentation: 2,
  },
  typeOrder: {
    [ImportType.SIDE_EFFECT]: 0,
    [ImportType.DEFAULT]: 1,
    [ImportType.NAMED]: 2,
    [ImportType.TYPE_DEFAULT]: 3,
    [ImportType.TYPE_NAMED]: 4,
  },
  importGroups: [],
};

export interface ParsedImport {
  type: ImportType;
  source: ImportSource;
  specifiers: ImportSpecifier[];
  defaultImport?: string;
  raw: string;
  groupName: string | null;
  isPriority: boolean;
  sourceIndex: number;
}

export interface ImportGroup {
  name: string;
  order: number;
  imports: ParsedImport[];
}

export interface InvalidImport {
  raw: string;
  error: string;
}

export interface ParserResult {
  groups: ImportGroup[];
  originalImports: string[];
  invalidImports?: InvalidImport[];
  importRange?: { start: number; end: number };
}

export class ImportParser {
  private internalConfig: InternalProcessedConfig;
  private ast!: TSESTree.Program;
  private sourceCode = "";
  private invalidImports: InvalidImport[] = [];
  private groupMatcher: GroupMatcher;

  constructor(extensionConfig: ExtensionGlobalConfig) {
    // Initialize GroupMatcher with the groups configuration
    this.groupMatcher = new GroupMatcher(extensionConfig.groups);
    
    const importGroups: ConfigImportGroup[] = extensionConfig.groups.map((g): ConfigImportGroup => {
      if (g.isDefault) {
        return {
          name: g.name,
          order: g.order,
          isDefault: true,
          match: g.match,
          priority: g.priority,
        };
      } else if (g.match) {
        return {
          name: g.name,
          order: g.order,
          isDefault: false,
          match: g.match,
          priority: g.priority,
        };
      } else {
        return {
          name: g.name,
          order: g.order,
          isDefault: true,
          priority: g.priority,
        };
      }
    });

    const typeOrder: TypeOrder = {
      ...DEFAULT_PARSER_SETTINGS.typeOrder,
      default: extensionConfig.importOrder?.default ?? DEFAULT_PARSER_SETTINGS.typeOrder.default,
      named: extensionConfig.importOrder?.named ?? DEFAULT_PARSER_SETTINGS.typeOrder.named,
      sideEffect: extensionConfig.importOrder?.sideEffect ?? DEFAULT_PARSER_SETTINGS.typeOrder.sideEffect,
    };

    if (extensionConfig.importOrder?.typeOnly !== undefined) {
      typeOrder.typeDefault = extensionConfig.importOrder.typeOnly;
      typeOrder.typeNamed = extensionConfig.importOrder.typeOnly;
    }

    const formatting: FormattingOptions = {
      ...DEFAULT_PARSER_SETTINGS.formatting,
    };
    if (extensionConfig.format?.singleQuote !== undefined) {
      formatting.quoteStyle = extensionConfig.format.singleQuote ? "single" : "double";
    }
    if (extensionConfig.format?.indent !== undefined) {
      formatting.multilineIndentation = extensionConfig.format.indent;
    }

    this.internalConfig = {
      importGroups,
      typeOrder,
      formatting,
    };
    this.sourceCode = "";
  }

  public parse(sourceCode: string): ParserResult {
    this.sourceCode = sourceCode;
    this.invalidImports = [];

    try {
      this.ast = parse(sourceCode, {
        ecmaVersion: 2020,
        sourceType: "module",
        jsx: true,
        errorOnUnknownASTType: false,
        errorOnTypeScriptSyntacticAndSemanticIssues: false,
      });

      const imports = this.extractImports();
      const groups = this.organizeImportsIntoGroups(imports);
      const importRange = this.calculateImportRange();

      return {
        groups,
        originalImports: imports.map((imp) => imp.raw),
        invalidImports: this.invalidImports.length > 0 ? this.invalidImports : undefined,
        importRange,
      };
    } catch (error) {
      this.invalidImports.push({
        raw: sourceCode,
        error: error instanceof Error ? `Syntax error during parsing: ${error.message}` : "Unknown parsing error",
      });

      return {
        groups: [],
        originalImports: [],
        invalidImports: this.invalidImports,
      };
    }
  }

  private extractImports(): ParsedImport[] {
    const imports: ParsedImport[] = [];
    const program = this.ast;

    if (!program || !program.body) {
      return imports;
    }

    for (const node of program.body) {
      if (node.type === "ImportDeclaration") {
        try {
          const importNode = node as TSESTree.ImportDeclaration;
          const source = importNode.source.value as string;

          // Extract raw text once for this import
          const raw = this.sourceCode.substring(importNode.range?.[0] || 0, importNode.range?.[1] || 0);
          
          // Check if this is a type-only import declaration using AST
          const typeOnly = importNode.importKind === 'type';

          if (importNode.specifiers.length === 0) {
            // Side-effect import (no specifiers)
            const { groupName, isPriority } = this.determineGroup(source);
            imports.push({
              type: ImportType.SIDE_EFFECT,
              source,
              specifiers: [],
              defaultImport: undefined,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
            continue;
          }

          // Separate specifiers by type (value vs type) and by kind (default vs named vs namespace)
          const valueSpecifiers: ImportSpecifier[] = [];
          const typeSpecifiers: ImportSpecifier[] = [];
          let defaultImport: string | undefined;
          let typeDefaultImport: string | undefined;
          let namespaceSpecifier: string | undefined;
          let typeNamespaceSpecifier: string | undefined;

          for (const specifierNode of importNode.specifiers) {
            if (specifierNode.type === "ImportDefaultSpecifier") {
              if (typeOnly) {
                typeDefaultImport = specifierNode.local.name;
              } else {
                defaultImport = specifierNode.local.name;
              }
            } else if (specifierNode.type === "ImportSpecifier") {
              // Only ImportSpecifier has importKind property for individual type specifiers
              const isTypeSpecifier = (specifierNode as TSESTree.ImportSpecifier).importKind === 'type' || typeOnly;
              const importedName = specifierNode.imported ? (specifierNode.imported as TSESTree.Identifier).name : specifierNode.local.name;
              const localName = specifierNode.local.name;
              
              const specifier = importedName !== localName 
                ? { imported: importedName, local: localName }
                : importedName;

              if (isTypeSpecifier) {
                typeSpecifiers.push(specifier);
              } else {
                valueSpecifiers.push(specifier);
              }
            } else if (specifierNode.type === "ImportNamespaceSpecifier") {
              const namespaceSpec = `* as ${specifierNode.local.name}`;
              if (typeOnly) {
                typeNamespaceSpecifier = namespaceSpec;
              } else {
                namespaceSpecifier = namespaceSpec;
              }
            }
          }

          const { groupName, isPriority } = this.determineGroup(source);

          // Create separate imports for different types and kinds
          
          // Regular default import
          if (defaultImport) {
            imports.push({
              type: ImportType.DEFAULT,
              source,
              specifiers: [defaultImport],
              defaultImport,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

          // Type default import
          if (typeDefaultImport) {
            imports.push({
              type: ImportType.TYPE_DEFAULT,
              source,
              specifiers: [typeDefaultImport],
              defaultImport: typeDefaultImport,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

          // Regular named imports
          if (valueSpecifiers.length > 0) {
            imports.push({
              type: ImportType.NAMED,
              source,
              specifiers: valueSpecifiers,
              defaultImport: undefined,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

          // Type named imports
          if (typeSpecifiers.length > 0) {
            imports.push({
              type: ImportType.TYPE_NAMED,
              source,
              specifiers: typeSpecifiers,
              defaultImport: undefined,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

          // Regular namespace import
          if (namespaceSpecifier) {
            imports.push({
              type: ImportType.DEFAULT, // namespace imports are treated as default
              source,
              specifiers: [namespaceSpecifier],
              defaultImport: undefined,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

          // Type namespace import
          if (typeNamespaceSpecifier) {
            imports.push({
              type: ImportType.TYPE_DEFAULT, // type namespace imports are treated as type default
              source,
              specifiers: [typeNamespaceSpecifier],
              defaultImport: undefined,
              raw,
              groupName,
              isPriority,
              sourceIndex: imports.length,
            });
          }

        } catch (error) {
          const raw = this.sourceCode.substring(node.range?.[0] || 0, node.range?.[1] || 0);
          this.invalidImports.push({
            raw,
            error: error instanceof Error ? error.message : "Erreur lors du parsing de l'import",
          });
        }
      }
    }
    return imports;
  }

  private determineGroup(source: string): { groupName: string | null; isPriority: boolean } {
    // Use cached GroupMatcher for O(1) lookups after first match
    const groupName = this.groupMatcher.getGroup(source);
    
    // Find the group to get its priority setting
    const group = this.internalConfig.importGroups.find(g => g.name === groupName);
    const isPriority = group ? !!group.priority : false;
    
    return { groupName, isPriority };
  }

  private consolidateImportsBySource(imports: ParsedImport[]): ParsedImport[] {
    const importsBySource = new Map<string, { 
      default?: ParsedImport; 
      named?: ParsedImport; 
      namespace?: ParsedImport;
      sideEffect?: ParsedImport;
      typeDefault?: ParsedImport;
      typeNamed?: ParsedImport;
      typeNamespace?: ParsedImport;
    }>();
    
    // Group imports by source
    for (const imp of imports) {
      const sourceImports = importsBySource.get(imp.source) || {};
      
      if (imp.type === ImportType.DEFAULT && imp.defaultImport) {
        sourceImports.default = imp;
      } else if (imp.type === ImportType.DEFAULT && imp.specifiers.some(s => typeof s === 'string' && s.startsWith('* as'))) {
        sourceImports.namespace = imp;
      } else if (imp.type === ImportType.NAMED) {
        if (sourceImports.named) {
          // Merge specifiers for named imports from same source
          const specMap = new Map<string, ImportSpecifier>();
          
          // Add existing specifiers
          sourceImports.named.specifiers.forEach(spec => {
            if (typeof spec === 'string') {
              specMap.set(spec, spec);
            } else {
              specMap.set(spec.local, spec);
            }
          });
          
          // Add new specifiers
          imp.specifiers.forEach(spec => {
            if (typeof spec === 'string') {
              specMap.set(spec, spec);
            } else {
              specMap.set(spec.local, spec);
            }
          });
          
          sourceImports.named.specifiers = Array.from(specMap.values()).sort((a, b) => {
            const aStr = typeof a === 'string' ? a : a.local;
            const bStr = typeof b === 'string' ? b : b.local;
            return aStr.localeCompare(bStr);
          });
        } else {
          sourceImports.named = imp;
        }
      } else if (imp.type === ImportType.TYPE_NAMED) {
        if (sourceImports.typeNamed) {
          // Merge specifiers for type named imports from same source
          const specMap = new Map<string, ImportSpecifier>();
          
          // Add existing specifiers
          sourceImports.typeNamed.specifiers.forEach(spec => {
            if (typeof spec === 'string') {
              specMap.set(spec, spec);
            } else {
              specMap.set(spec.local, spec);
            }
          });
          
          // Add new specifiers
          imp.specifiers.forEach(spec => {
            if (typeof spec === 'string') {
              specMap.set(spec, spec);
            } else {
              specMap.set(spec.local, spec);
            }
          });
          
          sourceImports.typeNamed.specifiers = Array.from(specMap.values()).sort((a, b) => {
            const aStr = typeof a === 'string' ? a : a.local;
            const bStr = typeof b === 'string' ? b : b.local;
            return aStr.localeCompare(bStr);
          });
        } else {
          sourceImports.typeNamed = imp;
        }
      } else if (imp.type === ImportType.SIDE_EFFECT) {
        sourceImports.sideEffect = imp;
      } else if (imp.type === ImportType.TYPE_DEFAULT && imp.defaultImport) {
        sourceImports.typeDefault = imp;
      } else if (imp.type === ImportType.TYPE_DEFAULT && imp.specifiers.some(s => typeof s === 'string' && s.startsWith('* as'))) {
        sourceImports.typeNamespace = imp;
      }
      
      importsBySource.set(imp.source, sourceImports);
    }
    
    // Convert back to array - keep separate import types
    const consolidated: ParsedImport[] = [];
    for (const [, sourceImports] of importsBySource) {
      if (sourceImports.sideEffect) {
        consolidated.push(sourceImports.sideEffect);
      }
      if (sourceImports.default) {
        consolidated.push(sourceImports.default);
      }
      if (sourceImports.named) {
        consolidated.push(sourceImports.named);
      }
      if (sourceImports.namespace) {
        consolidated.push(sourceImports.namespace);
      }
      if (sourceImports.typeDefault) {
        consolidated.push(sourceImports.typeDefault);
      }
      if (sourceImports.typeNamed) {
        consolidated.push(sourceImports.typeNamed);
      }
      if (sourceImports.typeNamespace) {
        consolidated.push(sourceImports.typeNamespace);
      }
    }
    
    return consolidated;
  }

  private organizeImportsIntoGroups(imports: ParsedImport[]): ImportGroup[] {
    // First consolidate imports from the same source
    const consolidatedImports = this.consolidateImportsBySource(imports);
    
    const groupMap = new Map<string, ImportGroup>();
    let configuredDefaultGroupName: string | null = null;

    for (const configGroup of this.internalConfig.importGroups) {
      groupMap.set(configGroup.name, {
        name: configGroup.name,
        order: configGroup.order,
        imports: [],
      });
      if (configGroup.isDefault === true) {
        configuredDefaultGroupName = configGroup.name;
      }
    }

    const UNCONFIGURED_DEFAULT_FALLBACK_NAME = "Misc";
    let effectiveDefaultGroupName: string;

    if (configuredDefaultGroupName) {
      effectiveDefaultGroupName = configuredDefaultGroupName;
    } else {
      effectiveDefaultGroupName = UNCONFIGURED_DEFAULT_FALLBACK_NAME;

      if (!groupMap.has(effectiveDefaultGroupName)) {
        let fallbackDefaultOrder = 999;
        if (groupMap.size > 0) {
          const maxOrder = Math.max(0, ...Array.from(groupMap.values(), (g) => g.order));
          if (maxOrder >= fallbackDefaultOrder) {
            fallbackDefaultOrder = maxOrder + 1;
          }
        }
        groupMap.set(effectiveDefaultGroupName, {
          name: effectiveDefaultGroupName,
          order: fallbackDefaultOrder,
          imports: [],
        });
      }
    }

    const defaultGroupForUncategorized = groupMap.get(effectiveDefaultGroupName)!;

    for (const imp of consolidatedImports) {
      let targetGroup: ImportGroup | undefined;

      if (imp.groupName && groupMap.has(imp.groupName)) {
        targetGroup = groupMap.get(imp.groupName);
      } else {
        targetGroup = defaultGroupForUncategorized;
      }

      if (targetGroup) {
        targetGroup.imports.push(imp);
      }
    }

    for (const group of groupMap.values()) {
      if (this.internalConfig.typeOrder) {
        group.imports.sort((a, b) => {
          const typeOrderA = this.internalConfig.typeOrder[a.type] ?? Infinity;
          const typeOrderB = this.internalConfig.typeOrder[b.type] ?? Infinity;

          if (typeOrderA !== typeOrderB) {
            return typeOrderA - typeOrderB;
          }
          // Sort alphabetically by source within same type
          return a.source.localeCompare(b.source);
        });
      }
    }

    return Array.from(groupMap.values())
      .filter((group) => group.imports.length > 0)
      .sort((a, b) => a.order - b.order);
  }

  private calculateImportRange(): { start: number; end: number } | undefined {
    const program = this.ast;
    
    if (!program || !program.body) {
      return undefined;
    }

    let firstImportStart: number | undefined;
    let lastImportEnd: number | undefined;

    for (const node of program.body) {
      if (node.type === "ImportDeclaration" && node.range) {
        const [start, end] = node.range;
        
        if (firstImportStart === undefined || start < firstImportStart) {
          firstImportStart = start;
        }
        
        if (lastImportEnd === undefined || end > lastImportEnd) {
          lastImportEnd = end;
        }
      }
    }

    if (firstImportStart !== undefined && lastImportEnd !== undefined) {
      // Include preceding comments and empty lines
      const adjustedStart = this.findActualImportStart(firstImportStart);
      return { start: adjustedStart, end: lastImportEnd };
    }

    return undefined;
  }

  private findActualImportStart(firstImportStart: number): number {
    const lines = this.sourceCode.split('\n');
    let currentPos = 0;
    let importLineIndex = -1;
    
    // Find which line contains the first import
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length;
      if (currentPos <= firstImportStart && firstImportStart <= lineEnd) {
        importLineIndex = i;
        break;
      }
      currentPos = lineEnd + 1; // +1 for the newline character
    }

    if (importLineIndex === -1) {
      return firstImportStart;
    }

    let startLineIndex = importLineIndex;
    let inMultilineComment = false;
    
    // Check if we're in the middle of a multiline comment at the import line
    for (let i = 0; i < importLineIndex; i++) {
      const line = lines[i];
      if (line.includes('/*') && !line.includes('*/')) {
        inMultilineComment = true;
      } else if (line.includes('*/')) {
        inMultilineComment = false;
      }
    }
    
    // Walk backwards to include all comments and empty lines
    for (let i = importLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line.includes('*/')) {
        inMultilineComment = false;
        startLineIndex = i;
      } else if (line.includes('/*')) {
        inMultilineComment = true;
        startLineIndex = i;
      } else if (inMultilineComment) {
        startLineIndex = i;
      } else if (line === '' || line.startsWith('//')) {
        startLineIndex = i;
      } else {
        // Stop if we hit non-comment, non-empty content
        break;
      }
    }

    // Calculate position from start of line
    let adjustedStart = 0;
    for (let i = 0; i < startLineIndex; i++) {
      adjustedStart += lines[i].length + 1; // +1 for newline
    }

    return adjustedStart;
  }

  /**
   * Get the GroupMatcher instance for cache management
   */
  getGroupMatcher(): GroupMatcher {
    return this.groupMatcher;
  }

  /**
   * Dispose of the parser and clean up resources
   */
  dispose(): void {
    this.groupMatcher.dispose();
    this.sourceCode = "";
    this.invalidImports = [];
  }
}

export function parseImports(sourceCode: string, config: ExtensionGlobalConfig): ParserResult {
  const parser = new ImportParser(config);
  return parser.parse(sourceCode);
}
