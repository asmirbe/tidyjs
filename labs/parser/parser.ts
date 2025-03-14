import { validateAndFixImportWithBabel } from './fixer';
import { ImportParserError } from './errors';
import { 
  ParserConfig, 
  ParsedImport, 
  ImportGroup, 
  TypeOrder, 
  SourcePatterns, 
  InvalidImport,
  DEFAULT_CONFIG
} from './types';

/**
 * Classe principale pour le parser d'imports
 */
class ImportParser {
  private readonly config: ParserConfig;
  private readonly defaultGroupName: string;
  private readonly typeOrder: TypeOrder;
  private readonly TypeOrder: TypeOrder;
  private readonly patterns: SourcePatterns;
  private readonly priorityImportPatterns: RegExp[];

  private appSubfolders: Set<string>;

  constructor(config: ParserConfig) {
    // Fusionner la configuration fournie avec les valeurs par défaut
    this.config = {
      ...config,
      typeOrder: { ...(DEFAULT_CONFIG.typeOrder as TypeOrder), ...(config.typeOrder || {}) } as TypeOrder,
      TypeOrder: { ...(DEFAULT_CONFIG.TypeOrder as TypeOrder), ...(config.TypeOrder || {}) } as TypeOrder,
      patterns: { ...DEFAULT_CONFIG.patterns, ...config.patterns }
    };

    this.appSubfolders = new Set<string>();

    // Déterminer le groupe par défaut
    if (config.defaultGroupName) {
      this.defaultGroupName = config.defaultGroupName;
    } else {
      const defaultGroup = config.importGroups.find(g => g.isDefault);
      this.defaultGroupName = defaultGroup ? defaultGroup.name : 'Misc';
    }

    this.typeOrder = this.config.typeOrder as TypeOrder;
    this.TypeOrder = this.config.TypeOrder as TypeOrder;
    this.patterns = this.config.patterns as SourcePatterns;
    this.priorityImportPatterns = this.config.priorityImports || [];
  }

  // Modification de la méthode parse dans ImportParser
  public parse(sourceCode: string): {
    groups: ImportGroup[];
    originalImports: string[];
    invalidImports: InvalidImport[];
  } {
    // Version améliorée de la regex pour capturer tous les imports, même avec erreurs
    // Cette regex est volontairement permissive pour capturer un maximum d'imports potentiels
    const importRegex = /^\s*import\s+(?:(?:type\s+)?(?:{[^;]*}|\*\s*as\s*\w+|\w+)?(?:\s*,\s*(?:{[^;]*}|\*\s*as\s*\w+|\w+))?(?:\s*from)?\s*['"]?[^'";]+['"]?;?|['"][^'"]+['"];?)/gm;

    const originalImports: string[] = [];
    const invalidImports: InvalidImport[] = [];

    // Première passe : capturer tous les imports potentiels
    const potentialImportLines: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(sourceCode)) !== null) {
      // Récupérer la ligne complète
      const lineStart = sourceCode.lastIndexOf('\n', match.index) + 1;
      let lineEnd = sourceCode.indexOf('\n', match.index);
      if (lineEnd === -1) lineEnd = sourceCode.length;

      // Vérifier si la déclaration d'import continue sur plusieurs lignes
      let importStmt = sourceCode.substring(match.index, lineEnd).trim();

      // Si l'import n'est pas terminé (pas de point-virgule), chercher la fin
      if (!importStmt.includes(';')) {
        let searchEnd = lineEnd;
        let nextLine = '';

        // Chercher jusqu'à trouver un point-virgule ou une ligne qui ne semble pas être la continuation
        do {
          const nextLineStart = searchEnd + 1;
          searchEnd = sourceCode.indexOf('\n', nextLineStart);
          if (searchEnd === -1) searchEnd = sourceCode.length;

          nextLine = sourceCode.substring(nextLineStart, searchEnd).trim();

          // Ajouter cette ligne si elle semble être une continuation de l'import
          if (nextLine && !nextLine.startsWith('import') && !nextLine.startsWith('//')) {
            importStmt += '\n' + nextLine;
          }

        } while (!importStmt.includes(';') && nextLine && !nextLine.startsWith('import') && searchEnd < sourceCode.length);
      }

      // Filtrer les lignes vides avant de les ajouter
      const trimmedImport = importStmt.trim();
      if (trimmedImport) {
        potentialImportLines.push(trimmedImport);
      }
    }

    // Deuxième passe : traiter chaque import potentiel avec Babel
    let parsedImports: ParsedImport[] = [];

    for (const importStmt of potentialImportLines) {
      try {
        // Ajouter à la liste des imports originaux
        originalImports.push(importStmt);

        // Utiliser Babel pour valider et corriger l'import
        const { fixed, isValid, error } = validateAndFixImportWithBabel(importStmt);

        if (!isValid) {
          // Ajouter des commentaires explicatifs pour des erreurs courantes
          let errorMessage = error || "Erreur de syntaxe non spécifiée";

          // Détection des erreurs courantes et ajout d'explications
          if (error?.includes("Unexpected token, expected \"from\"")) {
            if (importStmt.includes(" as ")) {
              errorMessage += " - Lors de l'utilisation d'un alias avec 'as', il faut l'inclure à l'intérieur des accolades pour les imports nommés ou l'utiliser avec un import par défaut. Exemple correct: import { Component as C } from 'module'; ou import Default as D from 'module';";
            }
          }

          invalidImports.push({
            raw: importStmt,
            error: errorMessage
          });
          continue;
        }

        // Utiliser la version corrigée fournie par Babel
        const normalizedImport = fixed || importStmt;

        // Analyser l'import normalisé
        const imports = this.parseImport(normalizedImport);

        // Si c'est un array, on a séparé les imports normaux des imports de type inline
        if (Array.isArray(imports)) {
          parsedImports = parsedImports.concat(imports);
        } else {
          parsedImports.push(imports);
        }
      } catch (error) {
        // En cas d'erreur d'analyse, ajouter aux imports invalides
        invalidImports.push({
          raw: importStmt,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Fusionner les imports de même type et même source
    parsedImports = this.mergeImports(parsedImports);

    // Organiser les imports en groupes
    const groups = this.organizeImportsIntoGroups(parsedImports);

    return { groups, originalImports, invalidImports };
  }

  /**
   * Analyse un statement d'import individuel
   * @returns ParsedImport | ParsedImport[] - Renvoie un seul import ou un tableau si des types inline sont détectés
   */
  private parseImport(importStmt: string): ParsedImport | ParsedImport[] {
    try {
      // Déterminer le type d'import
      const isTypeImport = importStmt.includes('import type');
      const isSideEffect = !importStmt.includes(' from ');

      // Extraire la source (module)
      const sourceMatch = importStmt.match(/from\s+['"]([^'"]+)['"]/);
      const source = sourceMatch ? sourceMatch[1] : importStmt.match(/import\s+['"]([^'"]+)['"]/)?.[1] ?? '';

      // Vérifier que nous avons une source valide
      if (!source) {
        throw new ImportParserError(
          `Impossible d'extraire la source du module d'import`,
          importStmt
        );
      }

      // Vérifier si c'est un import prioritaire (ex: React)
      const isPriority = this.isSourcePriority(source);

      // Déterminer le groupe auquel appartient cet import
      const groupName = this.determineGroupName(source);

      // Détecter les sous-dossiers @app
      let appSubfolder: string | null = null;

      if (this.patterns.appSubfolderPattern) {
        const appSubfolderMatch = source.match(this.patterns.appSubfolderPattern);
        if (appSubfolderMatch?.[1]) {
          appSubfolder = appSubfolderMatch[1];
          this.appSubfolders.add(appSubfolder);
        }
      }

      // Extraire les specifiers (ce qui est importé)
      let type: 'default' | 'named' | 'typeDefault' | 'typeNamed' | 'sideEffect' = 'default';
      let specifiers: string[] = [];

      if (isSideEffect) {
        type = 'sideEffect';
      } else if (isTypeImport) {
        if (importStmt.includes('{')) {
          type = 'typeNamed';
          const namedMatch = importStmt.match(/import\s+type\s+{([^}]+)}/);
          if (namedMatch) {
            specifiers = namedMatch[1].split(',').map(s => s.trim()).filter(s => s !== '');
          }
        } else {
          type = 'typeDefault';
          const defaultMatch = importStmt.match(/import\s+type\s+(\w+|\*\s+as\s+\w+)/);
          if (defaultMatch) {
            specifiers = [defaultMatch[1]];
          }
        }
      } else if (importStmt.includes('{')) {
        type = 'named';
        const namedMatch = importStmt.match(/import\s+(?:\w+\s*,\s*)?{([^}]+)}/);

        // Vérifier s'il y a un import par défaut avec des imports nommés
        const defaultWithNamedMatch = importStmt.match(/import\s+(\w+|\*\s+as\s+\w+)\s*,\s*{/);
        const defaultSpecifier = defaultWithNamedMatch ? defaultWithNamedMatch[1] : null;

        if (namedMatch) {
          // Traiter chaque spécificateur individuellement pour détecter les types inline
          const rawSpecifiers = namedMatch[1].split(/,|\n/).map(s => s.trim()).filter(s => s !== '');

          // Séparer les specifiers normaux des specifiers de type
          const regularSpecifiers: string[] = [];
          const typeSpecifiers: string[] = [];

          for (const spec of rawSpecifiers) {
            if (spec.startsWith('type ')) {
              // C'est un type inline, extraire le nom réel
              typeSpecifiers.push(spec.substring(5).trim());
            } else {
              regularSpecifiers.push(spec);
            }
          }

          // Vérifier les alias en tant que specifiers nommés (Component as C)
          const deduplicatedRegularSpecifiers = this.deduplicateSpecifiers(regularSpecifiers);

          // Si nous avons des types inline, nous devons créer des imports séparés
          if (typeSpecifiers.length > 0) {
            const result: ParsedImport[] = [];

            // Si nous avons aussi des imports par défaut, on les traite séparément
            if (defaultSpecifier) {
              result.push({
                type: 'default',
                source,
                specifiers: [defaultSpecifier],
                raw: importStmt,
                groupName,
                isPriority,
                appSubfolder
              });
            }

            // Ajouter les imports nommés réguliers s'il y en a
            if (deduplicatedRegularSpecifiers.length > 0) {
              result.push({
                type: 'named',
                source,
                specifiers: deduplicatedRegularSpecifiers,
                raw: importStmt,
                groupName,
                isPriority,
                appSubfolder
              });
            }

            // Ajouter les imports de type nommés
            const deduplicatedTypeSpecifiers = this.deduplicateSpecifiers(typeSpecifiers);
            result.push({
              type: 'typeNamed',
              source,
              specifiers: deduplicatedTypeSpecifiers,
              raw: importStmt,
              groupName,
              isPriority,
              appSubfolder
            });

            return result;
          }

          // Si pas de types inline, on continue normalement
          specifiers = deduplicatedRegularSpecifiers;

          // Ajouter l'import par défaut s'il existe
          if (defaultSpecifier) {
            type = 'default'; // En cas de mixte, on considère comme default pour le tri
            specifiers.unshift(defaultSpecifier);
          }
        }
      } else if (importStmt.includes('* as ')) {
        // Cas spécial pour les imports d'espace de noms (namespace)
        const namespaceMatch = importStmt.match(/import\s+\*\s+as\s+(\w+)/);
        if (namespaceMatch) {
          type = 'default'; // On traite les imports d'espace de noms comme des imports par défaut
          specifiers = [namespaceMatch[1]];
        }
      } else {
        type = 'default';
        const defaultMatch = importStmt.match(/import\s+(\w+|\*\s+as\s+\w+)/);
        if (defaultMatch) {
          specifiers = [defaultMatch[1]];
        }
      }

      if (!isSideEffect && specifiers.length === 0) {
        throw new ImportParserError(
          `Aucun spécificateur trouvé dans l'import`,
          importStmt
        );
      }

      return {
        type,
        source,
        specifiers,
        raw: importStmt,
        groupName,
        isPriority,
        appSubfolder
      };
    } catch (error) {
      // Si c'est déjà une ImportParserError, la propager
      if (error instanceof ImportParserError) {
        throw error;
      }

      // Sinon, créer une nouvelle ImportParserError
      throw new ImportParserError(
        `Erreur lors du parsing de l'import: ${error instanceof Error ? error.message : String(error)}`,
        importStmt
      );
    }
  }

  /**
   * Supprime les duplications dans un tableau de spécificateurs
   */
  private deduplicateSpecifiers(specifiers: string[]): string[] {
    // Classifier les spécificateurs par leur nom de base (sans alias ni type)
    const uniqueSpecs = new Map<string, string>();

    for (const spec of specifiers) {
      // Étape 1: Déterminer si c'est un spécificateur de type
      const isTypeSpec = spec.startsWith('type ');
      const specWithoutType = isTypeSpec ? spec.substring(5).trim() : spec;

      // Étape 2: Déterminer s'il a un alias
      let baseSpecName: string;
      let fullSpec = spec;

      if (specWithoutType.includes(' as ')) {
        const [baseName, _] = specWithoutType.split(' as ');
        baseSpecName = baseName.trim();
      } else {
        baseSpecName = specWithoutType;
      }

      // Étape 3: Créer une clé unique qui inclut le préfixe "type" si présent
      const uniqueKey = (isTypeSpec ? 'type_' : '') + baseSpecName;

      // Ne garder que la première occurrence
      if (!uniqueSpecs.has(uniqueKey)) {
        uniqueSpecs.set(uniqueKey, fullSpec);
      }
    }

    // Retourner les spécificateurs uniques dans leur forme originale
    return Array.from(uniqueSpecs.values());
  }

  /**
   * Vérifie et corrige les imports avant le parsing
   */
  private preprocessImport(importStmt: string): string {
    // Si ce n'est pas un import avec accolades, pas besoin de prétraitement
    if (!importStmt.includes('{')) {
      return importStmt;
    }

    try {
      // Regex pour décomposer l'import
      const importMatch = importStmt.match(/^(import\s+(?:type\s+)?)({[^}]*})(\s+from\s+.+)$/);
      if (!importMatch) {
        return importStmt;
      }

      const [_, prefix, specifiersBlock, suffix] = importMatch;

      // Extraire les spécificateurs
      const specifiersContent = specifiersBlock.substring(1, specifiersBlock.length - 1);
      const specifiers = specifiersContent.split(',').map(s => s.trim()).filter(Boolean);

      // Dédupliquer les spécificateurs
      const uniqueSpecifiers = this.deduplicateSpecifiers(specifiers);

      // Reconstruire l'import
      const correctedSpecifiers = uniqueSpecifiers.join(', ');
      return `${prefix}{${correctedSpecifiers}}${suffix}`;
    } catch (error) {
      // En cas d'erreur, retourner l'import original
      return importStmt;
    }
  }

  /**
   * Vérifie si une source est prioritaire dans son groupe en fonction des règles configurées
   */
  private isSourcePriority(source: string): boolean {
    // Si des patterns de priorité explicites sont définis, ils ont la priorité absolue
    if (this.priorityImportPatterns.length > 0) {
      return this.priorityImportPatterns.some(pattern => pattern.test(source));
    }

    // Sinon, chercher le groupe par défaut et vérifier si la source correspond au premier élément de sa regex
    const defaultGroup = this.config.importGroups.find(group => group.isDefault);
    if (defaultGroup) {
      // Extraire le premier élément de la regex comme prioritaire
      // Pour une regex comme /^(react|lodash|uuid)$/, on veut extraire "react"
      const regexStr = defaultGroup.regex.toString();
      const match = regexStr.match(/\(\s*([^|)]+)/);
      if (match && match[1]) {
        // Nettoyer l'expression (enlever ^ ou autres caractères spéciaux)
        const firstPattern = match[1].replace(/[^a-zA-Z0-9\-_]/g, '');
        // Vérifier si la source correspond à ce premier élément
        return new RegExp(`^${firstPattern}`).test(source);
      }
    }

    // Si aucune des conditions ci-dessus n'est remplie, pas de priorité
    return false;
  }

  /**
   * Nettoie une déclaration d'import en supprimant les commentaires et en normalisant le formatage
   * @param importStmt La déclaration d'import à nettoyer
   * @returns La déclaration d'import nettoyée
   */
  private cleanImportStatement(importStmt: string): string {
    // 1. Séparer la déclaration en lignes
    const lines = importStmt.split('\n');

    // 2. Nettoyer chaque ligne
    const cleanedLines: string[] = [];

    for (const line of lines) {
      // Ignorer les lignes de commentaires pures
      if (line.trim().startsWith('//')) {
        continue;
      }

      // Pour les autres lignes, enlever les commentaires à la fin
      const cleanedLine = line.replace(/\/\/.*$/, '').trim();
      if (cleanedLine) {
        cleanedLines.push(cleanedLine);
      }
    }

    // 3. Reconstruire la déclaration en une seule ligne
    let cleaned = cleanedLines.join(' ').trim();

    // 4. Vérifier si la déclaration se termine par un point-virgule
    if (!cleaned.endsWith(';')) {
      cleaned += ';';
    }

    return cleaned;
  }

  // Version améliorée de mergeImports pour vérifier la cohérence syntaxique
  private mergeImports(imports: ParsedImport[]): ParsedImport[] {
    // Map pour stocker les imports fusionnés par clé (type + source)
    const mergedImportsMap = new Map<string, ParsedImport>();

    for (const importObj of imports) {
      // Nettoyer la déclaration raw pour supprimer les commentaires
      const cleanedRaw = this.cleanImportStatement(importObj.raw);

      // Créer une clé unique basée sur le type et la source
      const key = `${importObj.type}:${importObj.source}`;

      if (mergedImportsMap.has(key)) {
        // Si un import de même type et source existe déjà, fusionner les specifiers
        const existingImport = mergedImportsMap.get(key)!;

        // Créer un ensemble pour éliminer les doublons
        const specifiersSet = new Set<string>([
          ...existingImport.specifiers,
          ...importObj.specifiers
        ]);

        // Mise à jour des specifiers sans doublon
        existingImport.specifiers = Array.from(specifiersSet).sort();

        // Conserver la raw declaration la plus complète (la plus longue en général)
        // mais sans les commentaires
        if (cleanedRaw.length > this.cleanImportStatement(existingImport.raw).length) {
          existingImport.raw = cleanedRaw;
        }

        // Vérifier que les specifiers sont bien représentés dans la déclaration raw
        this.validateSpecifiersConsistency(existingImport);
      } else {
        // Sinon, ajouter le nouvel import avec la version nettoyée de raw
        const newImport = {
          ...importObj,
          raw: cleanedRaw,
          // Trier les specifiers par ordre alphabétique
          specifiers: [...importObj.specifiers].sort()
        };

        // Vérifier que les specifiers sont cohérents avec la déclaration raw
        this.validateSpecifiersConsistency(newImport);

        mergedImportsMap.set(key, newImport);
      }
    }

    // Convertir la map en tableau
    return Array.from(mergedImportsMap.values());
  }

  // Nouvelle méthode pour valider la cohérence entre les specifiers et la raw declaration
  private validateSpecifiersConsistency(importObj: ParsedImport): void {
    // Pour les imports nommés, vérifier que tous les specifiers sont présents dans la déclaration raw
    if (importObj.type === 'named' || importObj.type === 'typeNamed') {
      // Reconstruction d'une déclaration propre basée sur les specifiers
      let prefix = importObj.type === 'typeNamed' ? 'import type ' : 'import ';
      let specifiersStr = `{ ${importObj.specifiers.join(', ')} }`;
      let reconstructed = `${prefix}${specifiersStr} from '${importObj.source}';`;

      // Si la déclaration reconstruite est sensiblement différente de la raw (à part la mise en forme),
      // mettre à jour la raw pour garantir la cohérence
      if (!this.areImportsSemanticallyEquivalent(importObj.raw, reconstructed)) {
        importObj.raw = reconstructed;
      }
    }
    // Pour les imports par défaut, faire une vérification similaire
    else if (importObj.type === 'default' || importObj.type === 'typeDefault') {
      let prefix = importObj.type === 'typeDefault' ? 'import type ' : 'import ';
      let reconstructed = `${prefix}${importObj.specifiers[0]} from '${importObj.source}';`;

      if (!this.areImportsSemanticallyEquivalent(importObj.raw, reconstructed)) {
        importObj.raw = reconstructed;
      }
    }
  }

  // Méthode pour comparer sémantiquement deux déclarations d'import (ignore les différences de formatage)
  private areImportsSemanticallyEquivalent(import1: string, import2: string): boolean {
    // Normaliser les deux imports en supprimant espaces, retours à la ligne, etc.
    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();

    // Extraire les parties importantes pour la comparaison
    const extractParts = (importStr: string) => {
      const typeMatch = importStr.includes('import type');
      const sourceMatch = importStr.match(/from\s+['"]([^'"]+)['"]/);
      const source = sourceMatch ? sourceMatch[1] : '';

      // Extraire les specifiers
      const specifiers: string[] = [];
      if (importStr.includes('{')) {
        const specifiersMatch = importStr.match(/{([^}]*)}/);
        if (specifiersMatch) {
          specifiers.push(...specifiersMatch[1].split(',').map(s => s.trim()).filter(Boolean));
        }
      } else if (!importStr.includes('{') && importStr.includes('import')) {
        const defaultMatch = importStr.match(/import\s+(?:type\s+)?(\w+|\*\s+as\s+\w+)/);
        if (defaultMatch) {
          specifiers.push(defaultMatch[1]);
        }
      }

      return { typeMatch, source, specifiers };
    };

    const parts1 = extractParts(normalize(import1));
    const parts2 = extractParts(normalize(import2));

    // Comparer les parties importantes
    return parts1.typeMatch === parts2.typeMatch &&
      parts1.source === parts2.source &&
      JSON.stringify(parts1.specifiers.sort()) === JSON.stringify(parts2.specifiers.sort());
  }

  /**
   * Détermine le nom du groupe pour un import en fonction de son module source
   */
  private determineGroupName(source: string): string {
    // Vérifier dans les groupes configurés
    for (const group of this.config.importGroups) {
      if (group.regex.test(source)) {
        return group.name;
      }
    }

    // Par défaut, utiliser le groupe par défaut configuré
    return this.defaultGroupName;
  }

  /**
   * Organise les imports analysés en groupes structurés et triés
   */
  private organizeImportsIntoGroups(imports: ParsedImport[]): ImportGroup[] {
    const groupMap = new Map<string, ParsedImport[]>();
    const appSubfolderGroups = new Map<string, ParsedImport[]>();

    // Créer les groupes de base à partir de la configuration
    const configGroupMap = new Map<string, number>();
    this.config.importGroups.forEach(group => {
      configGroupMap.set(group.name, group.order);
      groupMap.set(group.name, []);
    });

    // S'assurer que le groupe par défaut existe
    if (!groupMap.has(this.defaultGroupName)) {
      const defaultOrder = 999; // Ordre élevé par défaut
      groupMap.set(this.defaultGroupName, []);
      configGroupMap.set(this.defaultGroupName, defaultOrder);
    }

    // Répartir les imports dans les groupes appropriés
    imports.forEach(importObj => {
      // Si c'est un import de sous-dossier @app, le mettre dans son propre groupe
      if (importObj.appSubfolder) {
        const subfolder = importObj.appSubfolder;
        const groupName = `@app/${subfolder}`;

        if (!appSubfolderGroups.has(groupName)) {
          appSubfolderGroups.set(groupName, []);
        }

        appSubfolderGroups.get(groupName)!.push(importObj);
      }
      // Sinon, le mettre dans son groupe configuré
      else if (importObj.groupName && groupMap.has(importObj.groupName)) {
        groupMap.get(importObj.groupName)!.push(importObj);
      }
      // Fallback sur le groupe par défaut
      else {
        groupMap.get(this.defaultGroupName)!.push(importObj);
      }
    });

    // Pour chaque groupe, trier les imports selon les règles spécifiées
    groupMap.forEach((importsInGroup, groupName) => {
      groupMap.set(groupName, this.sortImportsWithinGroup(importsInGroup));
    });

    // Trier les sous-dossiers @app
    appSubfolderGroups.forEach((importsInGroup, groupName) => {
      appSubfolderGroups.set(groupName, this.sortImportsWithinGroup(importsInGroup));
    });

    // Fusionner tous les groupes en une liste finale
    const result: ImportGroup[] = [];

    // Ajouter les groupes configurés
    for (const [name, importsInGroup] of groupMap.entries()) {
      const order = configGroupMap.get(name) ?? 999; // Ordre par défaut très élevé si non configuré
      if (importsInGroup.length > 0) {
        result.push({
          name,
          order,
          imports: importsInGroup
        });
      }
    }

    // Ajouter les groupes de sous-dossiers @app (ordre basé sur la configuration de @app)
    const appGroup = this.config.importGroups.find(g => g.regex.toString().includes('@app'));
    const appGroupOrder = appGroup ? appGroup.order : 2; // Par défaut ordre 2

    const sortedSubfolders = Array.from(appSubfolderGroups.keys()).sort();

    for (const subfolderName of sortedSubfolders) {
      const subfolderImports = appSubfolderGroups.get(subfolderName)!;
      if (subfolderImports.length > 0) {
        result.push({
          name: subfolderName,
          order: appGroupOrder,
          imports: subfolderImports
        });
      }
    }

    // Trier les groupes selon leur ordre de configuration
    return result.sort((a, b) => {
      // Si même ordre, trier par nom pour les sous-dossiers @app
      if (a.order === b.order) {
        return a.name.localeCompare(b.name);
      }
      return a.order - b.order;
    });
  }

  /**
   * Trie les imports au sein d'un même groupe selon les règles spécifiées
   */
  private sortImportsWithinGroup(imports: ParsedImport[]): ParsedImport[] {
    return imports.sort((a, b) => {
      // Règle 1: Les imports prioritaires (React, etc.) ont toujours la priorité dans leur groupe
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;

      // Si les deux sont des imports prioritaires, appliquer l'ordre spécifique (ex: React)
      if (a.isPriority && b.isPriority) {
        if (a.type !== b.type) {
          return this.TypeOrder[a.type] - this.TypeOrder[b.type];
        }
      }

      // Règle 2: Appliquer la hiérarchie générale des types d'imports
      if (a.type !== b.type) {
        return this.typeOrder[a.type] - this.typeOrder[b.type];
      }

      // Règle 3: Tri alphabétique sur la source
      return a.source.localeCompare(b.source);
    });
  }

  /**
   * Récupère les sous-dossiers @app détectés
   */
  public getAppSubfolders(): string[] {
    return Array.from(this.appSubfolders).sort();
  }
}

export { ImportParser };
