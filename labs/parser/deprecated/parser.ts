import * as ts from 'typescript';

// Types for the import parser and formatter
export interface ImportGroup {
  name: string;
  regex: RegExp;
  order: number;
}

export interface FormatterConfig {
  importGroups: ImportGroup[];
  alignmentSpacing: boolean;
  indentSize: number;
  singleLineNamedImportLimit: number;
  preserveSectionComments: boolean;
  preserveLeadingComments: boolean;
  preserveTrailingComments: boolean;
  emptyLinesBetweenGroups: number;
  splitDefaultAndNamed: boolean;
  useMultipleLines: boolean;
  useTypeImports: boolean;
  sortImportsByLength: boolean;
  regexPatterns: {
    appSubfolderPattern: RegExp;
    typeDeclaration: RegExp;
    codeDeclaration: RegExp;
  };
}

export interface ParsedImport {
  moduleName: string;
  group: ImportGroup;
  importNames: string[];
  isDefaultImport: boolean;
  isTypeImport: boolean;
  hasNamedImports: boolean;
  originalStatement: string;
  leadingComments: string[];
  trailingComments: string[];
  isSideEffect: boolean;
  effectiveLength: number;
}

interface FormattedResult {
  code: string;
  dynamicGroups: Set<string>;
}

// Default configuration
const DEFAULT_CONFIG: FormatterConfig = {
  importGroups: [
    { name: 'Misc', regex: /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  alignmentSpacing: true,
  indentSize: 4,
  singleLineNamedImportLimit: 1,
  preserveSectionComments: true,
  preserveLeadingComments: true,
  preserveTrailingComments: false,
  emptyLinesBetweenGroups: 1,
  splitDefaultAndNamed: true,
  useMultipleLines: true,
  useTypeImports: true,
  sortImportsByLength: true,
  regexPatterns: {
    appSubfolderPattern: /@app\/([^/]+)/,
    typeDeclaration: /^type\s+/,
    codeDeclaration: /^(const|let|var|function|class|interface|enum)\s+/
  }
};

/**
 * Master function that parses source code and formats imports according to config
 */
export function formatImports(
  sourceCode: string,
  config: Partial<FormatterConfig> = {}
): string {
  // Merge config with defaults
  const mergedConfig: FormatterConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create source file and find import nodes
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  
  const importNodes = findImportNodes(sourceFile);
  if (importNodes.length === 0) {
    return sourceCode;
  }
  
  // Find the import range (start/end positions)
  const importRange = findImportRange(sourceFile, importNodes);
  
  // Parse imports
  const dynamicGroups = new Set<string>();
  const parsedImports = parseImportsStream(importNodes, sourceFile, mergedConfig, dynamicGroups);
  
  // Format imports
  const formattedResult = formatParsedImports(parsedImports, mergedConfig, dynamicGroups);
  
  // Combine the formatted imports with the rest of the source code
  return (
    sourceCode.substring(0, importRange.start) +
    formattedResult.code +
    sourceCode.substring(importRange.end)
  );
}

/**
 * Find all import declaration nodes in the source file
 */
function findImportNodes(sourceFile: ts.SourceFile): ts.ImportDeclaration[] {
  const importNodes: ts.ImportDeclaration[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      importNodes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return importNodes;
}

/**
 * Find the start and end positions of the import section
 */
function findImportRange(
  sourceFile: ts.SourceFile,
  importNodes: ts.ImportDeclaration[]
): { start: number; end: number } {
  if (importNodes.length === 0) {
    return { start: 0, end: 0 };
  }
  
  // Find the earliest and latest positions
  let start = Number.MAX_SAFE_INTEGER;
  let end = 0;
  
  for (const node of importNodes) {
    const nodeStart = getNodeStartWithComments(node, sourceFile);
    const nodeEnd = node.end;
    
    start = Math.min(start, nodeStart);
    end = Math.max(end, nodeEnd);
  }
  
  // Add any trailing newlines to the end position
  const sourceText = sourceFile.getFullText();
  let currentPos = end;
  
  while (
    currentPos < sourceText.length &&
    (sourceText[currentPos] === '\n' || sourceText[currentPos] === '\r')
  ) {
    currentPos++;
  }
  
  return { start, end: currentPos };
}

/**
 * Get the start position of a node including any leading comments
 */
function getNodeStartWithComments(node: ts.Node, sourceFile: ts.SourceFile): number {
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, node.pos) || [];
  
  return commentRanges.length > 0 
    ? commentRanges[0].pos 
    : node.getStart(sourceFile);
}

/**
 * Parse import declarations into a structured format using a stream processing approach
 */
export function parseImportsStream(
    importNodes: ts.ImportDeclaration[],
    sourceFile: ts.SourceFile,
    config: FormatterConfig,
    dynamicGroups: Set<string>
  ): ParsedImport[] {
    // Input validation
    if (!importNodes?.length || !sourceFile) {
      return [];
    }
    
    try {
      // Create a group resolver cache
      const importGroupCache = new Map<string, ImportGroup>();
      
      // Extract comments
      const commentMap = extractComments(importNodes, sourceFile);
      
      // Process each import node
      return importNodes
        .map(node => processImportNode(node, sourceFile, config, importGroupCache, dynamicGroups, commentMap))
        .filter(parsed => parsed !== null) as ParsedImport[];
    } catch (error) {
      console.error(`Error in parseImportsStream: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

/**
 * Process a single import declaration node
 */
function processImportNode(
    node: ts.ImportDeclaration,
    sourceFile: ts.SourceFile,
    config: FormatterConfig,
    groupCache: Map<string, ImportGroup>,
    dynamicGroups: Set<string>,
    commentMap: Map<ts.Node, { leading: string[]; trailing: string[] }>
  ): ParsedImport | null {
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
      return null;
    }
    
    const moduleName = node.moduleSpecifier.text;
    const originalStatement = sourceFile.text.substring(
      node.getStart(sourceFile),
      node.getEnd()
    );
    
    // Check for dynamic app subfolder groups
    const appSubfolderMatch = moduleName.match(config.regexPatterns.appSubfolderPattern);
    if (appSubfolderMatch?.[1]) {
      const subfolder = appSubfolderMatch[1];
      dynamicGroups.add(subfolder);
    }
    
    // Get import group
    const group = resolveImportGroup(moduleName, config.importGroups, groupCache, dynamicGroups);
    
    // Extract import data
    const isSideEffect = !node.importClause;
    const isTypeImport = node.importClause?.isTypeOnly || false;
    let isDefaultImport = false;
    let hasNamedImports = false;
    const importNames: string[] = [];
    
    if (node.importClause) {
      // Handle default import
      if (node.importClause.name) {
        isDefaultImport = true;
        importNames.push(node.importClause.name.text);
      }
      
      // Handle named or namespace imports
      if (node.importClause.namedBindings) {
        if (ts.isNamedImports(node.importClause.namedBindings)) {
          const elements = node.importClause.namedBindings.elements;
          
          for (const element of elements) {
            const isTypeElement = isTypeImport || isTypeImportElement(element, sourceFile);
            const name = element.propertyName
              ? `${element.propertyName.text} as ${element.name.text}`
              : element.name.text;
            
            importNames.push(isTypeElement ? `type ${name}` : name);
          }
          
          hasNamedImports = elements.length > 0;
        } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          importNames.push(`* as ${node.importClause.namedBindings.name.text}`);
          hasNamedImports = true;
        }
      }
    }
    
    // Get comments
    const comments = commentMap.get(node) || { leading: [], trailing: [] };
    
    // Calculate effective length (for sorting by length)
    const effectiveLength = calculateEffectiveLength(importNames, isDefaultImport);
    
    return {
      moduleName,
      group,
      importNames,
      isDefaultImport,
      isTypeImport,
      hasNamedImports,
      originalStatement,
      leadingComments: comments.leading,
      trailingComments: comments.trailing,
      isSideEffect,
      effectiveLength
    };
  }

/**
 * Check if a named import element is a type import
 */
function isTypeImportElement(element: ts.ImportSpecifier, sourceFile: ts.SourceFile): boolean {
  const text = sourceFile.text.substring(
    element.getStart(sourceFile),
    element.getEnd()
  );
  
  return text.trim().startsWith('type ');
}

/**
 * Calculate the effective length of an import for sorting
 */
function calculateEffectiveLength(importNames: string[], isDefaultImport: boolean): number {
  if (isDefaultImport && importNames.length === 1) {
    return importNames[0].length;
  }
  
  return importNames
    .filter(name => !name.startsWith('*'))
    .reduce((total, name) => total + name.length, 0);
}

/**
 * Resolve the import group for a module path
 */
function resolveImportGroup(
  moduleName: string,
  groups: ImportGroup[],
  cache: Map<string, ImportGroup>,
  dynamicGroups: Set<string>
): ImportGroup {
  // Check cache first
  if (cache.has(moduleName)) {
    return cache.get(moduleName)!;
  }
  
  // Check for dynamic app subfolder groups
  const appSubfolderMatch = moduleName.match(/@app\/([^/]+)/);
  if (appSubfolderMatch?.[1] && dynamicGroups.has(appSubfolderMatch[1])) {
    const dynamicGroup = {
      name: `@app/${appSubfolderMatch[1]}`,
      regex: new RegExp(`^@app/${appSubfolderMatch[1]}`),
      order: 100 // Dynamic groups come after standard groups
    };
    
    cache.set(moduleName, dynamicGroup);
    return dynamicGroup;
  }
  
  // Check configured groups
  const group = groups.find(g => g.regex.test(moduleName)) || 
    { name: 'Misc', regex: /.*/, order: 999 };
  
  cache.set(moduleName, group);
  return group;
}

/**
 * Extract comments from import declarations
 */
function extractComments(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile
): Map<ts.Node, { leading: string[]; trailing: string[] }> {
  const commentMap = new Map<ts.Node, { leading: string[]; trailing: string[] }>();
  const fullText = sourceFile.getFullText();
  
  for (const node of importNodes) {
    const leadingComments: string[] = [];
    const trailingComments: string[] = [];
    
    // Extract leading comments
    const leadingRanges = ts.getLeadingCommentRanges(fullText, node.pos) || [];
    for (const range of leadingRanges) {
      const commentText = fullText.substring(range.pos, range.end).trim();
      if (commentText) {
        leadingComments.push(commentText);
      }
    }
    
    // Extract trailing comments
    const trailingRanges = ts.getTrailingCommentRanges(fullText, node.end) || [];
    for (const range of trailingRanges) {
      const commentText = fullText.substring(range.pos, range.end).trim();
      if (commentText) {
        trailingComments.push(commentText);
      }
    }
    
    commentMap.set(node, { leading: leadingComments, trailing: trailingComments });
  }
  
  return commentMap;
}

/**
 * Format parsed imports according to the specified rules
 */
function formatParsedImports(
  parsedImports: ParsedImport[],
  config: FormatterConfig,
  dynamicGroups: Set<string>
): FormattedResult {
  if (parsedImports.length === 0) {
    return { code: '', dynamicGroups };
  }
  
  // Group imports by their group
  const groupedImports = groupImportsByType(parsedImports, config);
  
  // Format each group
  let formattedCode = '';
  let isFirstGroup = true;
  
  // Keep track of processed group names to handle multiple groups with the same name
  const processedGroups = new Set<string>();
  
  // Process standard groups first based on order
  const orderedGroups = Object.keys(groupedImports)
    .map(groupName => {
      const imports = groupedImports[groupName];
      const order = imports[0].group.order;
      return { groupName, order };
    })
    .sort((a, b) => a.order - b.order);
  
  for (const { groupName } of orderedGroups) {
    if (processedGroups.has(groupName)) continue;
    
    const imports = groupedImports[groupName];
    
    // Add empty line between groups
    if (!isFirstGroup && config.emptyLinesBetweenGroups > 0) {
      formattedCode += '\n'.repeat(config.emptyLinesBetweenGroups);
    }
    
    // Add section comment if preserving section comments
    if (config.preserveSectionComments) {
      formattedCode += `// ${groupName}\n`;
    }
    
    // Format the imports in this group
    const groupCode = formatImportGroup(imports, config);
    formattedCode += groupCode;
    
    processedGroups.add(groupName);
    isFirstGroup = false;
  }
  
  // Ensure code ends with proper newlines
  if (!formattedCode.endsWith('\n\n')) {
    if (formattedCode.endsWith('\n')) {
      formattedCode += '\n';
    } else {
      formattedCode += '\n\n';
    }
  }
  
  return { code: formattedCode, dynamicGroups };
}

/**
 * Group and sort imports by their type and according to sorting rules
 */
function groupImportsByType(
  parsedImports: ParsedImport[],
  config: FormatterConfig
): Record<string, ParsedImport[]> {
  // Group by import group name
  const groupedImports: Record<string, ParsedImport[]> = {};
  
  for (const imp of parsedImports) {
    const groupName = imp.group.name;
    
    if (!groupedImports[groupName]) {
      groupedImports[groupName] = [];
    }
    
    groupedImports[groupName].push(imp);
  }
  
  // Sort each group according to the rules
  for (const groupName in groupedImports) {
    groupedImports[groupName] = sortImportsInGroup(groupedImports[groupName], config);
  }
  
  return groupedImports;
}

/**
 * Sort imports within a group according to the rules
 */
function sortImportsInGroup(
  imports: ParsedImport[],
  config: FormatterConfig
): ParsedImport[] {
  // First, separate side effect imports
  const sideEffectImports = imports.filter(imp => imp.isSideEffect);
  const moduleImports = imports.filter(imp => !imp.isSideEffect);
  
  // Group by module name
  const moduleGroups = new Map<string, ParsedImport[]>();
  
  for (const imp of moduleImports) {
    if (!moduleGroups.has(imp.moduleName)) {
      moduleGroups.set(imp.moduleName, []);
    }
    
    moduleGroups.get(imp.moduleName)!.push(imp);
  }
  
  // Process each module to normalize imports
  const normalizedImports: ParsedImport[] = [];
  
  for (const [moduleName, moduleImps] of moduleGroups.entries()) {
    const isReactModule = /^react(-dom)?$/.test(moduleName);
    
    // Separate type imports from regular imports
    const typeImports = moduleImps.filter(imp => imp.isTypeImport);
    const regularImports = moduleImps.filter(imp => !imp.isTypeImport);
    
    // Process regular imports (default and named separately if configured)
    if (regularImports.length > 0) {
      if (config.splitDefaultAndNamed) {
        // Default imports
        const defaultImports = regularImports.filter(imp => imp.isDefaultImport);
        if (defaultImports.length > 0) {
          normalizedImports.push(defaultImports[0]); // Should only be one default import
        }
        
        // Named imports (non-default)
        const namedImports = regularImports.filter(imp => imp.hasNamedImports && !imp.isDefaultImport);
        if (namedImports.length > 0) {
          // Combine all named imports
          const combinedNames = namedImports.flatMap(imp => imp.importNames);
          
          if (combinedNames.length > 0) {
            normalizedImports.push({
              ...namedImports[0],
              importNames: combinedNames,
              isDefaultImport: false
            });
          }
        }
      } else {
        // Combine all regular imports
        const combinedImport = regularImports[0];
        const combinedNames = regularImports.flatMap(imp => imp.importNames);
        
        normalizedImports.push({
          ...combinedImport,
          importNames: combinedNames
        });
      }
    }
    
    // Process type imports
    if (typeImports.length > 0 && config.useTypeImports) {
      // Separate default type and named type if configured
      if (config.splitDefaultAndNamed) {
        // Default type imports
        const defaultTypeImports = typeImports.filter(imp => imp.isDefaultImport);
        if (defaultTypeImports.length > 0) {
          normalizedImports.push(defaultTypeImports[0]);
        }
        
        // Named type imports
        const namedTypeImports = typeImports.filter(imp => imp.hasNamedImports && !imp.isDefaultImport);
        if (namedTypeImports.length > 0) {
          // Combine all named type imports
          const combinedNames = namedTypeImports.flatMap(imp => imp.importNames);
          
          if (combinedNames.length > 0) {
            normalizedImports.push({
              ...namedTypeImports[0],
              importNames: combinedNames,
              isDefaultImport: false
            });
          }
        }
      } else {
        // Combine all type imports
        const combinedImport = typeImports[0];
        const combinedNames = typeImports.flatMap(imp => imp.importNames);
        
        normalizedImports.push({
          ...combinedImport,
          importNames: combinedNames
        });
      }
    }
  }
  
  // Sort according to rules
  return [
    // React or special libraries first
    ...normalizedImports
      .filter(imp => /^react(-dom)?$/.test(imp.moduleName))
      .sort((a, b) => {
        // React default before named imports
        if (a.isDefaultImport !== b.isDefaultImport) {
          return a.isDefaultImport ? -1 : 1;
        }
        
        // Non-type before type imports
        if (a.isTypeImport !== b.isTypeImport) {
          return a.isTypeImport ? 1 : -1;
        }
        
        // Longer before shorter if sorting by length
        if (config.sortImportsByLength) {
          return b.effectiveLength - a.effectiveLength;
        }
        
        return 0;
      }),
      
    // Then rest of the modules alphabetically
    ...normalizedImports
      .filter(imp => !/^react(-dom)?$/.test(imp.moduleName))
      .sort((a, b) => {
        // Alphabetical by module name
        if (a.moduleName !== b.moduleName) {
          return a.moduleName.localeCompare(b.moduleName);
        }
        
        // Non-type before type imports
        if (a.isTypeImport !== b.isTypeImport) {
          return a.isTypeImport ? 1 : -1;
        }
        
        // Default before named imports
        if (a.isDefaultImport !== b.isDefaultImport) {
          return a.isDefaultImport ? -1 : 1;
        }
        
        // Longer before shorter if sorting by length
        if (config.sortImportsByLength) {
          return b.effectiveLength - a.effectiveLength;
        }
        
        return 0;
      }),
      
    // Side effect imports at the bottom
    ...sideEffectImports.sort((a, b) => a.moduleName.localeCompare(b.moduleName))
  ];
}

/**
 * Format a group of imports with proper alignment
 */
function formatImportGroup(
  imports: ParsedImport[],
  config: FormatterConfig
): string {
  if (imports.length === 0) {
    return '';
  }
  
  // Find the longest import to set alignment spacing
  let maxNameLength = 0;
  if (config.alignmentSpacing) {
    for (const imp of imports) {
      if (imp.hasNamedImports && imp.importNames.length > 0) {
        // Length includes the braces and spacing
        let length = imp.isDefaultImport ? imp.importNames[0].length + 2 : 0;
        
        if (imp.isDefaultImport && imp.hasNamedImports) {
          length += 4; // ", { "
        } else if (imp.hasNamedImports) {
          length += 2; // "{ "
        }
        
        if (imp.importNames.length > 1 || imp.isDefaultImport && imp.hasNamedImports) {
          const namedLength = imp.importNames
            .slice(imp.isDefaultImport ? 1 : 0)
            .join(', ')
            .length;
          length += namedLength;
        } else if (!imp.isDefaultImport && imp.importNames.length === 1) {
          length += imp.importNames[0].length;
        }
        
        maxNameLength = Math.max(maxNameLength, length + 1); // +1 for space after import name
      } else if (imp.isDefaultImport && imp.importNames.length > 0) {
        maxNameLength = Math.max(maxNameLength, imp.importNames[0].length + 1);
      }
    }
  }
  
  // Format each import
  return imports
    .map(imp => {
      // Add leading comments if preserving
      let formatted = '';
      if (config.preserveLeadingComments && imp.leadingComments.length > 0) {
        formatted += imp.leadingComments.join('\n') + '\n';
      }
      
      // Side effect import
      if (imp.isSideEffect) {
        formatted += `import '${imp.moduleName}';`;
        return formatted;
      }
      
      // Format the import statement
      if (imp.isTypeImport && config.useTypeImports) {
        formatted += 'import type ';
      } else {
        formatted += 'import ';
      }
      
      // Default import
      if (imp.isDefaultImport && imp.importNames.length > 0) {
        formatted += imp.importNames[0];
        
        if (imp.hasNamedImports && imp.importNames.length > 1) {
          formatted += ', ';
        }
      }
      
      // Named imports
      if (imp.hasNamedImports) {
        const namedImports = imp.importNames.slice(imp.isDefaultImport ? 1 : 0);
        
        if (namedImports.length > 0) {
          if (namedImports.length <= config.singleLineNamedImportLimit) {
            // Single line format
            formatted += `{ ${namedImports.join(', ')} }`;
          } else if (config.useMultipleLines) {
            // Multi-line format
            formatted += '{\n';
            
            // Sort by length if configured
            const sortedImports = config.sortImportsByLength 
              ? [...namedImports].sort((a, b) => a.length - b.length)
              : namedImports;
            
            for (const namedImport of sortedImports) {
              const indentation = ' '.repeat(config.indentSize);
              formatted += `${indentation}${namedImport},\n`;
            }
            
            formatted += '}';
          } else {
            // Single line format for many imports
            formatted += `{ ${namedImports.join(', ')} }`;
          }
        }
      }
      
      // Add alignment spacing
      if (config.alignmentSpacing && maxNameLength > 0) {
        const currentLength = formatted.length - (formatted.startsWith('import type') ? 11 : 7);
        const spacingNeeded = Math.max(0, maxNameLength - currentLength);
        formatted += ' '.repeat(spacingNeeded);
      }
      
      // Add from clause
      formatted += ` from '${imp.moduleName}';`;
      
      // Add trailing comment if preserving
      if (config.preserveTrailingComments && imp.trailingComments.length > 0) {
        formatted += ' ' + imp.trailingComments.join(' ');
      }
      
      return formatted;
    })
    .join('\n');
}