## 1. Organisation par groupes

- Les imports sont organisés en groupes nommés (ex: Misc, DS, @app, @core, @library)
- L'ordre des groupes est configurable via la propriété `order` dans la configuration
- Chaque groupe est identifié par un pattern regex qui matche le nom du module

```ts
// Misc
import React from 'react';

// DS 
import { Button } from 'ds';
```

## 2. Ordre au sein des groupes

Les imports sont triés dans chaque groupe selon les règles suivantes:

1. Priorité React (dans le groupe Misc)
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

- Les mots-clés `from` sont alignés dans chaque groupe
- L'espacement avant `from` est configurable (`alignmentSpacing`)
- L'alignement est préservé même avec des imports multi-lignes

## 5. Gestion des commentaires

- Les commentaires de section sont préservés (`// Misc`, `// DS`, etc)
- Les commentaires en ligne dans les imports sont conservés
- Les commentaires isolés entre les imports sont supprimés
- Une ligne vide est ajoutée entre chaque groupe

## 6. Détection des imports

- Détecte les déclarations d'import standards
- Reconnaît les fragments d'imports sur plusieurs lignes
- Ignore les imports dynamiques (`await import()`)
- S'arrête à la première déclaration de type/interface/classe

## 7. Lignes vides

- Une seule ligne vide entre les groupes
- Les lignes vides consécutives sont réduites à une seule
- Une ligne vide finale est ajoutée après la section d'imports

Le formatage peut être personnalisé via la configuration de l'extension dans VS Code (`importFormatter.groups` et `importFormatter.alignmentSpacing`).