import * as vscode from 'vscode';
import { logDebug } from "./log";
import { ImportGroup } from "../types";

export let ALIGNMENT_SPACING = 1;

export let DEFAULT_IMPORT_GROUPS: ImportGroup[] = [
    { name: 'Misc', regex: /^(react|lodash|date-fns)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
];

export function loadConfiguration() {
    const config = vscode.workspace.getConfiguration('importFormatter');
    logDebug(`Configuration: ${JSON.stringify(config)}`);
    
    // Charger les groupes personnalisés
    const customGroups =
        config.get<Array<{ name: string; regex: string; order: number }>>('groups');

    if (customGroups && customGroups.length > 0) {
        DEFAULT_IMPORT_GROUPS = customGroups.map((group) => ({
            name: group.name,
            regex: new RegExp(group.regex),
            order: group.order,
        }));
    }
    
    // Charger la configuration d'espacement
    const alignmentSpacing = config.get<number>('alignmentSpacing');
    if (typeof alignmentSpacing === 'number' && alignmentSpacing >= 0) {
        ALIGNMENT_SPACING = alignmentSpacing;
    }
}