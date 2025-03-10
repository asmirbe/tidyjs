import * as vscode from 'vscode';

// Add empty line between external and internal imports
import { ImportGroup } from '../types';
import { logDebug } from './log';

// Change from let to const with a setter function
export const DEFAULT_CONFIG = {
  alignmentSpacing: 1,
  importGroups: [
    { name: 'Misc', regex: /^(react|lodash|date-fns)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
  ]
};

// Use getter functions instead of mutable exports
export const getAlignmentSpacing = (): number => DEFAULT_CONFIG.alignmentSpacing;
export const getImportGroups = (): ImportGroup[] => DEFAULT_CONFIG.importGroups;

// Use this as your DEFAULT_IMPORT_GROUPS value from other files
export const DEFAULT_IMPORT_GROUPS: ImportGroup[] = DEFAULT_CONFIG.importGroups;

export function loadConfiguration(): void {
  const config = vscode.workspace.getConfiguration('importFormatter');
  logDebug(`Configuration: ${JSON.stringify(config)}`);
  
  // Charger les groupes personnalisés
  const customGroups =
      config.get<Array<{ name: string; regex: string; order: number }>>('groups');

  if (customGroups && customGroups.length > 0) {
    DEFAULT_CONFIG.importGroups = customGroups.map((group) => ({
      name: group.name,
      regex: new RegExp(group.regex),
      order: group.order,
    }));
  }
  
  // Charger la configuration d'espacement
  const alignmentSpacing = config.get<number>('alignmentSpacing');
  if (typeof alignmentSpacing === 'number' && alignmentSpacing >= 0) {
    DEFAULT_CONFIG.alignmentSpacing = alignmentSpacing;
  }
}