Voilà le code de mon extension VSCode de formattage.
Créer un nouveau fichier utilitaire si nécessaire pour répondre a la problématique.
Puis intégres la fonction dans mon code.

Problématique : Commentaires internes aux imports :

import {
    getUserByAge, // Get user by age and ID
    useDataFromStorage // Hook to get data from storage
} from '@app/dossier/help';

Les commentaires à l'intérieur des imports peuvent perturber l'analyse et le formatage.

Solution : Améliorer la gestion des commentaires en les préservant lors du formatage.

--

Problématique : Imports dynamiques/import() :

const module = await import('./dynamicModule');

Les imports dynamiques ne sont pas détectés par les expressions régulières actuelles.

Solution : Il faut les ignorer explicitement

--

Problématique : Détection d'imports inutilisés :

Le formateur organise les imports mais ne détecte pas les imports inutilisés.

Solution : Ajouter une option pour identifier, grouper dans "// Unused" puis commenter les imports non utilsés.

--

Problématique : Code JSX complexe ressemblant à des imports
<Component 
  from="string" 
  import={variable}
/>
Ce genre de JSX pourrait être confondu avec les fragments d'import.
Solution : Améliorer les regex pour exclure les structures JSX lors de la détection des imports.

--
Problématique : Problèmes de performance avec les grands fichiers
Un fichier avec des milliers de lignes
Solution : Limiter l'analyse aux premières 100 lignes du fichier pour la détection des imports.