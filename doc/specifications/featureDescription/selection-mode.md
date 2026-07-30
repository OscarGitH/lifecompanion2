# Description générale

Doit gérer toutes les interactions avec l'interface du point de vue de l'utilisateur.

# Contraintes fonctionnelles

- Envisager tous les modes de sélection pertinents en CAA
  - tactile
  - souris
  - souris avec temporisation
  - eyetracking / headtracking
  - défilement (manuel, automatique, ligne/colonne, linéaire, etc)
- Indépendance des modes de sélection
  - De l'interface présentée (générique peu importe les grilles etc)
  - Les uns des autres : pouvoir en avoir plusieurs en même temps (ex : tactile + défilement)
- Être en capacité de paramétrer (non exhaustif)
  - Choisir le déclenchement à l'appui ou au relâchement
  - Choisir le temps d'appui minimum
  - Choisir la "première" ou la "dernière" position
  - Délai entre deux appuis (global ou sur la même case)
- La sélection doit être possible
  - Avec un appui / relâchement (ex. : clic de souris, tactile, contacteurs)
  - Avec une temporisation (ex. : headtracking)
  - Avec un survol
- Alternatives (doit être possible dans l'architecture)
  - Sélection par double appui
  - Sélection par clic long
- Idées
    - Force de pression ?

- Gestion de la notion d'actions qui ont deux types
  - "Simple" : juste une fonction de ce que fait l'action (ex. : écrire du texte)
  - "Complexe" : une fonction de "début" et une fonction de "fin" de l'action (ex. : effacer tant qu'une touche est maintenue/enfoncée)

# Implémentation

- Partir d'une logique de curseur virtuel qui peut être "piloté"
   - par la souris physique
   - par le défilement (position contrainte par le défilement)
   - par une API / un dispositif (eyetracking, etc)
- Curseur virtuel, contrat de fonctionnement
  - positionnement (donne le "over" / survol / entrée / sortie)
    - positionnement absolu sur l'écran (ex. : eyetracking qui donne la position sur l'écran)
    - positionnement relatif dans la configuration (ex. : défilement au-dessus d'une case)
    - positionnement relatif à la position actuelle (ex. : joystick)
  - interaction
    - appui (press)
    - relâchement (release)