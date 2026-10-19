ED BUSINESS CENTER — PROJET REACT/VITE/SUPABASE (VERSION MOBILE-FIRST)
====================================================================

CONTENU
- src/ : code React de l'application et ses composants.
- src/imageCatalog.js : registre central des noms d'images identifiés et construction des URLs Supabase.
- src/styles.css : styles existants + ajustements mobile; les règles desktop existantes ne sont pas supprimées.
- supabase/ : scripts SQL fournis avec cette version.
- Plan_disposition_images_ED_BUSINESS_CENTER.pdf : plan d'affectation fourni.
- IMAGE_INVENTORY.json / IMAGE_INVENTORY.csv : 126 noms lisibles identifiés dans le PDF; ce n'est PAS une preuve que les 153 fichiers sont tous inventoriés ou présents.
- IMAGE_USAGE_AUDIT.md : distinction entre les images référencées dans les pages et celles disponibles dans la médiathèque admin.
- src/ImageLibrarySection.jsx : médiathèque d'images réservée au rôle admin, avec recherche, filtre et copie des URLs.
- .github/workflows/deploy.yml : déploiement sur GitHub Pages à chaque push sur main/master.

INSTALLATION LOCALE
1. Installer Node.js 20 ou plus récent.
2. Depuis la racine du dépôt : npm install
3. Copier .env.example vers .env.local si tu souhaites configurer les variables.
4. npm run dev
5. Vérifier la compilation avec npm run build avant publication.

CONFIGURATION SUPABASE
- URL actuelle : https://jvwmkoshkkzupgrjcttx.supabase.co
- Bucket d'images : ed-b-center-images
- Déposer les fichiers dans ce bucket en respectant EXACTEMENT les noms/extensions du PDF.
- Le code charge les images par URL publique du bucket. Vérifier que le bucket et ses objets autorisent la lecture publique si c'est le mode retenu.
- La clé navigateur doit être une clé publishable/anon uniquement. Ne jamais placer la service_role key dans React, GitHub Pages ou un fichier public.
- La sécurité des données doit être assurée par les politiques RLS et les fonctions SQL.

MIGRATIONS ET FONCTIONNALITÉS
- Lire chaque fichier SQL et l'exécuter dans Supabase SQL Editor seulement après avoir vérifié le projet cible et les tables/fonctions concernées.
- Les fonctions de communauté, ateliers, actualités, notifications et coordinateur dépendent de tables, RPC, politiques RLS et autorisations Supabase correspondantes.
- La réservation d'atelier et son état ne constituent pas une intégration de paiement mobile-money. Aucun fournisseur de paiement n'est configuré par ces fichiers; ne pas annoncer le paiement comme automatisé tant qu'un prestataire et son mécanisme serveur ne sont pas intégrés et testés.
- L'accès coordinateur dépend de fonctions SQL et de la configuration du compte coordinateur.
- L'administration générale, les abonnements, le suivi de commandes, le sourcing et les autres sous-sections décrites dans le plan fonctionnel nécessitent leurs tables, écrans et tests spécifiques. Ce dépôt préserve le code existant et améliore l'affichage mobile; il ne faut pas considérer toutes ces fonctions comme opérationnelles uniquement parce qu'elles sont listées dans le plan.

IMAGES
- Le PDF indique 153 lignes visibles dans les captures mais précise que tous les noms ne sont pas lisibles. L'inventaire fourni ici contient 126 noms identifiés, pas un inventaire certifié de 153 fichiers.
- Le carrousel de motivation a été relié aux 12 fichiers motivation listés dans le PDF.
- La médiathèque d'administration affiche les 126 noms identifiés et charge leurs aperçus à la demande. Cela ne signifie pas que chaque illustration est déjà utilisée dans toutes les pages métier prévues; certaines sont destinées à des écrans/états qui restent à développer.
- Les images sont chargées à distance depuis Supabase; elles ne sont pas intégrées dans ce ZIP.
- Pour chaque image manquante, vérifier le nom exact, l'extension, le chemin, la présence dans le bucket et les permissions de lecture.
- Certaines illustrations sont prévues uniquement pour des états spécifiques (ex. aucun résultat, erreur, réservation confirmée). Il ne faut pas afficher artificiellement toutes les images sur toutes les pages.

TESTS / LIMITES DE VALIDATION
- Le code fourni doit être compilé avec npm run build dans ton environnement avant le push.
- L'installation des dépendances n'a pas pu être achevée dans l'environnement de génération à cause d'un délai réseau; par conséquent, aucune compilation Vite complète n'est revendiquée ici.
- Il n'est pas possible de garantir « zéro bug » sans exécuter les tests sur ton dépôt, ton schéma Supabase, les politiques RLS, les comptes/rôles et les fichiers réellement stockés.
- Effectuer d'abord un commit de sauvegarde de l'application actuelle. Comparer ensuite les changements et tester inscription, connexion, rôles, catalogue, profil, publications, interactions, notifications, ateliers et administration.

GITHUB PAGES
- Le workflow GitHub Actions fourni construit le projet et déploie le dossier dist sur GitHub Pages.
- Dans GitHub : Settings > Pages > Build and deployment, choisir GitHub Actions.
- Le workflow suppose que le dépôt utilise main ou master.
- base Vite est relatif (./) pour éviter de coder en dur un nom de dépôt.
