import * as ts from 'typescript';
import { logDebug } from './utils/log';
import { parseImports } from './parser';
import { DEFAULT_IMPORT_GROUPS as IMPORTED_IMPORT_GROUPS } from './utils/config';
import { alignFromKeyword, formatSimpleImport, getFromIndex, isCommentLine, isEmptyLine, isSectionComment, sortImportNamesByLength } from './utils/misc';
import type { FormattedImport, FormatterConfig, FormattedImportGroup, ImportNameWithComment } from './types';

// Configuration par défaut exportée pour permettre les surcharges
export const DEFAULT_FORMATTER_CONFIG: FormatterConfig = {
    importGroups: [...IMPORTED_IMPORT_GROUPS],
    alignmentSpacing: 1,
    regexPatterns: (() => {
        const patterns = {
            importLine: /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm,
            sectionComment: /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils|.*\b(?:misc|ds|dossier|core|library|utils)\b.*)\s*$/gim,
            importFragment: /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/,
            sectionCommentPattern: /^\s*\/\/\s*(?:Misc|DS|@app\/.*|@core|@library|Utils)/,
            anyComment: /^\s*\/\//,
            typeDeclaration: /^type\s+[A-Za-z0-9_]+(\<.*\>)?\s*=/,
            codeDeclaration: /^(interface|class|enum|function|const|let|var|export)\s+[A-Za-z0-9_]+/,
            orphanedFragments: /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm,
            possibleCommentFragment: /^\s*[a-z]{1,5}\s*$|^\s*\/?\s*[A-Z][a-z]+\s*$|(^\s*\/+\s*$)/
        };
        
        // Pré-compiler les expressions régulières pour éviter de les recompiler à chaque utilisation
        const compiledRegex: Record<string, RegExp> = {};
        
        for (const [key, pattern] of Object.entries(patterns)) {
            compiledRegex[key] = new RegExp(pattern.source, pattern.flags);
        }
        
        return compiledRegex as FormatterConfig['regexPatterns'];
    })()
};

// Cache pour la memoization des calculs de longueur
const lengthMemoCache = new Map<string, number>();

function cleanUpLines(lines: string[]): string[] {
    const cleanedLines: string[] = [];
    let previousLine = '';
    let consecutiveEmptyLines = 0;

    for (const currentLine of lines) {
        // Ne pas ajouter de commentaires identiques à la suite
        if (isCommentLine(currentLine) && previousLine === currentLine) {
            continue;
        }

        // Gérer les lignes vides
        if (isEmptyLine(currentLine)) {
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
    if (cleanedLines.length > 0 && isEmptyLine(cleanedLines[cleanedLines.length - 1])) {
        cleanedLines.pop();
    }

    // Ajouter une ligne vide finale pour séparer les imports du reste du code
    cleanedLines.push('');

    return cleanedLines;
}

function alignImportsInGroup(
    importLines: string[], 
    config: FormatterConfig
): string[] {
    // Optimisation: Calculer les indices "from" en une seule passe
    const fromIndices = new Map<string, number>();
    let maxWidth = 0;
    
    for (const line of importLines) {
        const isMultiline = line.includes('\n');
        const fromIndex = getFromIndex(line, isMultiline);
        
        if (fromIndex > 0) {
            fromIndices.set(line, fromIndex);
            maxWidth = Math.max(maxWidth, fromIndex);
        }
    }

    // Aligner tous les "from" du groupe en ajoutant l'espacement configuré
    return importLines.map((line) => {
        const fromIndex = fromIndices.get(line);
        if (fromIndex !== undefined) {
            return alignFromKeyword(line, fromIndex, maxWidth, config.alignmentSpacing);
        }
        return line;
    });
}

function alignImportsBySection(
    formattedGroups: FormattedImportGroup[],
    config: FormatterConfig = DEFAULT_FORMATTER_CONFIG
): string[] {
    const resultLines: string[] = [];
    const seenGroups = new Set<string>();

    for (const group of formattedGroups) {
        const { groupName, importLines } = group;
        
        // Si ce groupe a déjà été traité, ignorer son commentaire
        if (seenGroups.has(groupName)) {
            logDebug(`Groupe dupliqué ignoré: ${groupName}`);
            continue;
        }
        
        seenGroups.add(groupName);
        
        // Ajouter le commentaire de groupe normalisé
        resultLines.push(`// ${groupName}`);

        // Aligner les imports au sein du groupe
        const alignedImports = alignImportsInGroup(importLines, config);

        // Ajouter les imports alignés
        resultLines.push(...alignedImports);

        // Ajouter une ligne vide après chaque groupe
        resultLines.push('');
    }

    // Nettoyage des lignes vides et commentaires dupliqués
    return cleanUpLines(resultLines);
}

// Mise à jour de removeCommentsFromImports pour ne pas supprimer les commentaires internes
function removeCommentsFromImports(text: string, config: FormatterConfig): string {
    // Ne supprime que les commentaires sur des lignes isolées, pas ceux dans les imports
    return text.split('\n').map(line => {
        // Ne pas supprimer les commentaires de section
        if (isSectionComment(line, config)) {
            return line;
        }
        
        // Ne supprimer les commentaires que s'ils sont sur une ligne isolée (pas à droite d'un import)
        if (config.regexPatterns.anyComment.test(line) && 
            !line.includes('import') && 
            !line.trim().match(/[a-zA-Z0-9_]+\s*\/\//)) {
            return '';
        }
        return line;
    }).join('\n');
}

// Fonction de memoization pour le calcul des longueurs
function getMemoizedLength(importItem: FormattedImport): number {
    // Créer une clé unique basée sur les propriétés de l'import
    const cacheKey = `${importItem.moduleName}_${importItem.isDefaultImport}_${importItem.hasNamedImports}_${importItem.importNames.join(',')}`;
    
    if (lengthMemoCache.has(cacheKey)) {
        return lengthMemoCache.get(cacheKey)!;
    }
    
    const length = calculateEffectiveLengthForSorting(importItem);
    lengthMemoCache.set(cacheKey, length);
    return length;
}

// Fonction réelle de calcul de longueur
function calculateEffectiveLengthForSorting(importItem: FormattedImport): number {
    // Import par défaut sans imports nommés
    if (importItem.isDefaultImport && !importItem.hasNamedImports) {
        return importItem.importNames[0].length;
    }
    
    // Imports nommés sans import par défaut
    if (!importItem.isDefaultImport && importItem.hasNamedImports) {
        const namedImports = importItem.importNames;
        if (namedImports.length > 0) {
            // Optimisation: Éviter de mapper puis de prendre le min
            let minLength = Number.MAX_SAFE_INTEGER;
            for (const name of namedImports) {
                minLength = Math.min(minLength, name.length);
            }
            return minLength === Number.MAX_SAFE_INTEGER ? 0 : minLength;
        }
    }
    
    // Import par défaut avec imports nommés
    if (importItem.isDefaultImport && importItem.hasNamedImports) {
        const namedImports = importItem.importNames.slice(1);
        if (namedImports.length > 0) {
            // Optimisation: Éviter de mapper puis de prendre le min
            let minLength = Number.MAX_SAFE_INTEGER;
            for (const name of namedImports) {
                minLength = Math.min(minLength, name.length);
            }
            return minLength === Number.MAX_SAFE_INTEGER ? importItem.importNames[0].length : minLength;
        }
        return importItem.importNames[0].length;
    }
    
    // Cas par défaut
    return 999;
}

// Remplacer getEffectiveLengthForSorting par la version memoizée
const getEffectiveLengthForSorting = getMemoizedLength;

function formatDefaultImport(defaultName: string, moduleName: string, isTypeImport: boolean): string {
    return isTypeImport 
        ? `import type ${defaultName} from '${moduleName}';`
        : `import ${defaultName} from '${moduleName}';`;
}

// Modifier la fonction formatNamedImports pour gérer les commentaires
function formatNamedImports(
    namedImports: (string | ImportNameWithComment)[], 
    moduleName: string, 
    isTypeImport: boolean
): string {
    const typePrefix = isTypeImport ? 'type ' : '';
    
    // Formatter les imports en préservant les commentaires
    const formattedItems = namedImports.map(item => {
        if (typeof item === 'string') {
            return item;
        }
        return item.comment ? `${item.name} ${item.comment}` : item.name;
    });
    
    if (formattedItems.length === 1) {
        return `import ${typePrefix}{ ${formattedItems[0]} } from '${moduleName}';`;
    } else {
        return `import ${typePrefix}{
    ${formattedItems.join(',\n    ')}
} from '${moduleName}';`;
    }
}

// Modifier formatDefaultAndNamedImports de la même façon
function formatDefaultAndNamedImports(
    defaultName: string, 
    namedImports: (string | ImportNameWithComment)[], 
    moduleName: string, 
    isTypeImport: boolean
): string {
    const typePrefix = isTypeImport ? 'type ' : '';
    
    // Formatter les imports nommés en préservant les commentaires
    const formattedItems = namedImports.map(item => {
        if (typeof item === 'string') {
            return item;
        }
        return item.comment ? `${item.name} ${item.comment}` : item.name;
    });
    
    if (formattedItems.length === 1) {
        return `import ${typePrefix}${defaultName}, { ${formattedItems[0]} } from '${moduleName}';`;
    } else {
        return `import ${typePrefix}${defaultName}, {
    ${formattedItems.join(',\n    ')}
} from '${moduleName}';`;
    }
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
        statements.push(formatSimpleImport(moduleName));
        return;
    }

    // Filtrer et trier les imports nommés
    const namedImports = hasNamedImports
        ? importNames.filter((_, index) => (isDefaultImport ? index > 0 : true))
        : [];

    // Import par défaut uniquement
    if (isDefaultImport && namedImports.length === 0) {
        statements.push(formatDefaultImport(importNames[0], moduleName, isTypeImport));
        return;
    }

    // Tri par longueur des noms d'import (du plus court au plus long)
    const sortedNamedImports = sortImportNamesByLength(namedImports);

    // Import par défaut ET imports nommés
    if (isDefaultImport && namedImports.length > 0) {
        statements.push(formatDefaultAndNamedImports(
            importNames[0], 
            sortedNamedImports, 
            moduleName, 
            isTypeImport
        ));
    }
    // Uniquement des imports nommés
    else if (namedImports.length > 0) {
        statements.push(formatNamedImports(sortedNamedImports, moduleName, isTypeImport));
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
    groupedImports: Map<string, FormattedImport[]>,
    config: FormatterConfig = DEFAULT_FORMATTER_CONFIG
): string {
    // Ordre défini des groupes d'imports
    const configGroups = [...config.importGroups]
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
        const groupA = config.importGroups.find((g) => g.name === a[0]);
        const groupB = config.importGroups.find((g) => g.name === b[0]);
        return (groupA?.order || 999) - (groupB?.order || 999);
    });

    const formattedGroups: FormattedImportGroup[] = [];

    for (const [groupName, imports] of groups) {
        if (imports.length === 0) {
            continue;
        }

        const groupResult: FormattedImportGroup = {
            groupName,
            commentLine: `// ${groupName}`,
            importLines: [],
        };

        const sortedImports = sortImportsInGroup(imports);

        for (const importItem of sortedImports) {
            const formattedLines: string[] = [];
            formatImportItem(importItem, formattedLines);
            groupResult.importLines.push(...formattedLines);
        }

        formattedGroups.push(groupResult);
    }

    // Utiliser la fonction d'alignement par section avec la configuration
    const alignedLines = alignImportsBySection(formattedGroups, config);

    return alignedLines.join('\n');
}

function hasImportCharacteristics(line: string, config: FormatterConfig): boolean {
    const trimmedLine = line.trim();
    
    // Vérifier explicitement que ce n'est pas une déclaration de type
    if (trimmedLine.match(/^type\s+[A-Za-z0-9_]+(\<.*\>)?\s*=/)) {
        return false;
    }
    
    // Vérifier explicitement que ce n'est pas une déclaration d'interface ou de classe
    if (trimmedLine.match(/^(interface|class|enum)\s+[A-Za-z0-9_]+/)) {
        return false;
    }
    
    return trimmedLine.startsWith('import') || 
           config.regexPatterns.importFragment.test(trimmedLine) || 
           trimmedLine.includes('from') ||
           (trimmedLine.startsWith('{') && trimmedLine.includes('}')) ||
           trimmedLine.match(/^[A-Za-z0-9_]+,$/) !== null;
}

function findAllImportsRange(text: string, config: FormatterConfig = DEFAULT_FORMATTER_CONFIG): { start: number; end: number } {
    // Regex pour trouver les lignes d'import
    const importRegex = config.regexPatterns.importLine;
    
    // Regex pour trouver les commentaires de section d'imports
    const sectionCommentRegex = config.regexPatterns.sectionComment;

    // Regex pour trouver les lignes qui semblent être des fragments d'import
    const possibleImportFragmentRegex = config.regexPatterns.importFragment;

    let firstStart = text.length;
    let lastEnd = 0;
    let match;

    // Trouver tous les imports et commentaires de section
    while ((match = importRegex.exec(text)) !== null) {
        firstStart = Math.min(firstStart, match.index);
        lastEnd = Math.max(lastEnd, match.index + match[0].length);
    }
    
    // Chercher également les commentaires de section
    while ((match = sectionCommentRegex.exec(text)) !== null) {
        firstStart = Math.min(firstStart, match.index);
        lastEnd = Math.max(lastEnd, match.index + match[0].length);
    }

    // Si aucun import n'est trouvé, retourner une plage vide
    if (firstStart === text.length) {
        return { start: 0, end: 0 };
    }

    const lines = text.split('\n');
    let inImportSection = false;
    let importSectionFound = false; // Indicateur qu'au moins un import a été trouvé
    let currentPos = 0;
    let sectionStart = firstStart;
    let sectionEnd = lastEnd;
    let consecutiveNonImportLines = 0; // Compteur de lignes non-import consécutives
    const MAX_NON_IMPORT_LINES = 2; // Nombre maximum de lignes non-import consécutives autorisées

    // Rechercher les fragments d'imports orphelins et les commentaires de section
    const orphanedFragments: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length + 1;
        const trimmedLine = line.trim();

        // Détection améliorée des non-imports
        const isTypeDeclaration = trimmedLine.match(/^type\s+[A-Za-z0-9_]+(\<.*\>)?\s*=/) !== null;
        const isInterfaceOrClassDeclaration = trimmedLine.match(/^(interface|class|enum|function|const|let|var)\s+[A-Za-z0-9_]+/) !== null;

        const isImportLine = trimmedLine.startsWith('import');
        const isCommentLine = trimmedLine.startsWith('//');
        const isEmptyLine = trimmedLine === '';
        const isImportFragmentLine = possibleImportFragmentRegex.test(trimmedLine);
        const isJSDocComment = trimmedLine.startsWith('/*') || trimmedLine.startsWith('*') || trimmedLine.startsWith('*/');

        // Si on détecte clairement une déclaration de type, d'interface ou de classe, on s'arrête
        // car on est probablement sorti de la section d'imports
        if (isTypeDeclaration || isInterfaceOrClassDeclaration) {
            if (importSectionFound) {
                inImportSection = false;
                break;
            }
        }

        // Utilisation de la fonction hasImportCharacteristics pour la détection des fragments
        const isOrphanedFragment =
            !isImportLine &&
            !isCommentLine &&
            !isEmptyLine &&
            !isJSDocComment &&
            !isTypeDeclaration &&
            !isInterfaceOrClassDeclaration &&
            hasImportCharacteristics(line, config);

        if (isOrphanedFragment) {
            orphanedFragments.push(currentPos);
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        }

        // Si c'est un commentaire de section ou une ligne d'import, inclure dans la section
        if (isImportLine) {
            importSectionFound = true;
            inImportSection = true;
            consecutiveNonImportLines = 0;
            sectionStart = Math.min(sectionStart, currentPos);
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        } else if (isCommentLine && /(?:misc|ds|dossier|core|library|utils)/i.test(trimmedLine)) {
            inImportSection = true;
            consecutiveNonImportLines = 0;
            sectionStart = Math.min(sectionStart, currentPos);
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        } else if (
            inImportSection &&
            (isCommentLine || isEmptyLine || isImportFragmentLine || isJSDocComment)
        ) {
            // Les lignes de commentaires et lignes vides dans la section d'imports sont autorisées
            if (isEmptyLine) {
                consecutiveNonImportLines++;
            } else {
                consecutiveNonImportLines = 0;
            }
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        } else if (inImportSection && isOrphanedFragment) {
            consecutiveNonImportLines = 0;
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        } else if (inImportSection) {
            // Si nous sommes dans la section d'imports mais qu'on rencontre une ligne non-import
            // On vérifie les prochaines lignes pour voir s'il y a d'autres imports
            let nextImportFound = false;
            
            // Ne vérifier les prochaines lignes que si on n'a pas déjà trop de lignes non-import consécutives
            if (consecutiveNonImportLines < MAX_NON_IMPORT_LINES) {
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.startsWith('import') || 
                        possibleImportFragmentRegex.test(nextLine) ||
                        (nextLine.startsWith('//') && /(?:misc|ds|dossier|core|library|utils)/i.test(nextLine))) {
                        nextImportFound = true;
                        break;
                    }
                }
            }

            if (nextImportFound) {
                // Si on trouve un autre import plus loin, on considère cette ligne comme faisant partie de la section
                consecutiveNonImportLines++;
                sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
            } else if (importSectionFound) {
                // Si on a déjà trouvé au moins un import et qu'on a rencontré une ligne non-import
                // sans autre import à proximité, on considère que c'est la fin de la section
                inImportSection = false;
                break;
            }
        }

        // Si on accumule trop de lignes non-import consécutives, sortir de la section
        if (inImportSection && consecutiveNonImportLines > MAX_NON_IMPORT_LINES && importSectionFound) {
            inImportSection = false;
            break;
        }

        currentPos += lineLength;
    }

    // Ne pas inclure des sections de commentaires ou de fragments orphelins trop éloignées
    const MAX_DISTANCE = 100; // Distance maximale considérée comme "proche" de la section d'imports

    // Élagage des fragments orphelins qui sont trop éloignés de la section principale
    for (const fragmentPos of orphanedFragments) {
        if (Math.abs(fragmentPos - sectionEnd) <= MAX_DISTANCE) {
            // Vérifier que ce fragment est bien un fragment d'import et pas du code normal
            const fragmentText = text.substring(fragmentPos, Math.min(fragmentPos + 50, text.length));
            const lines = fragmentText.split('\n');
            let isValidImportFragment = false;

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (hasImportCharacteristics(line, config)) {
                    isValidImportFragment = true;
                    break;
                } else if (line.trim() !== '' && !line.trim().startsWith('//')) {
                    isValidImportFragment = false;
                    break;
                }
            }

            if (isValidImportFragment) {
                let fragmentEnd = fragmentPos;
                const fragmentLines = text.substring(fragmentPos, fragmentPos + 200).split('\n');
                let linePos = fragmentPos;

                for (const line of fragmentLines) {
                    if (!line || line.trim() === '') {
                        linePos += line.length + 1;
                        continue;
                    }
                    
                    if (hasImportCharacteristics(line, config) || line.trim().startsWith('//')) {
                        fragmentEnd = linePos + line.length + 1;
                    } else {
                        break;
                    }
                    
                    linePos += line.length + 1;
                }

                sectionEnd = Math.max(sectionEnd, fragmentEnd);
            }
        }
    }

    return { start: sectionStart, end: sectionEnd };
}

export function formatImports(
    sourceText: string, 
    config: FormatterConfig = DEFAULT_FORMATTER_CONFIG
): string {
    // Trouver d'abord la plage complète des imports, y compris les fragments orphelins
    const fullImportRange = findAllImportsRange(sourceText, config);

    // Si aucun import n'est trouvé, retourner le texte source sans modification
    if (fullImportRange.start === fullImportRange.end) {
        return sourceText;
    }

    // Effectuer une vérification supplémentaire pour éviter d'inclure des déclarations de type
    const importSection = sourceText.substring(fullImportRange.start, fullImportRange.end);
    const lines = importSection.split('\n');
    let adjustedEnd = fullImportRange.end;

    // Parcourir la section d'imports à partir de la fin
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        
        // Si on trouve une déclaration de type, interface, etc., ajuster la fin
        if (line.match(/^type\s+[A-Za-z0-9_]+(\<.*\>)?\s*=/) ||
            line.match(/^(interface|class|enum|function|const|let|var)\s+[A-Za-z0-9_]+/)) {
            
            // Calculer la position de cette ligne
            const lineStart = fullImportRange.start + 
                lines.slice(0, i).join('\n').length + 
                (i > 0 ? i : 0); // Ajouter le nombre de caractères '\n'
                
            adjustedEnd = lineStart;
            break;
        }
    }

    // Extraire tout le texte de la section d'imports avec la fin ajustée
    const importSectionText = sourceText.substring(
        fullImportRange.start,
        adjustedEnd
    );

    // Capturer également les fragments orphelins qui pourraient ne pas être détectés comme imports
    const orphanedMatches = [...importSectionText.matchAll(config.regexPatterns.orphanedFragments)];

    // Nettoyer le texte d'import en supprimant les commentaires non-nécessaires
    const cleanedSourceText = removeCommentsFromImports(sourceText, config);

    // Créer un fichier source TypeScript pour l'analyse
    const sourceFile = ts.createSourceFile(
        'temp.ts',
        cleanedSourceText,
        ts.ScriptTarget.Latest,
        true
    );

    // Collecter tous les nœuds d'import
    const importNodes: ts.ImportDeclaration[] = [];
    const importRanges: [number, number][] = [];

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            importNodes.push(node);
            importRanges.push([node.getStart(sourceFile), node.getEnd()]);
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Si aucun import valide n'est trouvé, vérifier s'il y a des fragments orphelins
    if (importNodes.length === 0 && orphanedMatches.length === 0) {
        return sourceText;
    }

    // Analyser et formater les imports
    const formattedImports = parseImports(importNodes, sourceFile, config.importGroups);
    const groupedImports = groupImportsOptimized(formattedImports);
    let formattedText = generateFormattedImportsOptimized(groupedImports, config);
    
    // S'assurer qu'il y a bien une ligne vide à la fin des imports
    if (!formattedText.endsWith('\n\n')) {
        if (formattedText.endsWith('\n')) {
            formattedText += '\n';
        } else {
            formattedText += '\n\n';
        }
    }

    // Remplacer la section d'imports originale par le texte formaté
    return (
        sourceText.substring(0, fullImportRange.start) +
        formattedText +
        sourceText.substring(adjustedEnd)
    );
}
