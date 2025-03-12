/**
 * Framework de test amélioré pour les extensions VSCode
 * Cette approche offre une méthode plus robuste pour tester le formateur d'imports
 */

// Couleurs ANSI pour améliorer la lisibilité
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERLINE: '\x1b[4m'
};

// Emojis pour une interface plus claire
const EMOJI = {
  SUCCESS: '✅',
  FAILURE: '❌',
  ERROR: '⚠️',
  INFO: 'ℹ️',
  ROCKET: '🚀',
  MAGNIFIER: '🔍',
  CHART: '📊',
  CLOCK: '⏱️',
  CHECK: '✅',
  CROSS: '❌',
  STOPWATCH: '⏱️'
};

// Création d'un module vscode simulé complet
const mockVscode = {
  window: {
    createOutputChannel: (name) => ({
      name,
      appendLine: () => {},
      show: () => {},
      dispose: () => {},
      clear: () => {},
      replace: () => {},
      append: () => {},
      hide: () => {}
    }),
    showErrorMessage: (msg) => console.error(`${COLORS.RED}${EMOJI.ERROR} [VSCode Error]: ${msg}${COLORS.RESET}`),
    showInformationMessage: (msg) => console.log(`${COLORS.BLUE}${EMOJI.INFO} [VSCode Info]: ${msg}${COLORS.RESET}`)
  },
  workspace: {
    getConfiguration: (section) => ({
      get: (key) => {
        // Configuration de l'extension
        const config = {
          importFormatter: {
            groups: [
              { name: 'Misc', regex: '^(react|react-.*|lodash)$', order: 0 },
              { name: 'DS', regex: '^ds$', order: 1 },
              { name: '@app', regex: '^@app$', order: 2 }
            ],
            alignmentSpacing: 1
          }
        };
        
        return config[section]?.[key] || null;
      }
    })
  },
  EventEmitter: class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    event = (listener) => {
      this.listeners.push(listener);
      return { dispose: () => {} };
    };
    fire = (data) => {
      this.listeners.forEach(listener => listener(data));
    };
  },
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  Range: class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
      this.start = { line: startLine, character: startCharacter };
      this.end = { line: endLine, character: endCharacter };
    }
  },
  commands: {
    registerCommand: (id, handler) => ({ 
      dispose: () => {},
      id,
      handler
    })
  }
};

/**
 * Crée une configuration complète pour le formateur
 * @returns {Object} Configuration du formateur
 */
const createMockConfig = () => ({
  importGroups: [
    { name: 'Misc', regex: /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@app', regex: /^@app/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  alignmentSpacing: 1,
  regexPatterns: {
    importLine: /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm,
    sectionComment: /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils|.*\b(?:misc|ds|dossier|client|notification|core|library|utils)\b.*)\s*$/gim,
    importFragment: /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/,
    sectionCommentPattern: /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils)/,
    anyComment: /^\s*\/\//,
    typeDeclaration: /^type\s+[A-Za-z0-9_]+(<.*>)?\s*=/,
    codeDeclaration: /^(interface|class|enum|function|const|let|var|export)\s+[A-Za-z0-9_]+/,
    orphanedFragments: /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm,
    possibleCommentFragment: /^\s*[a-z]{1,5}\s*$|^\s*\/?\s*[A-Z][a-z]+\s*$|(^\s*\/+\s*$)/,
    appSubfolderPattern: /^@app\/([a-zA-Z0-9_-]+)/
  }
});


module.exports = { mockVscode, createMockConfig, COLORS, EMOJI };
