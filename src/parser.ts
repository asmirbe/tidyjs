import * as ts from "typescript";
import { FormattedImport, ImportGroup } from "./types";

function getImportGroup(moduleName: string, importGroups: ImportGroup[]): string {
    // Chercher d'abord un match direct dans les groupes configurés
    const importGroup = importGroups.find((group) =>
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

export function parseImports(
    importNodes: ts.ImportDeclaration[],
    sourceFile: ts.SourceFile,
    importGroups: ImportGroup[]
): FormattedImport[] {
    const result: FormattedImport[] = [];

    for (const node of importNodes) {
        const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
        const moduleName = moduleSpecifier.text;

        // Utiliser uniquement getImportGroup pour déterminer le groupe
        const groupName = getImportGroup(moduleName, importGroups);

        // Trouver l'objet ImportGroup correspondant
        let importGroup = importGroups.find((g) => g.name === groupName);

        // Si le groupe n'est pas dans la liste par défaut, créer un groupe Misc
        if (!importGroup) {
            importGroup = { name: 'Misc', regex: /.*/, order: 0 };
        }

        let importNames: string[] = [];
        let typeImportNames: string[] = [];
        let isTypeImport = false;
        let isDefaultImport = false;
        let hasNamedImports = false;

        if (node.importClause) {
            if (node.importClause.name) {
                isDefaultImport = true;
                importNames.push(node.importClause.name.text);
            }

            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
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

                    // Définir hasNamedImports uniquement s'il y a des imports nommés
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

        // Vérifier s'il y a des imports normaux avant de créer l'import principal
        if (importNames.length > 0) {
            result.push({
                statement,
                group: importGroup,
                moduleName,
                importNames,
                isTypeImport,
                isDefaultImport,
                hasNamedImports
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