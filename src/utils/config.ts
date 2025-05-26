import { Config } from '../types';
import vscode from 'vscode';
import { logDebug, logError } from './log';

export interface ConfigChangeEvent {
  configKey: string;
  newValue: unknown;
  isValid: boolean;
  errors?: string[];
}

const DEFAULT_CONFIG: Config = {
  debug: false,
  groups: [
    {
      name: 'Misc',
      order: 0,
      isDefault: true,
    }
  ],
  importOrder: {
    default: 0,
    named: 1,
    typeOnly: 2,
    sideEffect: 3,
  },
  format: {
    onSave: false,
    indent: 4,
    removeUnused: false,
    singleQuote: true,
    bracketSpacing: true,
  },
  patterns: {
    appModules: /^@app\/([a-zA-Z0-9_-]+)/,
  },
  excludedFolders: [],
};

class ConfigManager {
  private config: Config;
  private eventEmitter: vscode.EventEmitter<ConfigChangeEvent> = new vscode.EventEmitter<ConfigChangeEvent>();
  private subfolders = new Map<string, Config['groups'][0]>();
  private validationErrors: string[] = [];
  private isValid = true;

  public readonly onDidConfigChange: vscode.Event<ConfigChangeEvent> = this.eventEmitter.event;

  constructor() {
    this.config = this.deepCloneConfig(DEFAULT_CONFIG);
    this.loadConfiguration();
    this.performInitialValidation();
  }

  /**
   * Effectue une validation initiale après le chargement de la configuration
   */
  private performInitialValidation(): void {
    const validation = this.validateConfiguration(this.config);
    this.isValid = validation.isValid;
    this.validationErrors = validation.errors;
    
    if (!validation.isValid) {
      logError('Configuration validation failed:', validation.errors);
    }
  }

  /**
   * Clone profond d'une configuration en gérant correctement les RegExp
   */
  private deepCloneConfig(config: Config): Config {
    return {
      ...config,
      groups: config.groups.map(g => ({
        ...g,
        match: g.match ? new RegExp(g.match.source, g.match.flags) : undefined,
      })),
      format: { ...config.format },
      importOrder: { ...config.importOrder },
      patterns: config.patterns ? {
        ...config.patterns,
        appModules: config.patterns.appModules 
          ? new RegExp(config.patterns.appModules.source, config.patterns.appModules.flags) 
          : undefined,
      } : undefined,
      excludedFolders: config.excludedFolders ? [...config.excludedFolders] : undefined,
    };
  }

  /**
   * Valide la configuration et retourne les erreurs
   */
  private validateConfiguration(config: Config): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const defaultGroups = config.groups.filter(group => group.isDefault === true);
    
    if (defaultGroups.length === 0) {
      errors.push('No group is marked as default. At least one group must be the default.');
    } else if (defaultGroups.length > 1) {
      const groupNames = defaultGroups.map(g => `"${g.name}"`).join(', ');
      errors.push(`Multiple groups are marked as default: ${groupNames}. Only one group can be the default.`);
    }
    const orders = config.groups.map(g => g.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      const uniqueDuplicates = [...new Set(duplicateOrders)];
      errors.push(`Duplicate group orders found: ${uniqueDuplicates.join(', ')}. Each group should have a unique order.`);
    }
    const names = config.groups.map(g => g.name);
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      const uniqueDuplicateNames = [...new Set(duplicateNames)];
      errors.push(`Duplicate group names found: ${uniqueDuplicateNames.join(', ')}. Each group must have a unique name.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }


  public getConfig(): Config {
    return this.config;
  }

  public isConfigurationValid(): boolean {
    return this.isValid;
  }

  public getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  public getGroups(): Config['groups'] {
    const baseGroups = this.config.groups.map(g => ({
      ...g,
      isDefault: !!g.isDefault,
    }));

    const subfolderGroups = Array.from(this.subfolders.values());
    const combinedGroups = [...baseGroups, ...subfolderGroups];

    combinedGroups.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      if (a.isDefault && !b.isDefault) {return 1;}
      if (!a.isDefault && b.isDefault) {return -1;}

      return a.name.localeCompare(b.name);
    });

    return combinedGroups;
  }

  public registerAppSubfolder(subfolder: string): void {
    if (subfolder && !this.subfolders.has(subfolder)) {
      const internalGroupOrder = this.config.groups.find(g => g.name === 'Internal')?.order ?? 2;
      const name = `@app/${subfolder}`;
      const match = new RegExp(`^@app\\/${subfolder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

      this.subfolders.set(subfolder, {
        name,
        match,
        order: internalGroupOrder,
        isDefault: false,
      });
    }
  }

  /**
   * Parse une chaîne RegExp du format "/pattern/flags" ou "pattern"
   */
  private parseRegexString(regexStr: string): RegExp | undefined {
    if (!regexStr) {return undefined;}

    try {
      if (regexStr.startsWith('/') && regexStr.length > 1) {
        const lastSlashIndex = regexStr.lastIndexOf('/');
        if (lastSlashIndex > 0) {
          const pattern = regexStr.slice(1, lastSlashIndex);
          const flags = regexStr.slice(lastSlashIndex + 1);
          const validFlags = /^[gimsuy]*$/.test(flags);
          if (!validFlags) {
            logError(`Invalid regex flags '${flags}' in pattern: ${regexStr}`);
            return new RegExp(pattern); // Utiliser sans flags
          }
          
          return new RegExp(pattern, flags);
        } else {
          return new RegExp(regexStr.slice(1));
        }
      } else {
        return new RegExp(regexStr);
      }
    } catch (error) {
      logError(`Error parsing regex "${regexStr}":`, error);
      return undefined;
    }
  }

  public loadConfiguration(): void {
    const vsConfig = vscode.workspace.getConfiguration('tidyjs');
    let hasChanges = false;
    
    try {
      const newConfig = this.deepCloneConfig(this.config);
      const customGroupsSetting = vsConfig.get<{
        name: string;
        match?: string;
        order: number;
        isDefault?: boolean;
      }[]>('groups');

      if (customGroupsSetting !== undefined) {
        const newGroups = customGroupsSetting.map(group => {
          return {
            name: group.name,
            match: group.match ? this.parseRegexString(group.match) : undefined,
            order: group.order,
            isDefault: !!group.isDefault,
          };
        });
        logDebug('Current groups:', newConfig.groups);
        const compareWith = this.config.groups.length === 1 && this.config.groups[0].name === 'Misc' 
          ? DEFAULT_CONFIG.groups 
          : this.config.groups;

        if (JSON.stringify(this.groupsToComparable(compareWith)) !== 
            JSON.stringify(this.groupsToComparable(newGroups))) {
          newConfig.groups = newGroups;
          hasChanges = true;
          logDebug('Groups configuration changes detected');
        }
      }
      const formatSettings = {
        onSave: vsConfig.get<boolean>('format.onSave'),
        indent: vsConfig.get<number>('format.indent'),
        removeUnused: vsConfig.get<boolean>('format.removeUnused'),
        singleQuote: vsConfig.get<boolean>('format.singleQuote'),
        bracketSpacing: vsConfig.get<boolean>('format.bracketSpacing'),
      };

      for (const [key, value] of Object.entries(formatSettings)) {
        if (value !== undefined && newConfig.format[key as keyof typeof newConfig.format] !== value) {
          (newConfig.format as Record<string, unknown>)[key] = value;
          hasChanges = true;
        }
      }
      const importOrder = vsConfig.get<Config['importOrder']>('importOrder');
      if (importOrder && JSON.stringify(newConfig.importOrder) !== JSON.stringify(importOrder)) {
        newConfig.importOrder = { ...importOrder };
        hasChanges = true;
      }
      const patternsSettings = vsConfig.get<{ appModules?: string }>('patterns');
      if (patternsSettings?.appModules !== undefined) {
        if (!newConfig.patterns) {newConfig.patterns = {};}
        const newPattern = this.parseRegexString(patternsSettings.appModules);
        if (newPattern && (
          !newConfig.patterns.appModules ||
          newConfig.patterns.appModules.source !== newPattern.source ||
          newConfig.patterns.appModules.flags !== newPattern.flags
        )) {
          newConfig.patterns.appModules = newPattern;
          hasChanges = true;
        }
      }
      const debug = vsConfig.get<boolean>('debug');
      if (debug !== undefined && newConfig.debug !== debug) {
        newConfig.debug = debug;
        hasChanges = true;
      }
      const excludedFolders = vsConfig.get<string[]>('excludedFolders');
      if (excludedFolders !== undefined && JSON.stringify(newConfig.excludedFolders) !== JSON.stringify(excludedFolders)) {
        newConfig.excludedFolders = [...excludedFolders];
        hasChanges = true;
      }
      if (hasChanges) {
        this.applyConfigurationChanges(newConfig);
      } else {
        const validation = this.validateConfiguration(newConfig);
        if (!validation.isValid) {
          logError('Current configuration is invalid:', validation.errors);
          this.validationErrors = validation.errors;
          this.isValid = false;
          this.fireConfigChangeEvent('config', this.config, false, validation.errors);
        } else if (!this.isValid) {
          this.isValid = true;
          this.validationErrors = [];
          this.fireConfigChangeEvent('config', this.config, true);
        }
      }

    } catch (error) {
      logError('Error loading configuration:', error);
      this.validationErrors = [`Configuration loading error: ${error}`];
      this.isValid = false;
      this.fireConfigChangeEvent('config', this.config, false, this.validationErrors);
    }
  }

  /**
   * Convertit les groupes en format comparable (pour détecter les changements)
   */
  private groupsToComparable(groups: Config['groups']) {
    return groups.map(g => ({
      name: g.name,
      order: g.order,
      isDefault: g.isDefault,
      matchSource: g.match?.source,
      matchFlags: g.match?.flags,
    }));
  }

  /**
   * Applique les changements de configuration sans auto-réparation
   */
  private applyConfigurationChanges(newConfig: Config): void {
    const validation = this.validateConfiguration(newConfig);
    
    if (validation.isValid) {
      this.config = newConfig;
      this.validationErrors = [];
      this.isValid = true;
      this.clearSubfolders();
      this.fireConfigChangeEvent('config', this.config, true);
      logDebug('Configuration updated successfully');
    } else {
      logError('Invalid configuration detected:', validation.errors);
      this.validationErrors = validation.errors;
      this.isValid = false;
      this.fireConfigChangeEvent('config', this.config, false, validation.errors);
    }
  }

  /**
   * Vide le cache des sous-dossiers
   */
  private clearSubfolders(): void {
    if (this.subfolders.size > 0) {
      this.subfolders.clear();
      logDebug('Cleared cached subfolders due to configuration change');
    }
  }

  /**
   * Émet un événement de changement de configuration
   */
  private fireConfigChangeEvent(configKey: string, newValue: unknown, isValid: boolean, errors?: string[]): void {
    this.eventEmitter.fire({
      configKey,
      newValue,
      isValid,
      errors,
    });
  }

  public getParserConfig(): Config {
    return {
      ...this.getConfig(),
      groups: this.getGroups(),
    };
  }

  /**
   * Force le rechargement de la configuration
   */
  public forceReload(): void {
    logDebug('Force reloading configuration...');
    this.loadConfiguration();
  }

  /**
   * Souscrit aux changements de configuration avec validation
   */
  public onConfigChange(callback: (config: Config, isValid: boolean, errors?: string[]) => void): vscode.Disposable {
    return this.onDidConfigChange(event => {
      if (event.configKey === 'config') {
        callback(this.getConfig(), event.isValid, event.errors);
      }
    });
  }
}

export const configManager = new ConfigManager();