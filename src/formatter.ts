import * as ts from 'typescript';
import * as vscode from 'vscode';
import { logDebug } from './utils/utils';

export interface ImportGroup {
    name: string;
    regex: RegExp;
    order: number;
}

export interface ImportNode {
    text: string;
    defaultImport: string | null;
    namedImports: string[];
    typeImports: string[];
    source: string;
    isTypeOnly: boolean;
    originalText: string;
    range: vscode.Range;
    group: string;
}

export interface FormattedImport {
    statement: string;
    group: ImportGroup;
    moduleName: string;
    importNames: string[];
    isTypeImport: boolean;
    isDefaultImport: boolean;
    hasNamedImports: boolean;
}

let DEFAULT_IMPORT_GROUPS: ImportGroup[] = [
    { name: 'Misc', regex: /^(react|lodash|date-fns)$/, order: 0 },
    { name: 'DS', regex: /^ds$/, order: 1 },
    { name: '@app/dossier', regex: /^@app\/dossier/, order: 2 },
    { name: '@core', regex: /^@core/, order: 3 },
    { name: '@library', regex: /^@library/, order: 4 },
    { name: 'Utils', regex: /^yutils/, order: 5 },
];

// Ajout du paramètre de configuration pour l'espacement
let ALIGNMENT_SPACING = 1; // Valeur par défaut

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

// Modifier la fonction d'alignement pour utiliser ALIGNMENT_SPACING
function alignImportsBySection(formattedGroups: Array<{
    groupName: string;
    commentLine: string;
    importLines: string[];
}>): string[] {
    const resultLines: string[] = [];

    for (const group of formattedGroups) {
        // Ajouter le commentaire de groupe
        if (group.commentLine) {
            resultLines.push(group.commentLine);
        }

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

    return cleanedLines;
}

export function getImportGroup(moduleName: string): string {
    // Chercher d'abord un match direct dans les groupes configurés
    const importGroup = DEFAULT_IMPORT_GROUPS.find((group) =>
        group.regex.test(moduleName)
    );

    if (importGroup) {
        return importGroup.name;
    }

    // Règles de fallback
    if (moduleName.startsWith('@library')) {
        return '@library';
    } else if (moduleName.startsWith('@app/dossier')) {
        return '@app/dossier';
    } else if (moduleName.startsWith('@core')) {
        return '@core';
    } else if (moduleName.startsWith('yutils')) {
        return 'Utils';
    } else if (moduleName === 'ds') {
        return 'DS';
    } else if (['react', 'lodash', 'date-fns'].includes(moduleName)) {
        return 'Misc';
    }

    // Par défaut, mettre dans Misc
    return 'Misc';
}

function removeCommentsFromImports(text: string): string {
    const commentRegex = /^\s*\/\/.*$\n?/gm;
    return text.replace(commentRegex, '');
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

function sortImportNamesByLength(names: string[]): string[] {
    return [...names].sort((a, b) => a.length - b.length);
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

function parseImports(
    importNodes: ts.ImportDeclaration[],
    sourceFile: ts.SourceFile
): FormattedImport[] {
    const result: FormattedImport[] = [];

    for (const node of importNodes) {
        const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
        const moduleName = moduleSpecifier.text;

        // Utiliser uniquement getImportGroup pour déterminer le groupe
        const groupName = getImportGroup(moduleName);

        // Trouver l'objet ImportGroup correspondant
        let importGroup = DEFAULT_IMPORT_GROUPS.find(g => g.name === groupName);

        // Si le groupe n'est pas dans la liste par défaut, créer un groupe Misc
        if (!importGroup) {
            importGroup = { name: 'Misc', regex: /.*/, order: 0 };
        }

        let importNames: string[] = [];
        let typeImportNames: string[] = [];
        let isTypeImport = false;
        let isDefaultImport = false;

        // CORRECTION: Ne pas définir hasNamedImports à l'avance,
        // on le calculera après avoir filtré les imports de type
        let hasNamedImports = false;

        if (node.importClause) {
            if (node.importClause.name) {
                isDefaultImport = true;
                importNames.push(node.importClause.name.text);
            }

            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    // CORRECTION: On ne définit pas hasNamedImports ici
                    // mais on attend d'avoir séparé les imports normaux des imports de type

                    // Analyser les imports nommés pour identifier les types inline
                    for (const element of node.importClause.namedBindings.elements) {
                        const sourceText = sourceFile.text.substring(
                            element.getStart(sourceFile),
                            element.getEnd()
                        );

                        // Détecter les imports de type inline (comme "type FC")
                        const isInlineType = sourceText.startsWith('type ');

                        if (isInlineType) {
                            // Extraire le nom du type sans le mot-clé "type"
                            const typeName = element.name.text;
                            typeImportNames.push(typeName);
                        } else {
                            // Import normal
                            if (element.propertyName) {
                                importNames.push(`${element.propertyName.text} as ${element.name.text}`);
                            } else {
                                importNames.push(element.name.text);
                            }
                        }
                    }

                    // CORRECTION: Maintenant, définir hasNamedImports uniquement s'il y a des imports nommés
                    // après avoir filtré les imports de type
                    hasNamedImports = importNames.length > (isDefaultImport ? 1 : 0);

                } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    importNames.push(`* as ${node.importClause.namedBindings.name.text}`);
                    hasNamedImports = true;
                }
            }

            isTypeImport = !!node.importClause.isTypeOnly;
        }

        const statement = sourceFile.text.substring(
            node.getStart(sourceFile),
            node.getEnd()
        );

        // CORRECTION: Vérifier s'il y a des imports normaux avant de créer l'import principal
        if (importNames.length > 0) {
            result.push({
                statement,
                group: importGroup,
                moduleName,
                importNames,
                isTypeImport,
                isDefaultImport,
                // CORRECTION: hasNamedImports est correct maintenant, car calculé après filtrage
                hasNamedImports: hasNamedImports
            });
        }

        // Créer un import de type séparé pour les types inline
        if (typeImportNames.length > 0) {
            result.push({
                statement: `import type { ${typeImportNames.join(', ')} } from '${moduleName}';`,
                group: importGroup,
                moduleName,
                importNames: typeImportNames,
                isTypeImport: true,
                isDefaultImport: false,
                hasNamedImports: true,
            });
        }
    }

    return result;
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
    const configGroups = [...DEFAULT_IMPORT_GROUPS]
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
        const groupA = DEFAULT_IMPORT_GROUPS.find((g) => g.name === a[0]);
        const groupB = DEFAULT_IMPORT_GROUPS.find((g) => g.name === b[0]);
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

    // Utiliser la nouvelle fonction d'alignement par section
    const alignedLines = alignImportsBySection(formattedGroups);

    return alignedLines.join('\n');
}

function findAllImportsRange(text: string): { start: number; end: number } {
    // Regex pour trouver les lignes d'import
    const importRegex = /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm;

    // Regex pour trouver les lignes qui semblent être des fragments d'import
    const possibleImportFragmentRegex = /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/;

    let firstStart = text.length;
    let lastEnd = 0;
    let match;

    // Trouver tous les imports
    while ((match = importRegex.exec(text)) !== null) {
        firstStart = Math.min(firstStart, match.index);
        lastEnd = Math.max(lastEnd, match.index + match[0].length);
    }

    // Si aucun import n'est trouvé, retourner une plage vide
    if (firstStart === text.length) {
        return { start: 0, end: 0 };
    }

    const lines = text.split('\n');
    let inImportSection = false;
    let currentPos = 0;
    let sectionStart = firstStart;
    let sectionEnd = lastEnd;

    // Rechercher les fragments d'imports orphelins et les commentaires de section
    const orphanedFragments: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length + 1;
        const trimmedLine = line.trim();

        const isImportLine = trimmedLine.startsWith('import');
        const isCommentLine = trimmedLine.startsWith('//');
        const isEmptyLine = trimmedLine === '';
        const isImportFragmentLine = possibleImportFragmentRegex.test(trimmedLine);

        // Vérifier si cette ligne ressemble à un fragment d'import orphelin
        const isOrphanedFragment =
            !isImportLine &&
            !isCommentLine &&
            !isEmptyLine &&
            (isImportFragmentLine ||
                trimmedLine.includes('from') ||
                (trimmedLine.startsWith('{') && trimmedLine.includes('}')) ||
                trimmedLine.match(/^[A-Za-z0-9_]+,$/) !== null);

        if (isOrphanedFragment) {
            orphanedFragments.push(currentPos);
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        }

        if (isImportLine) {
            inImportSection = true;
            sectionStart = Math.min(sectionStart, currentPos);
        } else if (
            inImportSection &&
            (isCommentLine || isEmptyLine || isImportFragmentLine)
        ) {
            sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
        } else if (
            inImportSection &&
            !isCommentLine &&
            !isEmptyLine &&
            !isImportFragmentLine &&
            !isOrphanedFragment
        ) {
            const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
            const nextLineIsImport = nextLine.startsWith('import');
            const nextLineIsComment = nextLine.startsWith('//');

            if (nextLineIsImport || nextLineIsComment) {
                sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
            } else {
                // Vérifier si les prochaines lignes contiennent des fragments d'import
                let fragmentFound = false;
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    if (possibleImportFragmentRegex.test(lines[j].trim())) {
                        fragmentFound = true;
                        break;
                    }
                }

                if (fragmentFound) {
                    sectionEnd = Math.max(sectionEnd, currentPos + lineLength);
                } else {
                    inImportSection = false;
                }
            }
        }

        currentPos += lineLength;
    }

    // Rechercher les fragments de commentaires qui pourraient faire partie de la section d'imports
    const commentFragments = findCommentFragments(text);
    for (const fragment of commentFragments) {
        const isNearImportSection =
            Math.abs(fragment.start - sectionEnd) < 200 ||
            Math.abs(fragment.end - sectionStart) < 200;

        if (isNearImportSection) {
            sectionStart = Math.min(sectionStart, fragment.start);
            sectionEnd = Math.max(sectionEnd, fragment.end);
        }
    }

    // Inclure les fragments orphelins qui pourraient être après la section d'imports
    for (const fragmentPos of orphanedFragments) {
        if (Math.abs(fragmentPos - sectionEnd) < 200) {
            const lines = text.substring(fragmentPos, fragmentPos + 200).split('\n');
            let fragmentEnd = fragmentPos;
            let linePos = fragmentPos;

            for (const line of lines) {
                linePos += line.length + 1;
                if (possibleImportFragmentRegex.test(line.trim()) || line.trim().includes('from')) {
                    fragmentEnd = linePos;
                } else if (line.trim() !== '' && !line.trim().startsWith('//')) {
                    break;
                }
            }

            sectionEnd = Math.max(sectionEnd, fragmentEnd);
        }
    }

    return { start: sectionStart, end: sectionEnd };
}

function findCommentFragments(
    text: string
): Array<{ start: number; end: number }> {
    const fragments: Array<{ start: number; end: number }> = [];
    const lines = text.split('\n');

    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.length + 1;

        const isPossibleCommentFragment =
            /^\s*[a-z]{1,5}\s*$/.test(line) ||
            /^\s*\/?\s*[A-Z][a-z]+\s*$/.test(line) ||
            (line.trim().length < 5 && /^\s*\/+\s*$/.test(line));

        if (isPossibleCommentFragment) {
            const prevLine = i > 0 ? lines[i - 1] : '';
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

            const isNearImport =
                prevLine.includes('import') ||
                nextLine.includes('import') ||
                prevLine.includes('from') ||
                nextLine.includes('from');

            if (isNearImport) {
                fragments.push({
                    start: currentPos,
                    end: currentPos + lineLength,
                });
            }
        }

        currentPos += lineLength;
    }

    return fragments;
}

export function formatImportsWithTsParser(sourceText: string): string {
    // Trouver d'abord la plage complète des imports, y compris les fragments orphelins
    const fullImportRange = findAllImportsRange(sourceText);

    // Si aucun import n'est trouvé, retourner le texte source sans modification
    if (fullImportRange.start === fullImportRange.end) {
        return sourceText;
    }

    // Extraire tout le texte de la section d'imports
    const importSectionText = sourceText.substring(
        fullImportRange.start,
        fullImportRange.end
    );

    // Capturer également les fragments orphelins qui pourraient ne pas être détectés comme imports
    const orphanedFragmentsRegex = /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm;
    const orphanedMatches = [...importSectionText.matchAll(orphanedFragmentsRegex)];

    // Nettoyer le texte d'import en supprimant les commentaires non-nécessaires
    const cleanedSourceText = removeCommentsFromImports(sourceText);

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
    const formattedImports = parseImports(importNodes, sourceFile);
    const groupedImports = groupImportsOptimized(formattedImports);
    const formattedText = generateFormattedImportsOptimized(groupedImports);

    // Remplacer la section d'imports originale par le texte formaté
    return (
        sourceText.substring(0, fullImportRange.start) +
        formattedText +
        sourceText.substring(fullImportRange.end)
    );
}

export function formatImports(sourceText: string): string {
    return formatImportsWithTsParser(sourceText);
}