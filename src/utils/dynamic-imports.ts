import { logDebug } from './log';

/**
 * Détecte les imports dynamiques dans le code source
 * Format: import('./path'), import("./path"), import(`./path`)
 * @param text Le texte source à analyser
 * @returns Une liste de positions des imports dynamiques
 */
export function detectDynamicImports(text: string): { start: number, end: number }[] {
    const dynamicImports: { start: number, end: number }[] = [];
    
    // Regex pour trouver les imports dynamiques
    // Supporte les différents types de guillemets (', ", `)
    const dynamicImportRegex = /import\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
    
    let match;
    while ((match = dynamicImportRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const importPath = match[2];
        
        dynamicImports.push({ start, end });
        logDebug(`Import dynamique détecté: ${match[0]} (chemin: ${importPath}) à position ${start}-${end}`);
    }
    
    logDebug(`Total imports dynamiques détectés: ${dynamicImports.length}`);
    return dynamicImports;
}

/**
 * Vérifie si une position donnée est dans un import dynamique
 * @param position La position à vérifier
 * @param dynamicImports Liste des imports dynamiques
 * @returns true si la position est dans un import dynamique
 */
export function isInDynamicImport(
    position: number, 
    dynamicImports: { start: number, end: number }[]
): boolean {
    return dynamicImports.some(di => position >= di.start && position <= di.end);
}

/**
 * Filtre les imports statiques en excluant ceux qui se trouvent à l'intérieur 
 * des chaînes d'imports dynamiques
 * @param text Le texte source
 * @param importMatches Les correspondances d'imports réguliers
 * @returns Les correspondances filtrées (sans les faux positifs des imports dynamiques)
 */
export function filterImportsInsideDynamicImports(
    text: string, 
    importMatches: RegExpExecArray[]
): RegExpExecArray[] {
    const dynamicImports = detectDynamicImports(text);
    
    if (dynamicImports.length === 0) {
        return importMatches; // Pas d'imports dynamiques, rien à filtrer
    }
    
    return importMatches.filter(match => {
        const start = match.index;
        return !isInDynamicImport(start, dynamicImports);
    });
}