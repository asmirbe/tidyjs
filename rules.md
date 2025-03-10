# Description détaillée des règles de formatage

## 1. Organisation par groupes

- Les imports sont organisés en groupes nommés (ex: Misc, DS, @app/dossier, @core, @library, Utils)
- L'ordre des groupes est configurable via la propriété `order` dans la configuration
- Chaque groupe est identifié par un pattern regex qui matche le nom du module
- Par défaut, les groupes suivants sont configurés:

  1. **Misc** (`^(react|lodash|date-fns)$`) - ordre 0
  2. **DS** (`^ds$`) - ordre 1
  3. **@app/dossier** (`^@app\/dossier`) - ordre 2
  4. **@core** (`^@core`) - ordre 3
  5. **@library** (`^@library`) - ordre 4
  6. **Utils** (`^yutils`) - ordre 5

Exemple:
```ts
// Misc
import React from 'react';

// DS 
import { Button } from 'ds';
```

## 2. Ordre au sein des groupes

Les imports sont triés dans chaque groupe selon les règles suivantes:

1. Priorité spéciale pour React (toujours en premier dans le groupe Misc)
2. Type d'import (dans cet ordre):
   - Imports par défaut sans type
   - Imports nommés sans type 
   - Imports de type

3. Pour les imports de même type:
   - Tri par longueur du nom le plus court
   - En cas de longueur égale, ordre alphabétique

## 3. Formatage des imports

### Imports simples
```ts
import 'module';
```

### Imports par défaut
```ts
import DefaultName from 'module';
import type DefaultType from 'module';
```

### Imports nommés
- Sur une ligne si un seul import:
```ts
import { Name } from 'module';
```

- Multi-lignes si plusieurs imports:
```ts
import {
    ShortName,
    LongerName,
    VeryLongImportName
} from 'module';
```
## 4. Alignement

- Les mots-clés `from` sont alignés dans chaque groupe pour améliorer la lisibilité
- L'espacement minimal avant `from` est configurable (`alignmentSpacing`, défaut: 1 espace)
- L'alignement est préservé même avec des imports multi-lignes

Exemple:
```ts
import { short }        from 'module';
import { longerName }   from 'module';
```

## 5. Gestion des commentaires

- Les commentaires de section sont préservés (`// Misc`, `// DS`, etc)
- Les commentaires en ligne dans les imports sont conservés (configurable via `preserveComments`)
- Les commentaires isolés entre les imports sont supprimés
- Une ligne vide est ajoutée entre chaque groupe

## 6. Détection des imports

- Détecte les déclarations d'import standards
- Reconnaît les fragments d'imports sur plusieurs lignes
- Ignore les imports dynamiques (`await import()`)
- S'arrête à la première déclaration de type/interface/classe
- Détection intelligente de la section d'imports, incluant les fragments d'imports orphelins

## 7. Gestion des lignes vides

- Une seule ligne vide entre les groupes
- Les lignes vides consécutives sont réduites à une seule
- Une ligne vide finale est ajoutée après la section d'imports pour la séparer du reste du code

## 8. Fonctionnalités d'optimisation

- Fusion des imports du même module pour éviter la duplication
- Cache pour les opérations coûteuses comme la correspondance de groupe
- Pré-calcul des largeurs pour l'alignement

## 9. Configuration personnalisable

L'extension permet de personnaliser:

1. **Groupes d'imports**: Définir vos propres groupes avec noms, expressions régulières et ordre
2. **Espacement d'alignement**: Contrôler l'espacement entre les imports et les mots-clés `from`
3. **Préservation des commentaires**: Activer/désactiver la préservation des commentaires inline

## 10. Commande et raccourci

L'extension fournit une commande "Format Imports" accessible via:
- La palette de commandes VSCode
- Le raccourci clavier `Ctrl+Shift+I` (ou `Cmd+Shift+I` sur Mac)