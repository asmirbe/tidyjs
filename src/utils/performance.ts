import * as vscode from 'vscode';
import { logDebug } from './log';

export interface PerformanceOptions {
    maxImportLines: number;
}

let PERFORMANCE_OPTIONS: PerformanceOptions = {
    maxImportLines: 100
};

export function loadPerformanceConfiguration(): void {
    const config = vscode.workspace.getConfiguration('importFormatter');
    const maxImportLines = config.get<number>('performance.maxImportLines');
    
    if (typeof maxImportLines === 'number' && maxImportLines > 0) {
        PERFORMANCE_OPTIONS.maxImportLines = maxImportLines;
    }
    
    logDebug(`Configuration performance chargée: maxImportLines=${PERFORMANCE_OPTIONS.maxImportLines}`);
}

export function getPerformanceOptions(): PerformanceOptions {
    return PERFORMANCE_OPTIONS;
}

export function limitTextToImportArea(text: string): string {
    const lines = text.split('\n');
    const maxLines = Math.min(lines.length, PERFORMANCE_OPTIONS.maxImportLines);
    
    // Chercher le dernier import dans la zone limitée
    let lastImportLine = -1;
    const importRegex = /^\s*import\s+/;
    
    for (let i = 0; i < maxLines; i++) {
        if (importRegex.test(lines[i])) {
            lastImportLine = i;
        }
    }
    
    // Si aucun import n'est trouvé, retourner tout le texte limité
    if (lastImportLine === -1) {
        return lines.slice(0, maxLines).join('\n');
    }
    
    // Inclure quelques lignes après le dernier import (pour les commentaires et lignes vides)
    const buffer = 5;
    const endLine = Math.min(lastImportLine + buffer, lines.length);
    
    return lines.slice(0, endLine).join('\n');
}