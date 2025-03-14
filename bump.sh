#!/bin/bash
# Ce script est utilisé pour mettre à jour la version dans le fichier package.json
# et créer automatiquement un tag Git pour la release

# Fonction d'affichage de l'aide
show_help() {
  echo "Usage: ./bump.sh [option]"
  echo "Options:"
  echo "  major    Incrémente la version majeure (X.0.0)"
  echo "  minor    Incrémente la version mineure (0.X.0)"
  echo "  patch    Incrémente la version de correctif (0.0.X)"
  echo "  --help   Affiche cette aide"
  echo ""
  echo "Si aucune option n'est spécifiée, la version de correctif sera incrémentée par défaut."
}

# Vérifier si l'aide est demandée
if [ "$1" == "--help" ]; then
  show_help
  exit 0
fi

# Récupérer la version actuelle du package.json
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

# Diviser la version en composants
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Déterminer quelle partie de la version incrémenter
case "$1" in
  "major")
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  "minor")
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  "patch"|"")
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Option non reconnue: $1"
    show_help
    exit 1
    ;;
esac

# Construire la nouvelle version
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "Mise à jour de la version: $CURRENT_VERSION -> $NEW_VERSION"

# Mettre à jour la version dans package.json
if command -v jq &> /dev/null; then
  # Utiliser jq si disponible (meilleure manipulation de JSON)
  jq --arg version "$NEW_VERSION" '.version = $version' package.json > package.json.tmp
  mv package.json.tmp package.json
  echo "Version mise à jour avec jq"
else
  # Utiliser sed comme alternative
  sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
  rm -f package.json.bak
  echo "Version mise à jour avec sed"
fi

echo "Version mise à jour avec succès: $NEW_VERSION"

# Créer un commit Git avec la nouvelle version
git add package.json
git commit -m "Bump version to $NEW_VERSION"

# Créer un tag Git pour la nouvelle version
git tag "v$NEW_VERSION"

# Demander confirmation avant de pousser
read -p "Voulez-vous pousser le commit et le tag vers GitHub? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
  # Pousser le commit et le tag
  git push origin main
  git push origin "v$NEW_VERSION"
  echo "Commit et tag poussés avec succès. GitHub Actions va maintenant créer une release."
else
  echo "Commit et tag créés localement. Utilisez 'git push origin main && git push origin v$NEW_VERSION' pour déclencher la création de la release."
fi
