import * as vscode from 'vscode';
import { FormatterConfig, ImportGroup } from '../types';

export interface ConfigChangeEvent {
  configKey: string;
  newValue: unknown;
}

const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
  importGroups: [
    { name: 'Misc', regex: /^(react|lodash|date-fns)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ],
  alignmentSpacing: 1,
  regexPatterns: (() => {
    const patterns = {
      importLine: /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm,
      sectionComment: /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils|.*\b(?:misc|ds|dossier|core|library|utils)\b.*)\s*$/gim,
      importFragment: /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/,
      sectionCommentPattern: /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils)/,
      anyComment: /^\s*\/\//,
      typeDeclaration: /^type\s+[A-Za-z0-9_]+(<.*>)?\s*=/,
      codeDeclaration: /^(interface|class|enum|function|const|let|var|export)\s+[A-Za-z0-9_]+/,
      orphanedFragments: /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm,
      possibleCommentFragment: /^\s*[a-z]{1,5}\s*$|^\s*\/?\s*[A-Z][a-z]+\s*$|(^\s*\/+\s*$)/
    };
    
    const compiledRegex: Record<string, RegExp> = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      compiledRegex[key] = new RegExp(pattern.source, pattern.flags);
    }
    
    return compiledRegex as FormatterConfig['regexPatterns'];
  })()
};

class ConfigManager {
  private config: FormatterConfig;
  private eventEmitter: vscode.EventEmitter<ConfigChangeEvent> = new vscode.EventEmitter<ConfigChangeEvent>();
  
  public readonly onDidConfigChange: vscode.Event<ConfigChangeEvent> = this.eventEmitter.event;

  constructor() {
    this.config = { ...DEFAULT_FORMATTER_CONFIG };
    this.loadConfiguration();
  }

  public getConfig(): FormatterConfig {
    return this.config;
  }

  public getImportGroups(): ImportGroup[] {
    return this.config.importGroups;
  }

  public getAlignmentSpacing(): number {
    return this.config.alignmentSpacing;
  }

  public getRegexPatterns(): FormatterConfig['regexPatterns'] {
    return this.config.regexPatterns;
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
  }

  public getFormatterConfig(): FormatterConfig {
    return {
        importGroups: configManager.getImportGroups(),
        alignmentSpacing: configManager.getAlignmentSpacing(),
        regexPatterns: configManager.getRegexPatterns()
    };
}
}

export const configManager = new ConfigManager();

export const DEFAULT_IMPORT_GROUPS: ImportGroup[] = configManager.getImportGroups();