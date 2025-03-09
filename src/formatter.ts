import * as ts from 'typescript';
import { logDebug } from './utils/log';
import { DEFAULT_IMPORT_GROUPS as IMPORTED_IMPORT_GROUPS } from './utils/config';
import type { FormattedImport } from './types';
import { sortImportNamesByLength } from './utils/misc';
import { parseImports } from './parser';

let IMPORT_GROUPS = [...IMPORTED_IMPORT_GROUPS];
let ALIGNMENT_SPACING = 1; // Valeur par défaut

function alignImportsBySection(formattedGroups: Array<{
    groupName: string;
    commentLine: string;
    importLines: string[];
}>): string[] {
    const resultLines: string[] = [];
    // Maintenir un ensemble de noms de groupe déjà vus
    const seenGroups = new Set<string>();

    for (const group of formattedGroups) {
        const groupName = group.groupName;
        
        // Si ce groupe a déjà été traité, ignorer son commentaire
        if (seenGroups.has(groupName)) {
            logDebug(`Groupe dupliqué ignoré: ${groupName}`);
            continue;
        }
        
        seenGroups.add(groupName);
        
        // Ajouter le commentaire de groupe normalisé
        resultLines.push(`// ${groupName}`);

        // Aligner les imports au sein du groupe
        const imports = group.importLines;

        // Trouver le "from" le plus éloigné dans ce groupe
        const maxWidth = imports.reduce((max: number, line: string) => {
            if (line.includes('\n')) {
                const lines = line.split('\n');
                const lastLine = lines[lines.length - 1];
                const fromIndex = lastLine.indexOf('from');
                if (fromIndex > 0) {
                    return Math.max(max, fromIndex);
                }
            } else {
                const fromIndex = line.indexOf('from');
                if (fromIndex > 0) {
                    return Math.max(max, fromIndex);
                }
            }
            return max;
        }, 0);

        // Aligner tous les "from" du groupe en ajoutant l'espacement configuré
        const alignedImports = imports.map((line) => {
            if (line.includes('\n')) {
                const lines = line.split('\n');
                const lastLineIndex = lines.length - 1;
                const lastLine = lines[lastLineIndex];

                const fromIndex = lastLine.indexOf('from');
                if (fromIndex > 0) {
                    // Ajouter l'espacement configuré + l'alignement
                    const padding = ' '.repeat(maxWidth - fromIndex + ALIGNMENT_SPACING);
                    lines[lastLineIndex] =
                        lastLine.substring(0, fromIndex) +
                        padding +
                        'from' +
                        lastLine.substring(fromIndex + 4);
                    return lines.join('\n');
                }
                return line;
            } else {
                const fromIndex = line.indexOf('from');
                if (fromIndex > 0) {
                    // Ajouter l'espacement configuré + l'alignement
                    const padding = ' '.repeat(maxWidth - fromIndex + ALIGNMENT_SPACING);
                    return (
                        line.substring(0, fromIndex) +
                        padding +
                        'from' +
                        line.substring(fromIndex + 4)
                    );
                }
                return line;
            }
        });

        // Ajouter les imports alignés
        for (const importLine of alignedImports) {
            resultLines.push(importLine);
        }

        // Ajouter une ligne vide après chaque groupe
        resultLines.push('');
    }

    // Nettoyage des lignes vides et commentaires dupliqués
    const cleanedLines: string[] = [];
    let previousLine = '';
    let consecutiveEmptyLines = 0;

    for (let i = 0; i < resultLines.length; i++) {
        const currentLine = resultLines[i];

        // Ne pas ajouter de commentaires identiques à la suite
        if (currentLine.startsWith('//') && previousLine === currentLine) {
            continue;
        }

        // Gérer les lignes vides
        if (currentLine.trim() === '') {
            consecutiveEmptyLines++;
            if (consecutiveEmptyLines > 1) {
                continue;
            }
        } else {
            consecutiveEmptyLines = 0;
        }

        cleanedLines.push(currentLine);
        previousLine = currentLine;
    }

    // Supprimer la dernière ligne vide si elle existe
    if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
        cleanedLines.pop();
    }

    // Ajouter une ligne vide finale pour séparer les imports du reste du code
    cleanedLines.push('');

    return cleanedLines;
}

function removeCommentsFromImports(text: string): string {
    // Définir un motif pour les commentaires de section
    const sectionCommentPattern = /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils)/;
    
    // Traiter chaque ligne séparément
    return text.split('\n').map(line => {
        // Ne pas supprimer les commentaires de section
        if (sectionCommentPattern.test(line)) {
            return line;
        }
        // Supprimer les autres commentaires
        if (/^\s*\/\//.test(line)) {
            return '';
        }
        return line;
    }).join('\n');
}

function getEffectiveLengthForSorting(importItem: FormattedImport): number {
    if (importItem.isDefaultImport && !importItem.hasNamedImports) {
        return importItem.importNames[0].length;
    }

    if (!importItem.isDefaultImport && importItem.hasNamedImports) {
        const namedImports = importItem.importNames;
        if (namedImports.length > 0) {
            return Math.min(...namedImports.map((name) => name.length));
        }
    }

    if (importItem.isDefaultImport && importItem.hasNamedImports) {
        const namedImports = importItem.importNames.slice(1);
        if (namedImports.length > 0) {
            return Math.min(...namedImports.map((name) => name.length));
        }
        return importItem.importNames[0].length;
    }

    return 999;
}

function formatImportItem(
    importItem: FormattedImport,
    statements: string[]
): void {
    const {
        moduleName,
        importNames,
        isTypeImport,
        isDefaultImport,
        hasNamedImports,
    } = importItem;

    // Si aucun nom d'import, c'est un import de module simple
    if (importNames.length === 0) {
        statements.push(`import '${moduleName}';`);
        return;
    }

    // Filtrer et trier les imports nommés
    const namedImports = hasNamedImports
        ? importNames.filter((_, index) => (isDefaultImport ? index > 0 : true))
        : [];

    // Import par défaut uniquement
    if (isDefaultImport && namedImports.length === 0) {
        if (isTypeImport) {
            statements.push(`import type ${importNames[0]} from '${moduleName}';`);
        } else {
            statements.push(`import ${importNames[0]} from '${moduleName}';`);
        }
        return;
    }

    // Tri par longueur des noms d'import (du plus court au plus long)
    const sortedNamedImports = sortImportNamesByLength(namedImports);

    // Import par défaut ET imports nommés
    if (isDefaultImport && namedImports.length > 0) {
        // Un seul import nommé -> une ligne
        if (sortedNamedImports.length === 1) {
            if (isTypeImport) {
                statements.push(
                    `import type ${importNames[0]}, { ${sortedNamedImports[0]} } from '${moduleName}';`
                );
            } else {
                statements.push(
                    `import ${importNames[0]}, { ${sortedNamedImports[0]} } from '${moduleName}';`
                );
            }
        }
        // Plusieurs imports nommés -> multiligne avec indentation de 4 espaces
        else {
            if (isTypeImport) {
                statements.push(`import type ${importNames[0]}, {
    ${sortedNamedImports.join(',\n    ')}
} from '${moduleName}';`);
            } else {
                statements.push(`import ${importNames[0]}, {
    ${sortedNamedImports.join(',\n    ')}
} from '${moduleName}';`);
            }
        }
    }
    // Uniquement des imports nommés
    else if (namedImports.length > 0) {
        // Un seul import nommé -> une ligne
        if (sortedNamedImports.length === 1) {
            if (isTypeImport) {
                statements.push(
                    `import type { ${sortedNamedImports[0]} } from '${moduleName}';`
                );
            } else {
                statements.push(
                    `import { ${sortedNamedImports[0]} } from '${moduleName}';`
                );
            }
        }
        // Plusieurs imports nommés -> multiligne avec indentation de 4 espaces
        else {
            if (isTypeImport) {
                statements.push(`import type {
    ${sortedNamedImports.join(',\n    ')}
} from '${moduleName}';`);
            } else {
                statements.push(`import {
    ${sortedNamedImports.join(',\n    ')}
} from '${moduleName}';`);
            }
        }
    }
}

function sortImportsInGroup(imports: FormattedImport[]): FormattedImport[] {
    return imports.sort((a, b) => {
        // Priorité spéciale pour React dans le groupe Misc
        if (a.group.name === 'Misc' && b.group.name === 'Misc') {
            if (a.moduleName === 'react' && b.moduleName !== 'react') {
                return -1;
            }
            if (a.moduleName !== 'react' && b.moduleName === 'react') {
                return 1;
            }
        }

        // 1. Regrouper par type d'import (default, named, type)
        // Imports par défaut (sans type) en premier
        if (!a.isTypeImport && a.isDefaultImport && (!b.isDefaultImport || b.isTypeImport)) {
            return -1;
        }
        if (!b.isTypeImport && b.isDefaultImport && (!a.isDefaultImport || a.isTypeImport)) {
            return 1;
        }

        // Imports nommés (sans type) ensuite
        if (!a.isTypeImport && !a.isDefaultImport && b.isTypeImport) {
            return -1;
        }
        if (!b.isTypeImport && !b.isDefaultImport && a.isTypeImport) {
            return 1;
        }

        // Tous les imports de type à la fin
        if (a.isTypeImport && !b.isTypeImport) {
            return 1;
        }
        if (!a.isTypeImport && b.isTypeImport) {
            return -1;
        }

        // Si même catégorie (default, named ou type), trier par longueur de nom
        const aLength = getEffectiveLengthForSorting(a);
        const bLength = getEffectiveLengthForSorting(b);

        return aLength - bLength;
    });
}

function groupImportsOptimized(
    imports: FormattedImport[]
): Map<string, FormattedImport[]> {
    const groupedImports = new Map<string, Map<string, FormattedImport>>();

    // Map spéciale pour suivre les imports de type par module
    const typeImportsByModule = new Map<string, Set<string>>();

    // Ne pas séparer les types dans un groupe à part
    for (const importItem of imports) {
        const groupName = importItem.group.name;

        if (!groupedImports.has(groupName)) {
            groupedImports.set(groupName, new Map<string, FormattedImport>());
        }

        const moduleMap = groupedImports.get(groupName)!;
        const { moduleName } = importItem;

        // Cas spécial pour les imports de type
        if (importItem.isTypeImport) {
            // Clé pour les imports de type
            const typeKey = `${moduleName}_TYPE_`;

            // Garder trace des noms de type pour ce module
            if (!typeImportsByModule.has(moduleName)) {
                typeImportsByModule.set(moduleName, new Set<string>());
            }

            // Ajouter les noms de type à l'ensemble
            const typeNames = typeImportsByModule.get(moduleName)!;
            importItem.importNames.forEach(name => typeNames.add(name));

            // Si un import de type pour ce module existe déjà, le mettre à jour
            if (moduleMap.has(typeKey)) {
                const existingTypeImport = moduleMap.get(typeKey)!;
                existingTypeImport.importNames = Array.from(typeNames);
            } else {
                // Sinon, créer un nouvel import de type
                moduleMap.set(typeKey, {
                    ...importItem,
                    importNames: Array.from(typeNames),
                    isTypeImport: true,
                    isDefaultImport: false,
                    hasNamedImports: true
                });
            }
            continue;
        }

        // Cas standard pour les imports non-type
        // CORRECTION: Utiliser une clé qui distingue les imports par défaut
        const mapKey = importItem.isDefaultImport ?
            `${moduleName}_DEFAULT_` :
            `${moduleName}_NAMED_`;

        if (moduleMap.has(mapKey)) {
            const existingImport = moduleMap.get(mapKey)!;

            // S'assurer que tous les noms sont bien conservés
            const mergedNames = new Set<string>([...existingImport.importNames]);
            for (const name of importItem.importNames) {
                mergedNames.add(name);
            }

            existingImport.importNames = Array.from(mergedNames);

            // CORRECTION: Ne pas modifier isDefaultImport et hasNamedImports automatiquement
            // mais recalculer hasNamedImports en fonction du nombre d'imports après la fusion

            // Si c'est un import par défaut, le premier élément est le nom de l'import par défaut
            const namedImportCount = existingImport.isDefaultImport ?
                existingImport.importNames.length - 1 :
                existingImport.importNames.length;

            // hasNamedImports est vrai s'il y a des imports nommés après avoir exclu l'import par défaut
            existingImport.hasNamedImports = namedImportCount > 0;

        } else {
            // CORRECTION: Vérifier que hasNamedImports est correct avant d'ajouter l'import
            if (importItem.isDefaultImport) {
                // Pour un import par défaut, hasNamedImports est vrai s'il y a plus d'un nom
                // (le premier étant l'import par défaut)
                const namedImportCount = importItem.importNames.length - 1;
                const correctedItem = {
                    ...importItem,
                    hasNamedImports: namedImportCount > 0
                };
                moduleMap.set(mapKey, correctedItem);
            } else {
                moduleMap.set(mapKey, { ...importItem });
            }
        }
    }

    const result = new Map<string, FormattedImport[]>();
    for (const [groupName, moduleMap] of groupedImports.entries()) {
        if (moduleMap.size > 0) {
            result.set(groupName, Array.from(moduleMap.values()));
        }
    }

    return result;
}

function generateFormattedImportsOptimized(
    groupedImports: Map<string, FormattedImport[]>
): string {
    // Ordre défini des groupes d'imports
    const configGroups = [...IMPORT_GROUPS]
        .sort((a, b) => a.order - b.order)
        .map((group) => group.name);

    const preferredOrderMap: Map<string, number> = new Map();
    configGroups.forEach((name, index) => {
        preferredOrderMap.set(name, index);
    });

    // Trier les groupes selon l'ordre défini
    const groups = Array.from(groupedImports.entries()).sort((a, b) => {
        const indexA = preferredOrderMap.has(a[0])
            ? preferredOrderMap.get(a[0])!
            : Infinity;
        const indexB = preferredOrderMap.has(b[0])
            ? preferredOrderMap.get(b[0])!
            : Infinity;

        // Si les deux groupes sont dans l'ordre préféré
        if (indexA !== Infinity && indexB !== Infinity) {
            return indexA - indexB;
        }

        // Si seulement un groupe est dans l'ordre préféré
        if (indexA !== Infinity) {
            return -1;
        }
        if (indexB !== Infinity) {
            return 1;
        }

        // Fallback sur l'ordre des groupes dans la configuration
        const groupA = IMPORT_GROUPS.find((g) => g.name === a[0]);
        const groupB = IMPORT_GROUPS.find((g) => g.name === b[0]);
        return (groupA?.order || 999) - (groupB?.order || 999);
    });

    const formattedGroups: Array<{
        groupName: string;
        commentLine: string;
        importLines: string[];
    }> = [];

    for (const [groupName, imports] of groups) {
        if (imports.length === 0) {
            continue;
        }

        // Utiliser directement le groupName normalisé pour le commentaire
        const commentLine = `// ${groupName}`;

        const groupResult = {
            groupName,
            commentLine: commentLine,
            importLines: [] as string[],
        };

        const sortedImports = sortImportsInGroup(imports);

        for (const importItem of sortedImports) {
            const formattedLines: string[] = [];
            formatImportItem(importItem, formattedLines);
            groupResult.importLines.push(...formattedLines);
        }

        formattedGroups.push(groupResult);
    }

    // Utiliser la fonction d'alignement par section
    const alignedLines = alignImportsBySection(formattedGroups);

    return alignedLines.join('\n');
}

/**
 * Trouve la plage de tous les imports dans le texte source.
 * Cette fonction utilise une approche plus stricte pour éviter de capturer du code non-import.
 * 
 * @param text Le texte source à analyser
 * @returns Un objet contenant les positions de début et de fin de la section d'imports
 */
function findAllImportsRange(text: string): { start: number; end: number } {
    // Créer un fichier source TypeScript pour l'analyse
    const sourceFile = ts.createSourceFile(
        'temp.ts',
        text,
        ts.ScriptTarget.Latest,
        true
    );

    // Collecter tous les nœuds d'import et leurs positions
    const importRanges: [number, number][] = [];
    const sectionComments: [number, number][] = [];
    
    // Regex pour trouver les commentaires de section d'imports
    const sectionCommentRegex = /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils|.*\b(?:misc|ds|dossier|core|library|utils)\b.*)\s*$/gim;
    
    // Trouver les commentaires de section
    let match;
    while ((match = sectionCommentRegex.exec(text)) !== null) {
        sectionComments.push([match.index, match.index + match[0].length]);
    }

    // Fonction pour visiter les nœuds AST et trouver les imports
    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            importRanges.push([node.getStart(sourceFile), node.getEnd()]);
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Si aucun import n'est trouvé, retourner une plage vide
    if (importRanges.length === 0) {
        return { start: 0, end: 0 };
    }

    // Trier les plages d'import par position de début
    importRanges.sort((a, b) => a[0] - b[0]);
    
    // Trouver la première et la dernière position d'import
    let firstStart = importRanges[0][0];
    let lastEnd = importRanges[importRanges.length - 1][1];
    
    // Inclure les commentaires de section qui sont proches des imports
    for (const [start, commentEnd] of sectionComments) {
        // Vérifier si le commentaire est avant le premier import mais proche
        if (start < firstStart && firstStart - commentEnd < 50) {
            firstStart = start;
        }
        
        // Vérifier si le commentaire est après le dernier import mais proche
        if (start > lastEnd && start - lastEnd < 50) {
            lastEnd = commentEnd;
        }
        
        // Vérifier si le commentaire est entre des imports
        for (let i = 0; i < importRanges.length - 1; i++) {
            const currentImportEnd = importRanges[i][1];
            const nextImportStart = importRanges[i + 1][0];
            
            if (start > currentImportEnd && start < nextImportStart) {
                // Le commentaire est entre deux imports, l'inclure dans la section
                // Pas besoin de mettre à jour firstStart ou lastEnd car il est déjà dans la plage
            }
        }
    }
    
    // Vérifier s'il y a des lignes vides ou des commentaires entre les imports
    // et les inclure dans la section d'imports
    const lines = text.split('\n');
    let currentPos = 0;
    let inImportSection = false;
    let lastImportEnd = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length + 1; // +1 pour le caractère de nouvelle ligne
        const lineStart = currentPos;
        const lineEnd = currentPos + lineLength;
        const trimmedLine = line.trim();
        
        // Vérifier si cette ligne est dans la plage d'un import
        const isInImportRange = importRanges.some(
            ([start, end]) => lineStart >= start && lineEnd <= end
        );
        
        // Vérifier si cette ligne est un commentaire de section
        const isInSectionComment = sectionComments.some(
            ([start, end]) => lineStart >= start && lineEnd <= end
        );
        
        const isCommentLine = trimmedLine.startsWith('//');
        const isEmptyLine = trimmedLine === '';
        
        // Si nous sommes dans une ligne d'import ou un commentaire de section,
        // nous sommes dans la section d'imports
        if (isInImportRange || isInSectionComment) {
            inImportSection = true;
            lastImportEnd = lineEnd;
        } 
        // Si nous sommes dans la section d'imports et que c'est une ligne vide ou un commentaire,
        // continuer à considérer que nous sommes dans la section d'imports
        else if (inImportSection && (isEmptyLine || isCommentLine)) {
            // Ne rien faire, continuer à considérer que nous sommes dans la section d'imports
        } 
        // Si nous trouvons une ligne qui n'est ni un import, ni un commentaire, ni une ligne vide,
        // et qu'il n'y a pas d'import après, alors nous sommes sortis de la section d'imports
        else if (inImportSection) {
            // Vérifier s'il y a un import après cette ligne
            let hasImportAfter = false;
            for (const [start] of importRanges) {
                if (start > lineEnd) {
                    hasImportAfter = true;
                    break;
                }
            }
            
            if (!hasImportAfter) {
                // Nous sommes sortis de la section d'imports
                inImportSection = false;
                break;
            }
        }
        
        currentPos += lineLength;
    }
    
    // Ajouter une ligne vide après la dernière ligne d'import si elle existe
    if (lastImportEnd > 0) {
        // Trouver la fin de la ligne
        const lineEndPos = text.indexOf('\n', lastImportEnd);
        if (lineEndPos !== -1) {
            lastEnd = lineEndPos + 1; // Inclure le caractère de nouvelle ligne
        }
    }
    
    return { start: firstStart, end: lastEnd };
}

/**
 * Cette fonction a été supprimée car elle n'est plus nécessaire avec la nouvelle
 * implémentation de findAllImportsRange qui utilise l'AST TypeScript.
 */

/**
 * Formate les imports dans le texte source.
 * Cette fonction utilise une approche plus sûre pour identifier et formater uniquement
 * la section d'imports, évitant ainsi de modifier accidentellement du code React.
 * 
 * @param sourceText Le texte source à formater
 * @returns Le texte source avec les imports formatés
 */
export function formatImports(sourceText: string): string {
    // Créer un fichier source TypeScript pour l'analyse
    const sourceFile = ts.createSourceFile(
        'temp.ts',
        sourceText,
        ts.ScriptTarget.Latest,
        true
    );

    // Collecter tous les nœuds d'import
    const importNodes: ts.ImportDeclaration[] = [];

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            importNodes.push(node);
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Si aucun import n'est trouvé, retourner le texte source sans modification
    if (importNodes.length === 0) {
        return sourceText;
    }

    // Trouver la plage complète des imports en utilisant la nouvelle fonction plus sûre
    const fullImportRange = findAllImportsRange(sourceText);

    // Si aucune plage d'import n'est trouvée, retourner le texte source sans modification
    if (fullImportRange.start === fullImportRange.end) {
        return sourceText;
    }

    // Nettoyer le texte d'import en supprimant les commentaires non-nécessaires
    const cleanedSourceText = removeCommentsFromImports(sourceText);

    // Créer un nouveau fichier source avec le texte nettoyé
    const cleanedSourceFile = ts.createSourceFile(
        'temp.ts',
        cleanedSourceText,
        ts.ScriptTarget.Latest,
        true
    );

    // Collecter tous les nœuds d'import du texte nettoyé
    const cleanedImportNodes: ts.ImportDeclaration[] = [];

    function visitCleaned(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            cleanedImportNodes.push(node);
        }
        ts.forEachChild(node, visitCleaned);
    }

    visitCleaned(cleanedSourceFile);

    // Analyser et formater les imports
    const formattedImports = parseImports(cleanedImportNodes, cleanedSourceFile, IMPORT_GROUPS);
    const groupedImports = groupImportsOptimized(formattedImports);
    const formattedText = generateFormattedImportsOptimized(groupedImports);

    // Remplacer la section d'imports originale par le texte formaté
    return (
        sourceText.substring(0, fullImportRange.start) +
        formattedText +
        sourceText.substring(fullImportRange.end)
    );
}
