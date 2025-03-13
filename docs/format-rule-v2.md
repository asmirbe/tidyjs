## Règles de formatage des imports

Voici une liste complète des règles de formatage des imports :

## 1. Regroupement et ordre des imports

### 1.1 Groupes d'imports
- Les imports sont organisés en groupes configurés (comme "core", "library", "utils", etc.) avec un ordre spécifique
- Les groupes sont identifiés par des commentaires de section (ex: `// Core`)
- Les groupes sont triés selon leur propriété `order` configurée

### 1.2 Ordre à l'intérieur des groupes
- Les imports à effets de bord (ex: `import 'module';`) sont placés en haut de leur groupe
- Les imports React ont une priorité spéciale et sont placés en haut de leur groupe
- Les modules non-React sont ensuite triés alphabétiquement par nom de module
- Pour les modules du même type, les imports non-type précèdent les imports de type
- Les imports avec des longueurs effectives plus longues précèdent les plus courts

### 1.3 Hiérarchie des types d'imports
- Pour les imports React: imports par défaut (non-type) → imports nommés (non-type) → imports par défaut de type → imports nommés de type
- Les imports par défaut précèdent généralement les imports nommés

## 2. Format et alignement

### 2.1 Alignement
- Le mot-clé `from` est aligné au sein des groupes d'imports
- Tous les imports d'un groupe ont le même espacement avant `from`
- L'espacement d'alignement est configurable via `alignmentSpacing`

### 2.2 Formatage des imports nommés
- Les imports nommés uniques sont sur une ligne: `import { ElementUnique } from 'module';`
- Les imports nommés multiples sont sur plusieurs lignes avec une indentation de 4 espaces:
  ```typescript
  import {
      PremierElement,
      DeuxiemeElement
  } from 'module';
  ```
- Les imports nommés sont triés par longueur (du plus court au plus long)

### 2.3 Gestion des imports par défaut + nommés
- Les imports par défaut avec imports nommés sont divisés en déclarations séparées:
  ```typescript
  import NomParDefaut from 'module';
  import { ElementNomme1, ElementNomme2 } from 'module';
  ```

### 2.4 Imports de type
- Les imports de type utilisent la syntaxe `import type`
- Les imports de type par défaut et les imports de type nommés sont séparés
- Le même formatage multiligne s'applique aux imports de type avec plusieurs éléments

## 3. Espacement et séparation

### 3.1 Séparation des groupes
- Chaque groupe d'imports est séparé par une ligne vide

### 3.2 Gestion des commentaires
- Les commentaires de section sont préservés (ex: `// Core`)
- Les commentaires en ligne dans les imports sont supprimés
- Les commentaires dupliqués sont éliminés

### 3.3 Formatage final
- Les lignes vides consécutives sont réduites à une seule ligne vide
- Une ligne vide finale est ajoutée après tous les imports pour les séparer du reste du code

## 4. Traitements spéciaux

### 4.1 Imports dupliqués
- Les imports dupliqués pour le même module sont fusionnés

### 4.2 Cas spécial React
- Les imports React ont des règles d'ordre spéciales

### 4.3 Imports à effets de bord
- Les imports simples sans liaisons (ex: `import 'module';`) sont conservés en haut de leur groupe

### 4.3 Imports nommées type
- Les import nomées de type sont exporté afin de dossicier les imports type des autres imports.

Exemple : 
```TS
import {
   React,
   type FC // Doit etre exporté dans une ligne a part avec les autres imports de type de react.
} from 'raect';
// Résultat souhaité :
import { React }   from 'react';
import type { FC } from 'react'
```

Ce formateur crée une structure d'imports hautement organisée et cohérente avec un regroupement visuel clair et un alignement qui rend le code plus lisible.

## 5. Détails techniques

### 5.1 Regroupement dynamique des imports par modèle de chemin

Le formateur analyse les chemins d'imports pour créer et organiser dynamiquement des groupes basés sur des chemins de modules qui correspondent à des modèles comme `@app/{sousdossier}/*`.

Voici comment cela fonctionne:

1. **Détection de modèle de chemin**: Le code utilise une expression régulière (`appSubfolderPattern`) pour identifier les imports depuis des chemins qui correspondent à `@app/{sousdossier}/*`

2. **Enregistrement dynamique de groupe**: Lorsqu'un chemin d'import correspondant à ce modèle est trouvé, il extrait le nom du sous-dossier et l'enregistre comme un groupe dynamique:
   ```javascript
   if (appSubfolderMatch?.[1]) {
       const subfolder = appSubfolderMatch[1];
       if (typeof configManager.registerAppSubfolder === 'function') {
           configManager.registerAppSubfolder(subfolder);
       }
   }
   ```

3. **Génération de groupe**: Cela crée des commentaires de section comme `// @app/dossier`, `// @app/client`, etc. basés sur les noms des sous-dossiers

4. **Tri**: Les imports au sein de ces groupes dynamiques sont ensuite triés selon les mêmes règles que les autres groupes

Ce modèle est configurable via regex. Le code utilise `config.regexPatterns.appSubfolderPattern` pour identifier ces groupes dynamiques.

Dans votre configuration, vous devriez pouvoir définir ce modèle regex pour correspondre aux chemins d'imports pour lesquels vous souhaitez créer des groupes dynamiques. Par exemple, une regex comme:

```javascript
appSubfolderPattern: /@app\/([^/]+)/
```

Cela capture le nom du sous-dossier à partir des imports qui correspondent à `@app/{sousdossier}/*`, créant des groupes séparés pour chaque sous-dossier unique trouvé.

Fixtures
- Entrées (input) // Code source originel
- Expected (output) // Code souhaité obtenu


Input:
```TS
import type { Test } from 'react';
import { useState }  from 'react';
import type Test from 'react';

import { YpButton }  from 'ds';

import React  from 'react';
```
Expected output:
```TS
// Misc
import React          from 'react';
import { useState }   from 'react';
import type Test      from 'react';
import type { Test }  from 'react';

// DS
import { YpButton }  from 'ds';

```

Input:
```TS
// @app/dossier
import AbsenceInitFormComponent from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
import AccordFormComponent from '@app/dossier/components/britania/init/AbsenceInitFormComponent';
import useUtilisateurSearch from '@app/client/providers/parametrage/utilisateurs/UtilisateurSearchProvider';
import AbsencesFormComponent from '@app/dossier/components/absences/init/AbsencesFormComponent';
```
Expected output:
```TS
// @app/client
import useUtilisateurSearch  from '@app/client/providers/parametrage/utilisateurs/UtilisateurSearchProvider';

// @app/dossier
import AbsenceInitFormComponent  from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import AbsencesFormComponent     from '@app/dossier/components/absences/init/AbsencesFormComponent';
import AccordFormComponent       from '@app/dossier/components/britania/init/AbsenceInitFormComponent';

// @app/notification
import { useClientNotification }  from '@app/notification/ClientNotificationProvider';

```