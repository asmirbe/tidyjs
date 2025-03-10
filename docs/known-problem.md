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
