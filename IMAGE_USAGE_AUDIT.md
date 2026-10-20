# Audit des images — ED BUSINESS CENTER

- **126 noms d'images identifiés** dans le PDF de disposition sont enregistrés dans `src/imageCatalog.js` et dans les fichiers `IMAGE_INVENTORY.*`.
- **La médiathèque d'administration** (menu visible pour le rôle `admin`) parcourt dynamiquement les 126 noms, avec recherche, filtre par catégorie et copie de l'URL Supabase. Le chargement des aperçus est différé (`loading="lazy"`) pour limiter le trafic sur mobile.
- **Les pages fonctionnelles principales** référencent directement un sous-ensemble d'images : logo, bannière d'accueil, six services, cinq formations, douze visuels de motivation, actualités, communauté, ateliers, notifications et état d'accès coordinateur.
- Les autres illustrations du registre sont destinées aux sections prévues dans le plan fonctionnel (espace apprenant, commandes LE RÉSEAU, gestion avancée du compte et de l'administration). Certaines ne doivent apparaître que dans un état précis, par exemple « aucun résultat », « réservation confirmée » ou « erreur ».
- Le PDF mentionne 153 lignes de fichiers dans les captures, mais avertit que tous les noms ne sont pas lisibles. **Les 27 noms non identifiés ne sont pas inventés**. Le chiffre 126 correspond aux noms extraits et vérifiables dans le PDF, pas au nombre certifié d'objets réellement présents dans Supabase.
- Le ZIP ne contient pas les fichiers image physiques : les images sont servies depuis `ed-b-center-images`. Si un fichier manque, l'interface affiche un visuel de secours; il faut toujours corriger le nom ou téléverser le fichier exact dans Supabase.
