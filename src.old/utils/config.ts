import * as vscode from 'vscode';
import { FormatterConfig, ImportGroup } from '../types';

export interface ConfigChangeEvent {
  configKey: string;
  newValue: unknown;
}

const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  importGroups: [
    { name: 'Misc', regex: /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  alignmentSpacing: 1,
  maxLineLength: 150,
  formatOnSave: false,
  regexPatterns: (() => {
    const patterns = {
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
    };

    const compiledRegex: Record<string, RegExp> = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      compiledRegex[key] = new RegExp(pattern.source, pattern.flags);
    }

    return compiledRegex as FormatterConfig['regexPatterns'];
  })(),
};

class ConfigManager {
  private config: FormatterConfig;
  private eventEmitter: vscode.EventEmitter<ConfigChangeEvent> = new vscode.EventEmitter<ConfigChangeEvent>();
  private appSubfolders: Map<string, ImportGroup> = new Map();

  public readonly onDidConfigChange: vscode.Event<ConfigChangeEvent> = this.eventEmitter.event;

  constructor() {
    this.config = { ...DEFAULT_FORMATTER_CONFIG };
    this.loadConfiguration();
  }

  public getConfig(): FormatterConfig {
    return this.config;
  }

  public getImportGroups(): ImportGroup[] {
    const baseGroups = [...this.config.importGroups];
    const appSubfolderGroups = Array.from(this.appSubfolders.values());

    const sortedGroups = [...baseGroups, ...appSubfolderGroups].sort((a, b) => {
      if (a.name === 'Misc') return -1;
      if (b.name === 'Misc') return 1;
      if (a.name === 'DS') return -1;
      if (b.name === 'DS') return 1;

      const aIsApp = a.name.startsWith('@app');
      const bIsApp = b.name.startsWith('@app');

      if (aIsApp && !bIsApp) return -1;
      if (!aIsApp && bIsApp) return 1;

      if (aIsApp && bIsApp) {
        if (a.name === '@app') return 1;
        if (b.name === '@app') return -1;
        return a.name.localeCompare(b.name);
      }

      return a.order - b.order;
    });

    return sortedGroups;
  }

  public getAlignmentSpacing(): number {
    return this.config.alignmentSpacing;
  }

  public getRegexPatterns(): FormatterConfig['regexPatterns'] {
    return this.config.regexPatterns;
  }

  public registerAppSubfolder(subfolder: string): void {
    if (subfolder && !this.appSubfolders.has(subfolder)) {
      const order = 2;
      const name = `@app/${subfolder}`;
      const regex = new RegExp(`^@app\\/${subfolder}`);

      this.appSubfolders.set(subfolder, {
        name,
        regex,
        order
      });
    }
  }

  public loadConfiguration(): void {
    const vsConfig = vscode.workspace.getConfiguration('importFormatter');

    const customGroups = vsConfig.get<Array<{ name: string; regex: string; order: number }>>('groups');
    if (customGroups && customGroups.length > 0) {
      this.config.importGroups = customGroups.map((group) => ({
        name: group.name,
        regex: new RegExp(group.regex),
        order: group.order,
      }));
      this.eventEmitter.fire({ configKey: 'importGroups', newValue: this.config.importGroups });
    }

    const alignmentSpacing = vsConfig.get<number>('alignmentSpacing');
    if (typeof alignmentSpacing === 'number' && alignmentSpacing >= 0) {
      this.config.alignmentSpacing = alignmentSpacing;
      this.eventEmitter.fire({ configKey: 'alignmentSpacing', newValue: alignmentSpacing });
    }

    const formatOnSave = vsConfig.get<boolean>('formatOnSave');
    if (typeof formatOnSave === 'boolean') {
      this.config.formatOnSave = formatOnSave;
      this.eventEmitter.fire({ configKey: 'formatOnSave', newValue: formatOnSave });
    }

    const maxLineLength = vsConfig.get<number>('maxLineLength');
    if (typeof maxLineLength === 'number' && maxLineLength > 0) {
      this.config.maxLineLength = maxLineLength;
      this.eventEmitter.fire({ configKey: 'maxLineLength', newValue: maxLineLength });
    }
  }

  public getFormatOnSave(): boolean {
    return this.config.formatOnSave;
  }

  public getFormatterConfig(): FormatterConfig {
    return {
      importGroups: this.getImportGroups(),
      alignmentSpacing: this.getAlignmentSpacing(),
      regexPatterns: this.getRegexPatterns(),
      maxLineLength: this.config.maxLineLength,
      formatOnSave: this.config.formatOnSave
    };
  }
}

export const configManager = new ConfigManager();

export const DEFAULT_IMPORT_GROUPS: ImportGroup[] = configManager.getImportGroups();