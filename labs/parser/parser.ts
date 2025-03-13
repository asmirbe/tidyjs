/**
 * Types de configuration avancée pour le parser d'import
 */
type ConfigImportGroup = {
  name: string;
  regex: RegExp;
  order: number;
  isDefault?: boolean; // Indique si ce groupe est utilisé par défaut pour les imports non classifiés
};

type TypeOrder = {
  [key in ImportType]: number;
};

type SourcePatterns = {
  appSubfolderPattern?: RegExp; // Regex pour détecter les sous-dossiers @app
  reactSourcePattern?: RegExp;  // Regex pour identifier les sources React
};

type ParserConfig = {
  importGroups: ConfigImportGroup[];
  defaultGroupName?: string;    // Nom du groupe par défaut (si non spécifié, on utilise le premier groupe avec isDefault=true)
  typeOrder?: TypeOrder;        // Ordre des types d'imports
  reactTypeOrder?: TypeOrder;   // Ordre spécifique pour les imports React
  patterns?: SourcePatterns;    // Patterns pour classification des sources
  priorityImports?: RegExp[];   // Sources qui ont toujours priorité dans leur groupe
  makePriorityFirstElementInGroup?: boolean;
};

/**
 * Types pour l'analyse et l'organisation des imports
 */
type ImportType = 'default' | 'named' | 'typeDefault' | 'typeNamed' | 'sideEffect';
type ImportSource = string;
type ImportSpecifier = string;

interface ParsedImport {
  type: ImportType;
  source: ImportSource;
  specifiers: ImportSpecifier[];
  raw: string;
  groupName: string | null;
  isPriority: boolean;
  appSubfolder: string | null;
}

interface ImportGroup {
  name: string;
  order: number;
  imports: ParsedImport[];
}

/**
 * Configuration par défaut pour le parser
 */
const DEFAULT_CONFIG: Partial<ParserConfig> = {
  defaultGroupName: 'Misc',
  typeOrder: {
    'sideEffect': 0,
    'default': 1,
    'named': 2,
    'typeDefault': 3,
    'typeNamed': 4
  },
  reactTypeOrder: {
    'default': 0,
    'named': 1,
    'typeDefault': 2,
    'typeNamed': 3,
    'sideEffect': 4
  },
  patterns: {
    appSubfolderPattern: /@app\/([^/]+)/,
    reactSourcePattern: /^react(-.*)?$/
  }
};

/**
 * Classe principale pour le parser d'imports
 */
class ImportParser {
  private readonly config: ParserConfig;
  private readonly defaultGroupName: string;
  private readonly typeOrder: TypeOrder;
  private readonly reactTypeOrder: TypeOrder;
  private readonly patterns: SourcePatterns;
  private readonly priorityImportPatterns: RegExp[];
  
  private appSubfolders: Set<string>;

  constructor(config: ParserConfig) {
    // Fusionner la configuration fournie avec les valeurs par défaut
    this.config = {
      ...config,
      typeOrder: { ...(DEFAULT_CONFIG.typeOrder as TypeOrder), ...config.typeOrder } as TypeOrder,
      reactTypeOrder: { ...(DEFAULT_CONFIG.reactTypeOrder as TypeOrder), ...config.reactTypeOrder } as TypeOrder,
      patterns: { ...DEFAULT_CONFIG.patterns, ...config.patterns }
    };
    
    this.appSubfolders = new Set<string>();
    
    // Déterminer le groupe par défaut
    if (config.defaultGroupName) {
      this.defaultGroupName = config.defaultGroupName;
    } else {
      const defaultGroup = config.importGroups.find(g => g.isDefault);
      this.defaultGroupName = defaultGroup ? defaultGroup.name : 'Misc';
    }
    
    this.typeOrder = this.config.typeOrder as TypeOrder;
    this.reactTypeOrder = this.config.reactTypeOrder as TypeOrder;
    this.patterns = this.config.patterns as SourcePatterns;
    this.priorityImportPatterns = this.config.priorityImports || [];
  }

  /**
   * Parse le code source pour extraire et organiser les imports
   */
  public parse(sourceCode: string): { groups: ImportGroup[]; originalImports: string[] } {
    // Extraire tous les imports du code source - Modifiée pour mieux gérer les espaces
    const importRegex = /^\s*import\s+(?:type\s+)?(?:{[^}]*}|\*\s+as\s+\w+|\w+)?(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))?(?:\s+from)?\s+['"]([^'"]+)['"];?(?:\s*\/\/.*)?$/gm;
    
    const originalImports: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(sourceCode)) !== null) {
      originalImports.push(match[0].trim());
    }

    // Analyser chaque import et séparer les types inline
    let parsedImports: ParsedImport[] = [];
    for (const importStmt of originalImports) {
      const imports = this.parseImport(importStmt);
      // Si c'est un array, on a séparé les imports normaux des imports de type inline
      if (Array.isArray(imports)) {
        parsedImports = parsedImports.concat(imports);
      } else {
        parsedImports.push(imports);
      }
    }
    
    // Fusionner les imports de même type et même source
    parsedImports = this.mergeImports(parsedImports);
    
    // Organiser les imports en groupes
    const groups = this.organizeImportsIntoGroups(parsedImports);
    
    return { groups, originalImports };
  }

  /**
   * Analyse un statement d'import individuel
   * @returns ParsedImport | ParsedImport[] - Renvoie un seul import ou un tableau si des types inline sont détectés
   */
  private parseImport(importStmt: string): ParsedImport | ParsedImport[] {
    // Déterminer le type d'import
    const isTypeImport = importStmt.includes('import type');
    const isSideEffect = !importStmt.includes(' from ');
    
    // Extraire la source (module)
    const sourceMatch = importStmt.match(/from\s+['"]([^'"]+)['"]/);
    const source = sourceMatch ? sourceMatch[1] : importStmt.match(/import\s+['"]([^'"]+)['"]/)?.[1] ?? '';
    
    // Vérifier si c'est un import prioritaire (ex: React)
    const isPriority = this.isSourcePriority(source);
    
    // Déterminer le groupe auquel appartient cet import
    const groupName = this.determineGroupName(source);
    
    // Détecter les sous-dossiers @app
    let appSubfolder: string | null = null;
    
    if (this.patterns.appSubfolderPattern) {
      const appSubfolderMatch = source.match(this.patterns.appSubfolderPattern);
      if (appSubfolderMatch?.[1]) {
        appSubfolder = appSubfolderMatch[1];
        this.appSubfolders.add(appSubfolder);
      }
    }
    
    // Extraire les specifiers (ce qui est importé)
    let type: ImportType = 'default';
    let specifiers: string[] = [];
    
    if (isSideEffect) {
      type = 'sideEffect';
    } else if (isTypeImport) {
      if (importStmt.includes('{')) {
        type = 'typeNamed';
        const namedMatch = importStmt.match(/import\s+type\s+{([^}]+)}/);
        if (namedMatch) {
          specifiers = namedMatch[1].split(',').map(s => s.trim());
        }
      } else {
        type = 'typeDefault';
        const defaultMatch = importStmt.match(/import\s+type\s+(\w+)/);
        if (defaultMatch) {
          specifiers = [defaultMatch[1]];
        }
      }
    } else if (importStmt.includes('{')) {
      type = 'named';
      const namedMatch = importStmt.match(/import\s+(?:\w+\s*,\s*)?{([^}]+)}/);
      
      // Vérifier s'il y a un import par défaut avec des imports nommés
      const defaultWithNamedMatch = importStmt.match(/import\s+(\w+)\s*,\s*{/);
      const defaultSpecifier = defaultWithNamedMatch ? defaultWithNamedMatch[1] : null;
      
      if (namedMatch) {
        // Traiter chaque spécificateur individuellement pour détecter les types inline
        const rawSpecifiers = namedMatch[1].split(',').map(s => s.trim());
        
        // Séparer les specifiers normaux des specifiers de type
        const regularSpecifiers: string[] = [];
        const typeSpecifiers: string[] = [];
        
        for (const spec of rawSpecifiers) {
          if (spec.startsWith('type ')) {
            // C'est un type inline, extraire le nom réel
            typeSpecifiers.push(spec.substring(5).trim());
          } else {
            regularSpecifiers.push(spec);
          }
        }
        
        // Si nous avons des types inline, nous devons créer des imports séparés
        if (typeSpecifiers.length > 0) {
          const result: ParsedImport[] = [];
          
          // Si nous avons aussi des imports par défaut, on les traite séparément
          if (defaultSpecifier) {
            result.push({
              type: 'default',
              source,
              specifiers: [defaultSpecifier],
              raw: importStmt,
              groupName,
              isPriority,
              appSubfolder
            });
          }
          
          // Ajouter les imports nommés réguliers s'il y en a
          if (regularSpecifiers.length > 0) {
            result.push({
              type: 'named',
              source,
              specifiers: regularSpecifiers,
              raw: importStmt,
              groupName,
              isPriority,
              appSubfolder
            });
          }
          
          // Ajouter les imports de type nommés
          result.push({
            type: 'typeNamed',
            source,
            specifiers: typeSpecifiers,
            raw: importStmt,
            groupName,
            isPriority,
            appSubfolder
          });
          
          return result;
        }
        
        // Si pas de types inline, on continue normalement
        specifiers = regularSpecifiers;
        
        // Ajouter l'import par défaut s'il existe
        if (defaultSpecifier) {
          type = 'default'; // En cas de mixte, on considère comme default pour le tri
          specifiers.unshift(defaultSpecifier);
        }
      }
    } else {
      type = 'default';
      const defaultMatch = importStmt.match(/import\s+(\w+|\*\s+as\s+\w+)/);
      if (defaultMatch) {
        specifiers = [defaultMatch[1]];
      }
    }
    
    return {
      type,
      source,
      specifiers,
      raw: importStmt,
      groupName,
      isPriority,
      appSubfolder
    };
  }

  /**
   * Vérifie si une source est prioritaire dans son groupe (comme React)
   */
  private isSourcePriority(source: string): boolean {
    // Vérifier si la source correspond à un pattern React configuré
    if (this.patterns.reactSourcePattern && this.patterns.reactSourcePattern.test(source)) {
      return true;
    }
    
    // Vérifier dans les patterns de priorité configurés
    return this.priorityImportPatterns.some(pattern => pattern.test(source));
  }

  /**
   * Fusionne les imports de même type et même source
   * @param imports Les imports à fusionner
   * @returns Les imports fusionnés
   */
  private mergeImports(imports: ParsedImport[]): ParsedImport[] {
    // Map pour stocker les imports fusionnés par clé (type + source)
    const mergedImportsMap = new Map<string, ParsedImport>();
    
    for (const importObj of imports) {
      // Créer une clé unique basée sur le type et la source
      const key = `${importObj.type}:${importObj.source}`;
      
      if (mergedImportsMap.has(key)) {
        // Si un import de même type et source existe déjà, fusionner les specifiers
        const existingImport = mergedImportsMap.get(key)!;
        
        // Créer un ensemble pour éliminer les doublons
        const specifiersSet = new Set<string>([
          ...existingImport.specifiers,
          ...importObj.specifiers
        ]);
        
        // Mise à jour des specifiers sans doublon
        existingImport.specifiers = Array.from(specifiersSet).sort();
        
        // Conserver la raw declaration la plus complète (la plus longue en général)
        if (importObj.raw.length > existingImport.raw.length) {
          existingImport.raw = importObj.raw;
        }
      } else {
        // Sinon, ajouter le nouvel import
        mergedImportsMap.set(key, {
          ...importObj,
          // Trier les specifiers par ordre alphabétique
          specifiers: [...importObj.specifiers].sort()
        });
      }
    }
    
    // Convertir la map en tableau
    return Array.from(mergedImportsMap.values());
  }

  /**
   * Détermine le nom du groupe pour un import en fonction de son module source
   */
  private determineGroupName(source: string): string {
    // Vérifier dans les groupes configurés
    for (const group of this.config.importGroups) {
      if (group.regex.test(source)) {
        return group.name;
      }
    }
    
    // Par défaut, utiliser le groupe par défaut configuré
    return this.defaultGroupName;
  }

  /**
   * Organise les imports analysés en groupes structurés et triés
   */
  private organizeImportsIntoGroups(imports: ParsedImport[]): ImportGroup[] {
    const groupMap = new Map<string, ParsedImport[]>();
    const appSubfolderGroups = new Map<string, ParsedImport[]>();

    // Créer les groupes de base à partir de la configuration
    const configGroupMap = new Map<string, number>();
    this.config.importGroups.forEach(group => {
      configGroupMap.set(group.name, group.order);
      groupMap.set(group.name, []);
    });

    // S'assurer que le groupe par défaut existe
    if (!groupMap.has(this.defaultGroupName)) {
      const defaultOrder = 999; // Ordre élevé par défaut
      groupMap.set(this.defaultGroupName, []);
      configGroupMap.set(this.defaultGroupName, defaultOrder);
    }

    // Répartir les imports dans les groupes appropriés
    imports.forEach(importObj => {
      // Si c'est un import de sous-dossier @app, le mettre dans son propre groupe
      if (importObj.appSubfolder) {
        const subfolder = importObj.appSubfolder;
        const groupName = `@app/${subfolder}`;
        
        if (!appSubfolderGroups.has(groupName)) {
          appSubfolderGroups.set(groupName, []);
        }
        
        appSubfolderGroups.get(groupName)!.push(importObj);
      } 
      // Sinon, le mettre dans son groupe configuré
      else if (importObj.groupName && groupMap.has(importObj.groupName)) {
        groupMap.get(importObj.groupName)!.push(importObj);
      } 
      // Fallback sur le groupe par défaut
      else {
        groupMap.get(this.defaultGroupName)!.push(importObj);
      }
    });

    // Pour chaque groupe, trier les imports selon les règles spécifiées
    groupMap.forEach((importsInGroup, groupName) => {
      console.log('groupName', groupName);
      groupMap.set(groupName, this.sortImportsWithinGroup(importsInGroup));
    });

    // Trier les sous-dossiers @app
    appSubfolderGroups.forEach((importsInGroup, groupName) => {
      appSubfolderGroups.set(groupName, this.sortImportsWithinGroup(importsInGroup));
    });

    // Fusionner tous les groupes en une liste finale
    const result: ImportGroup[] = [];

    // Ajouter les groupes configurés
    for (const [name, importsInGroup] of groupMap.entries()) {
      const order = configGroupMap.get(name) ?? 999; // Ordre par défaut très élevé si non configuré
      if (importsInGroup.length > 0) {
        result.push({
          name,
          order,
          imports: importsInGroup
        });
      }
    }

    // Ajouter les groupes de sous-dossiers @app (ordre basé sur la configuration de @app)
    const appGroup = this.config.importGroups.find(g => g.regex.toString().includes('@app'));
    const appGroupOrder = appGroup ? appGroup.order : 2; // Par défaut ordre 2
    
    const sortedSubfolders = Array.from(appSubfolderGroups.keys()).sort();
    
    for (const subfolderName of sortedSubfolders) {
      const subfolderImports = appSubfolderGroups.get(subfolderName)!;
      if (subfolderImports.length > 0) {
        result.push({
          name: subfolderName,
          order: appGroupOrder,
          imports: subfolderImports
        });
      }
    }

    // Trier les groupes selon leur ordre de configuration
    return result.sort((a, b) => {
      // Si même ordre, trier par nom pour les sous-dossiers @app
      if (a.order === b.order) {
        return a.name.localeCompare(b.name);
      }
      return a.order - b.order;
    });
  }

  /**
   * Trie les imports au sein d'un même groupe selon les règles spécifiées
   */
  private sortImportsWithinGroup(imports: ParsedImport[]): ParsedImport[] {
    return imports.sort((a, b) => {
      // Règle 1: Les imports prioritaires (React, etc.) ont toujours la priorité dans leur groupe
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      
      // Si les deux sont des imports prioritaires, appliquer l'ordre spécifique (ex: React)
      if (a.isPriority && b.isPriority) {
        if (a.type !== b.type) {
          return this.reactTypeOrder[a.type] - this.reactTypeOrder[b.type];
        }
      }
      
      // Règle 2: Appliquer la hiérarchie générale des types d'imports
      if (a.type !== b.type) {
        return this.typeOrder[a.type] - this.typeOrder[b.type];
      }
      
      // Règle 3: Tri alphabétique sur la source
      return a.source.localeCompare(b.source);
    });
  }

  /**
   * Récupère les sous-dossiers @app détectés
   */
  public getAppSubfolders(): string[] {
    return Array.from(this.appSubfolders).sort();
  }
}

/**
 * Fonction utilitaire pour parser le code source
 */
function parseImports(sourceCode: string, config: ParserConfig): { 
  groups: ImportGroup[]; 
  originalImports: string[];
  appSubfolders: string[];
} {
  const parser = new ImportParser(config);
  const { groups, originalImports } = parser.parse(sourceCode);
  const appSubfolders = parser.getAppSubfolders();
  
  return { groups, originalImports, appSubfolders };
}

/**
 * Exporte les fonctions et classes principales
 */
export { ImportParser, parseImports, DEFAULT_CONFIG };
export type { ParserConfig, ConfigImportGroup, ImportGroup, TypeOrder, SourcePatterns };