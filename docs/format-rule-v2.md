## Règles de formatage des imports

Voici une liste complète des règles de formatage des imports :

## 1. Regroupement et ordre des imports

### 1.1 Groupes d'imports
- Les imports sont organisés en groupes configurés (comme "core", "library", "utils", etc.) avec un ordre spécifique
- Les groupes sont identifiés par des commentaires de section (ex: `// Core`)
- Les groupes sont triés selon leur propriété `order` configurée

### 1.2 Ordre à l'intérieur des groupes (Précision)
- L'ordre exact des imports dans un groupe est :
  1. Imports React par défaut (ex: `import React from 'react';`)
  2. Imports React nommés (ex: `import { useState } from 'react';`)
  3. Imports React de type par défaut (ex: `import type Test from 'react';`)
  4. Imports React de type nommés (ex: `import type { Test } from 'react';`)
  5. Autres imports par défaut, triés alphabétiquement
  6. Autres imports nommés, triés alphabétiquement
  7. Autres imports de type par défaut, triés alphabétiquement
  8. Autres imports de type nommés, triés alphabétiquement

### 1.3 Hiérarchie des types d'imports (Précision)
- La hiérarchie précise des imports est :
  1. Imports à effets de bord (ex: `import 'module';`)
  2. Imports par défaut non-type
  3. Imports nommés non-type
  4. Imports de type par défaut
  5. Imports de type nommés
- Cette hiérarchie s'applique après avoir priorisé les imports React au sein de chaque groupe

### 4.2 Cas spécial React (Précision)
- Les imports React ont toujours la priorité la plus élevée dans leur groupe
- Les imports React suivent strictement cet ordre :
  1. Import par défaut de React (non-type)
  2. Imports React nommés (non-type)
  3. Import de type par défaut de React
  4. Imports de type nommés de React
- Cette règle prévaut sur toutes les autres règles d'ordre alphabétique

### 5.1 Regroupement dynamique des imports (Précision)
- Les imports correspondant à un modèle de chemin `@app/{sousdossier}/*` sont groupés par sous-dossier
- Ces groupes sont nommés exactement selon le format `// @app/{sousdossier}`
- Les groupes dynamiques sont triés alphabétiquement par nom de sous-dossier (ex: `@app/client` avant `@app/dossier` avant `@app/notification`)
- Au sein de chaque groupe dynamique, les imports suivent toutes les règles standard d'ordre et de formatage (règles 1.2 et 1.3)

### 6. Commentaires de section par défaut (Nouvelle règle)
- Les imports qui ne correspondent pas aux groupes dynamiques ou prédéfinis sont placés dans un groupe par défaut nommé `// Misc`
- Les imports depuis des bibliothèques de design system (comme 'ds') sont regroupés sous le commentaire de section `// DS`
- Ces commentaires de section sont toujours présents, même s'il n'y a qu'un seul import dans le groupe

### 7. Alignement précis (Précision pour règle 2.1)
- Dans chaque groupe, tous les mots-clés `from` doivent être alignés sur la même colonne
- L'espacement entre la fin de la partie import et le mot-clé `from` est réalisé avec des espaces
- L'alignement doit s'adapter à l'import le plus long de chaque groupe individuel
- Lorsqu'un import a plusieurs éléments nommés, l'accolade fermante doit être alignée avec les autres identifiants d'import


In-fine le parser doit fournir une structure d'imports hautement organisée et cohérente avec un regroupement visuel clair et un alignement qui rend le code plus lisible.

Ensuite la parser passe les infos au `foramtter.ts` qui va s'occuper de faire les traitement de string pour aligner tous les imports selon les régles strict.

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