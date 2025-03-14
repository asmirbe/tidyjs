/**
 * Classe d'erreur personnalisée pour le parser d'imports
 */
export class ImportParserError extends Error {
  constructor(message: string, public raw: string) {
    super(message);
    this.name = 'ImportParserError';
  }
}
