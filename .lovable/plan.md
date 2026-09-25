# Refonte responsive du panneau Caakus

## Objectif
Transformer uniquement `/nathan` en cockpit d’administration sombre et coloré, sans modifier les données, permissions ni actions existantes.

## À construire
- Créer une identité visuelle dark-glass cohérente avec fond profond, surfaces translucides et accents lumineux propres à chaque onglet.
- Moderniser l’en-tête et la navigation avec des onglets lisibles, tactiles et défilables sur petits écrans.
- Recomposer les indicateurs, graphiques et résumés pour une lecture rapide, avec chiffres contrastés et animations d’entrée discrètes.
- Harmoniser Utilisateurs, Appels, Revenus, Modération et Indexation avec leurs couleurs dédiées, badges lumineux et états actifs.
- Transformer les listes et tableaux en grilles de type terminal sur grand écran, avec défilement horizontal ou présentation compacte adaptée sur mobile.
- Ajouter un retour visuel immédiat aux actions existantes : chargement, désactivation, succès et erreur, sans changer leur fonctionnement.
- Corriger les débordements, tailles tactiles et empilements pour téléphone, tablette et ordinateur.

## Validation
- Vérifier `/nathan` sur téléphone et ordinateur, notamment la navigation, les filtres, les cartes, les tableaux et les boutons.
- Confirmer l’absence de débordement ou de chevauchement et respecter la réduction des animations du système.
- Vérifier que l’application se compile et que seules les surfaces d’administration ont changé.

## Détails techniques
- Réutiliser les composants existants et Framer Motion déjà installé.
- Centraliser les couleurs et effets du panneau dans des variables sémantiques dédiées afin d’éviter les valeurs dispersées.
- Ne toucher ni aux fonctions serveur, ni aux requêtes, ni aux autorisations administrateur.
