import { validateAndFixImportWithBabel } from './fixer';
import { ImportParser } from './parser';
import { ImportParserError } from './errors';
import {
  ParserConfig,
  ConfigImportGroup,
  ImportGroup,
  TypeOrder,
  SourcePatterns,
  InvalidImport,
  ParserResult,
  ParsedImport,
  DEFAULT_CONFIG
} from './types';

/**
 * Fonction utilitaire pour analyser les imports dans un code source
 */
function parseImports(sourceCode: string, config: ParserConfig): ParserResult {
  const parser = new ImportParser(config);
  const { groups, originalImports, invalidImports } = parser.parse(sourceCode);
  const appSubfolders = parser.getAppSubfolders();

  return { groups, originalImports, appSubfolders, invalidImports };
}

// Exporter tout ce qui est nécessaire
export {
  ImportParser,
  ImportParserError,
  parseImports,
  validateAndFixImportWithBabel,
  DEFAULT_CONFIG
};

// Exporter les types
export type {
  ParserConfig,
  ConfigImportGroup,
  ImportGroup,
  TypeOrder,
  SourcePatterns,
  InvalidImport,
  ParserResult,
  ParsedImport
};
