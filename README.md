# ImportTidy

ImportTidy est une extension VSCode qui organise automatiquement vos imports dans les fichiers TypeScript/JavaScript. Elle groupe vos imports par catégories personnalisables, aligne les mots-clés "from" avec un espacement configurable, et trie intelligemment selon le type et la longueur.

## Fonctionnalités

- Regroupement des imports par catégories configurables
- Alignement des mots-clés "from" pour une meilleure lisibilité
- Tri intelligent des imports par type et longueur
- Espacement configurable entre les imports et les mots-clés "from"
- Fonctionne sur TypeScript, JavaScript, TSX et JSX

## Exemple

Avant :
```typescript
import { YpTable, YpDivider, YpTypography, YpElement, YpTag, YpButton } from 'ds';
import React, { FC, useState } from 'react';
import cn from 'classnames';
import type { User } from '@app/dossier/models';
import { formatDate } from '@library/helpers';
import { useTranslation } from '@core/i18n';
```

Après :
```typescript
// Misc
import React, { FC, useState } from 'react';
import cn                      from 'classnames';

// DS
import {
    YpTag,
    YpTable,
    YpButton,
    YpElement,
    YpDivider,
    YpTypography
} from 'ds';

// @app/dossier
import type { User } from '@app/dossier/models';

// @core
import { useTranslation } from '@core/i18n';

// @library
import { formatDate } from '@library/helpers';
```

## Configuration

```json
"importFormatter.groups": [
  {
    "name": "Misc",
    "regex": "^(react|lodash|date-fns)$",
    "order": 0
  },
  {
    "name": "DS",
    "regex": "^ds$",
    "order": 1
  },
  // autres groupes...
],
"importFormatter.alignmentSpacing": 2
```

## Utilisation

- Utilisez la commande "Format Document" de VSCode (Alt+Shift+F)
- Ou utilisez la commande "Format Imports" dans la palette de commandes

## Bugs connus

Si un fichier commence par un import nommé contenant des commentaires en ligne, l'import peut être mal formaté :

Ce code :
```typescript
import {
  getUserByAge, // Get user by age and ID
  useDataFromStorage // Hook to get data from storage
} from '@app/dossier/help';
```

Devient : 
```typescript


    getUserByAge, // Get user by age and ID
    useDataFromStorage // Hook to get data from storage
} from '@app/dossier/help';
```

Je travailles actuellement sur une correction de ce problème.
