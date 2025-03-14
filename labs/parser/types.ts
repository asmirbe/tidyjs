/**
 * Types de configuration avancée pour le parser d'import
 */
export type ConfigImportGroup = {
  name: string;
  regex: RegExp;
  order: number;
  isDefault?: boolean; // Indique si ce groupe est utilisé par défaut pour les imports non classifiés
};

export type ImportType = 'default' | 'named' | 'typeDefault' | 'typeNamed' | 'sideEffect';
export type ImportSource = string;
export type ImportSpecifier = string;

export type TypeOrder = {
  [key in ImportType]: number;
};

export type SourcePatterns = {
  appSubfolderPattern?: RegExp; // Regex pour détecter les sous-dossiers @app
};

export type ParserConfig = {
  importGroups: ConfigImportGroup[];
  defaultGroupName?: string;    // Nom du groupe par défaut (si non spécifié, on utilise le premier groupe avec isDefault=true)
  typeOrder?: TypeOrder;        // Ordre des types d'imports
  TypeOrder?: TypeOrder;   // Ordre spécifique pour les imports React
  patterns?: SourcePatterns;    // Patterns pour classification des sources
  priorityImports?: RegExp[];   // Sources qui ont toujours priorité dans leur groupe
};

export interface ParsedImport {
  type: ImportType;
  source: ImportSource;
  specifiers: ImportSpecifier[];
  raw: string;
  groupName: string | null;
  isPriority: boolean;
  appSubfolder: string | null;
}

export interface ImportGroup {
  name: string;
  order: number;
  imports: ParsedImport[];
}

// Ajouter cette interface pour les imports invalides
export interface InvalidImport {
  raw: string;
  error: string;
}

// Modifier l'interface de retour du parser pour inclure les imports invalides
export interface ParserResult {
  groups: ImportGroup[];
  originalImports: string[];
  appSubfolders: string[];
  invalidImports?: InvalidImport[];
}

/**
 * Configuration par défaut pour le parser
 */
export const DEFAULT_CONFIG: Partial<ParserConfig> = {
  defaultGroupName: 'Misc',
  typeOrder: {
    'sideEffect': 0,
    'default': 1,
    'named': 2,
    'typeDefault': 3,
    'typeNamed': 4
  },
  TypeOrder: {
    'default': 0,
    'named': 1,
    'typeDefault': 2,
    'typeNamed': 3,
    'sideEffect': 4
  },
  patterns: {
    appSubfolderPattern: /@app\/([^/]+)/
  }
};
