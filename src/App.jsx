import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import CommunitySection from "./CommunitySection";
import NotificationsSection from "./NotificationsSection";
import "./styles.css";

/* =====================================================
   ED BUSINESS CENTER
   Application principale
   PARTIE 1 : CONFIGURATION ET DONNÉES
===================================================== */

/* Chemin des images */
const SUPABASE_IMAGES_URL =
  "https://jvwmkoshkkzupgrjcttx.supabase.co/storage/v1/object/public/ed-b-center-images";

const image = (filename) =>
  `${SUPABASE_IMAGES_URL}/${encodeURIComponent(filename)}`;

/* Informations de l'entreprise */
const BRAND = {
  name: "ED BUSINESS CENTER",
  shortName: "ED B-CENTER",
  slogan: "Apprendre, pratiquer, entreprendre !",
  description:
    "Un centre dédié à l'apprentissage pratique, au développement des compétences et à l'accompagnement vers l'entrepreneuriat.",
  email: "edbusinesscenter@gmail.com",
  phone: "+237 690 418 794",
  whatsapp: "https://wa.me/237690418794",
  facebook:
    "https://www.facebook.com/profile.php?id=61595517983213",
  instagram:
    "https://www.instagram.com/edbcenter?psln=MXJlcjVhYXY5aXRjNg==",
};

/* Réseaux sociaux */
const SOCIALS = [
  {
    name: "WhatsApp",
    image: "logo-whatsapp.png",
    url: BRAND.whatsapp,
    description: "Contacter l'équipe ED BUSINESS CENTER sur WhatsApp",
  },
  {
    name: "Facebook",
    image: "logo-facebook.png",
    url: BRAND.facebook,
    description: "Retrouver ED BUSINESS CENTER sur Facebook",
  },
  {
    name: "Instagram",
    image: "logo-instagram.jpeg",
    url: BRAND.instagram,
    description: "Découvrir les activités d'ED BUSINESS CENTER sur Instagram",
  },
  {
    name: "Gmail",
    image: "logo-gmail.png",
    url: `mailto:${BRAND.email}`,
    description: "Envoyer un e-mail à ED BUSINESS CENTER",
  },
];

/* =====================================================
   CARROUSEL DE MOTIVATION
   Ces quatre images sont réservées à cette section.
===================================================== */

const MOTIVATION_IMAGES = [
  {
    image: "motivation-1-entrepreneur.png",
    title: "Construis ton avenir",
    text:
      "Chaque compétence acquise peut devenir le point de départ d'une nouvelle opportunité.",
    alt:
      "Entrepreneur motivé qui avance vers ses objectifs professionnels.",
  },
  {
    image: "motivation-2-reflexion.jpeg",
    title: "Transforme tes idées en projets",
    text:
      "Prends le temps de réfléchir, de planifier et de préparer tes prochaines actions.",
    alt:
      "Personne en pleine réflexion sur ses idées et ses projets.",
  },
  {
    image: "motivation-3-entrepreneur.jpeg",
    title: "Passe à l'action",
    text:
      "Apprends, entraîne-toi et développe des réalisations concrètes pour progresser.",
    alt:
      "Entrepreneur concentré sur le développement de son activité.",
  },
  {
    image: "motivation-4-meditation.jpeg",
    title: "Crois en ton potentiel",
    text:
      "La progression demande de la patience, de la discipline et une volonté d'apprendre.",
    alt:
      "Personne prenant un moment de calme pour se recentrer sur ses objectifs.",
  },
];

/* =====================================================
   SERVICES ED BUSINESS CENTER
===================================================== */

const SERVICES = [
  {
    id: "academy",
    name: "ED B-ACADEMY",
    category: "Formation pratique",
    image: "service-ed-b-academy.png",
    description:
      "Des formations orientées vers la pratique, la réalisation de projets et le développement de compétences utiles.",
    details: [
      "Infographie et intelligence artificielle",
      "Sourcing en Chine",
      "Excel et outils numériques",
      "Exercices pratiques et projets",
    ],
  },
  {
    id: "consulting",
    name: "ED B-CONSULTING",
    category: "Conseil et accompagnement",
    image: "service-ed-b-consulting.png",
    description:
      "Un accompagnement pour mieux structurer tes idées, préparer tes projets et identifier des solutions adaptées.",
    details: [
      "Conseils pour les projets",
      "Accompagnement entrepreneurial",
      "Organisation des activités",
      "Orientation vers des solutions pratiques",
    ],
  },
  {
    id: "digital",
    name: "ED DIGITAL AGENCY",
    category: "Communication digitale",
    image: "service-ed-digital-agency.png",
    description:
      "Des solutions de communication visuelle et digitale pour valoriser les activités des particuliers et des entreprises.",
    details: [
      "Création de visuels publicitaires",
      "Contenus pour les réseaux sociaux",
      "Identité visuelle",
      "Supports de communication",
    ],
  },
  {
    id: "sourcing",
    name: "ED B-SOURCING",
    category: "Recherche et approvisionnement",
    image: "service-ed-b-sourcing.png",
    description:
      "Un service de recherche de produits, de comparaison de fournisseurs et d'accompagnement des commandes, notamment depuis la Chine.",
    details: [
      "Recherche de produits",
      "Comparaison des offres",
      "Estimation des coûts",
      "Accompagnement des commandes",
    ],
  },
  {
    id: "solution",
    name: "ED B-SOLUTION",
    category: "Solutions numériques",
    image: "service-ed-b-solution.png",
    description:
      "Des solutions numériques destinées à faciliter certaines activités et à améliorer l'organisation du travail.",
    details: [
      "Solutions numériques adaptées",
      "Appui aux activités professionnelles",
      "Organisation des informations",
      "Accompagnement dans les usages numériques",
    ],
  },
  {
    id: "photographie",
    name: "ED B-PHOTOGRAPHIE",
    category: "Photographie",
    image: "service-packs-photographie.png",
    description:
      "Des prestations photographiques pour mettre en valeur les personnes, les produits et les activités professionnelles.",
    details: [
      "Séances photo",
      "Photographie de produits",
      "Images pour la communication",
      "Valorisation des marques et activités",
    ],
  },
];

/* =====================================================
   FORMATIONS ET TARIFS
===================================================== */

const COURSES = [
  {
    id: "infographie-ia",
    title: "Infographie & Intelligence artificielle",
    category: "Création numérique",
    image: "course-infographie-ia.png",
    price: 80000,
    oldPrice: null,
    duration: "2 mois",
    description:
      "Apprends à concevoir des visuels publicitaires et à utiliser l'intelligence artificielle pour améliorer ta production.",
    skills: [
      "Création de visuels",
      "Affiches publicitaires",
      "Utilisation pratique de l'IA",
      "Réalisation d'un mini-portfolio",
    ],
  },
  {
    id: "sourcing-chine",
    title: "Sourcing en Chine",
    category: "Commerce et approvisionnement",
    image: "course-sourcing-chine.png",
    price: 50000,
    oldPrice: 80000,
    duration: "2 mois",
    description:
      "Découvre comment rechercher des produits, comparer les fournisseurs, estimer les coûts et préparer une commande.",
    skills: [
      "Recherche de produits",
      "Comparaison des fournisseurs",
      "Évaluation des risques",
      "Calcul des coûts d'approvisionnement",
    ],
  },
  {
    id: "excel",
    title: "Excel",
    category: "Bureautique et gestion",
    image: "course-excel.png",
    price: 80000,
    oldPrice: null,
    duration: "2 mois",
    description:
      "Développe tes compétences sur Excel pour organiser les données et réaliser des calculs utiles aux activités professionnelles.",
    skills: [
      "Tableaux et formules",
      "Organisation des données",
      "Calculs automatisés",
      "Exercices pratiques",
    ],
  },
  {
    id: "power-bi",
    title: "Power BI",
    category: "Analyse des données",
    image: "course-power-bi.png",
    price: 85000,
    oldPrice: 110000,
    duration: "2 mois",
    description:
      "Apprends à transformer des données en rapports visuels et en tableaux de bord pour faciliter la prise de décision.",
    skills: [
      "Importation des données",
      "Création de rapports",
      "Visualisations",
      "Tableaux de bord",
    ],
  },
  {
    id: "big-data",
    title: "Big Data",
    category: "Données et analyse",
    image: "course-big-data.png",
    price: 125000,
    oldPrice: null,
    duration: "2 mois",
    description:
      "Découvre les principes de l'analyse de grands volumes de données et leurs applications dans les organisations.",
    skills: [
      "Compréhension du Big Data",
      "Préparation des données",
      "Analyse des informations",
      "Applications professionnelles",
    ],
  },
];

/* =====================================================
   OUTILS UTILITAIRES
===================================================== */

/* Affichage des prix en FCFA */
function formatPrice(price) {
  if (price === null || price === undefined) {
    return "Prix à confirmer";
  }

  return `${Number(price).toLocaleString("fr-FR")} FCFA`;
}

/* Initiales pour les avatars sans photo */
function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "ED";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/* Vérification d'une erreur liée à une table absente */
function isMissingTableError(error) {
  if (!error) {
    return false;
  }

  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "PGRST204"
  );
     }

/* =====================================================
   BADGE DES RÔLES VÉRIFIÉS
===================================================== */

function VerifiedBadge({ role }) {
  if (!role || role === "client") {
    return null;
  }

  const label =
    role === "admin"
      ? "Administrateur"
      : role === "trainer"
      ? "Formatrice"
      : role;

  return (
    <span
      className="verified-badge"
      title={`Compte ${label}`}
      aria-label={`Compte ${label} vérifié`}
    >
      <span className="verified-badge-icon">✓</span>
      <span>{label}</span>
    </span>
  );
}

/* =====================================================
   AVATAR UTILISATEUR
===================================================== */

function UserAvatar({ user, size = "medium" }) {
  const name =
    user?.full_name ||
    user?.name ||
    user?.email ||
    "Utilisateur";

  const photo =
    user?.avatar_url ||
    user?.profile_photo ||
    user?.photo_url ||
    "";

  return (
    <div
      className={`user-avatar user-avatar-${size}`}
      title={name}
      aria-label={`Photo de profil de ${name}`}
    >
      {photo ? (
        <img src={photo} alt={`Portrait de ${name}`} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
/* =====================================================
   EN-TÊTE DU SITE
===================================================== */

function Header({
  user,
  profile,
  unreadNotifications = 0,
  onLogin,
  onRegister,
  onLogout,
  onNavigate,
  activePage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: "home", label: "Accueil" },
    { id: "services", label: "Nos services" },
    { id: "courses", label: "Formations" },
    { id: "news", label: "Actualités" },
    { id: "contact", label: "Contact" },
  ];

  function navigateTo(page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="brand-button"
          type="button"
          onClick={() => navigateTo("home")}
          aria-label="Retour à l'accueil"
        >
          <img
            className="brand-logo"
            src={image("logo-ed-b-center.png")}
            alt="Logo ED BUSINESS CENTER"
          />

          <span className="brand-text">
            <strong>ED BUSINESS CENTER</strong>
            <small>Apprendre, pratiquer, entreprendre !</small>
          </span>
        </button>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          className={`main-navigation ${
            menuOpen ? "navigation-open" : ""
          }`}
          aria-label="Navigation principale"
        >
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`navigation-link ${
                activePage === link.id ? "navigation-link-active" : ""
              }`}
              onClick={() => navigateTo(link.id)}
            >
              {link.label}
            </button>
          ))}

          {user ? (
            <>
              <button
                type="button"
                className={`navigation-link notification-nav ${
                  activePage === "notifications" ? "navigation-link-active" : ""
                }`}
                onClick={() => navigateTo("notifications")}
                aria-label={`Notifications, ${unreadNotifications} non lues`}
              >
                ♧ Notifications
                {unreadNotifications > 0 && (
                  <span className="notification-count">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                )}
              </button>
              <span className="header-points" title="Points gagnés sur les publications">★ {Number(profile?.points || 0)}</span>
              <button
                type="button"
                className={`navigation-link ${
                  activePage === "account" ? "navigation-link-active" : ""
                }`}
                onClick={() => navigateTo("account")}
              >
                Mon espace
              </button>

              <button
                type="button"
                className="button button-outline header-action"
                onClick={onLogout}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="header-auth-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setMenuOpen(false);
                  onLogin();
                }}
              >
                Connexion
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setMenuOpen(false);
                  onRegister();
                }}
              >
                Créer un compte
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/* =====================================================
   CARROUSEL DE MOTIVATION
===================================================== */

function MotivationCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((previous) =>
        (previous + 1) % MOTIVATION_IMAGES.length
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = MOTIVATION_IMAGES[currentIndex];

  function showPrevious() {
    setCurrentIndex(
      (previous) =>
        (previous - 1 + MOTIVATION_IMAGES.length) %
        MOTIVATION_IMAGES.length
    );
  }

  function showNext() {
    setCurrentIndex(
      (previous) => (previous + 1) % MOTIVATION_IMAGES.length
    );
  }

  return (
    <section
      className="motivation-carousel"
      aria-label="Motivation et entrepreneuriat"
    >
      <div className="motivation-image-wrapper">
        <img
          key={currentSlide.image}
          className="motivation-image"
          src={image(currentSlide.image)}
          alt={currentSlide.alt}
        />

        <div className="motivation-overlay">
          <span className="eyebrow">
            ED BUSINESS CENTER
          </span>

          <h2>{currentSlide.title}</h2>

          <p>{currentSlide.text}</p>

          <div className="motivation-actions">
            <a
              className="button button-light"
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              Parlons de ton projet
            </a>
          </div>
        </div>

        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={showPrevious}
          aria-label="Image précédente"
        >
          ‹
        </button>

        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={showNext}
          aria-label="Image suivante"
        >
          ›
        </button>

        <div
          className="carousel-indicators"
          aria-label="Choisir une image"
        >
          {MOTIVATION_IMAGES.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              className={`carousel-indicator ${
                index === currentIndex ? "indicator-active" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Afficher l'image ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
/* =====================================================
   SECTION DE PRÉSENTATION
===================================================== */

function IntroSection({ onNavigate, onRegister }) {
  return (
    <section className="intro-section section-container" id="intro">
      <div className="intro-content">
        <span className="eyebrow">
          BIENVENUE CHEZ ED B-CENTER
        </span>

        <h1>
          Développe tes compétences.
          <span> Transforme-les en opportunités.</span>
        </h1>

        <p className="intro-description">
          ED BUSINESS CENTER accompagne les personnes qui souhaitent
          apprendre des compétences pratiques, réaliser des projets
          concrets et explorer des possibilités professionnelles.
        </p>

        <p className="intro-description">
          Notre approche associe apprentissage, pratique et
          accompagnement pour t'aider à mieux préparer tes prochaines
          étapes.
        </p>

        <div className="intro-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => onNavigate("courses")}
          >
            Découvrir les formations
          </button>

          <button
            type="button"
            className="button button-outline"
            onClick={onRegister}
          >
            Rejoindre la communauté
          </button>
        </div>

        <div className="intro-highlights">
          <div className="intro-highlight">
            <span className="highlight-number">01</span>
            <span>
              <strong>Apprendre</strong>
              <small>Acquérir des compétences</small>
            </span>
          </div>

          <div className="intro-highlight">
            <span className="highlight-number">02</span>
            <span>
              <strong>Pratiquer</strong>
              <small>Réaliser des exercices concrets</small>
            </span>
          </div>

          <div className="intro-highlight">
            <span className="highlight-number">03</span>
            <span>
              <strong>Entreprendre</strong>
              <small>Préparer ses prochaines actions</small>
            </span>
          </div>
        </div>
      </div>

      <div className="intro-visual">
        <div className="intro-image-card">
          <img
            src={image("banniere-facebook-ed-b-center.png")}
            alt="Bannière officielle présentant ED BUSINESS CENTER et ses activités"
          />
        </div>

        <div className="intro-decoration" />
      </div>
    </section>
  );
}
/* =====================================================
   CARROUSEL DES SERVICES
===================================================== */

function ServicesSection({ onNavigate, onSelectService }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCount = 3;
  const maxIndex = Math.max(0, SERVICES.length - visibleCount);

  function showPrevious() {
    setCurrentIndex((previous) =>
      previous <= 0 ? maxIndex : previous - 1
    );
  }

  function showNext() {
    setCurrentIndex((previous) =>
      previous >= maxIndex ? 0 : previous + 1
    );
  }

  return (
    <section className="services-section section-container" id="services">
      <div className="section-heading">
        <span className="eyebrow">NOS DOMAINES D'ACTIVITÉ</span>

        <h2>
          Des services pour <span>faire avancer tes projets</span>
        </h2>

        <p>
          Découvre nos différents domaines d'intervention et identifie
          les services qui correspondent à tes besoins.
        </p>
      </div>

      <div className="services-carousel">
        <button
          type="button"
          className="section-carousel-arrow"
          onClick={showPrevious}
          aria-label="Services précédents"
        >
          ‹
        </button>

        <div className="services-track-window">
          <div
            className="services-track"
            style={{
              "--services-index": currentIndex,
              "--services-count": SERVICES.length,
            }}
          >
            {SERVICES.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-image-wrapper">
                  <img
                    src={image(service.image)}
                    alt={`${service.name} : ${service.description}`}
                    loading="lazy"
                  />

                  <span className="service-category">
                    {service.category}
                  </span>
                </div>

                <div className="service-card-content">
                  <h3>{service.name}</h3>

                  <p>{service.description}</p>

                  <ul className="service-details">
                    {service.details.slice(0, 3).map((detail) => (
                      <li key={detail}>
                        <span aria-hidden="true">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      if (onSelectService) {
                        onSelectService(service);
                      } else {
                        onNavigate("contact");
                      }
                    }}
                  >
                    En savoir plus <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="section-carousel-arrow"
          onClick={showNext}
          aria-label="Services suivants"
        >
          ›
        </button>
      </div>

      <div className="services-mobile-dots">
        {SERVICES.map((service, index) => (
          <button
            key={service.id}
            type="button"
            className={`services-dot ${
              index === currentIndex ? "services-dot-active" : ""
            }`}
            onClick={() => setCurrentIndex(Math.min(index, maxIndex))}
            aria-label={`Afficher les services à partir de ${service.name}`}
          />
        ))}
      </div>
    </section>
  );
}
/* =====================================================
   SECTION DES FORMATIONS
===================================================== */

function CoursesSection({ onRegister, onNavigate }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  const categories = [
    "Toutes",
    ...new Set(COURSES.map((course) => course.category)),
  ];

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "Toutes" ||
      course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="courses-section section-container" id="courses">
      <div className="section-heading">
        <span className="eyebrow">ED B-ACADEMY</span>

        <h2>
          Choisis une formation et <span>passe à la pratique</span>
        </h2>

        <p>
          Explore notre catalogue de formations. Les compétences sont
          abordées à travers des explications, des exercices et des
          réalisations pratiques.
        </p>
      </div>

      <div className="course-search-area">
        <label className="course-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Rechercher une formation"
          />
        </label>

        <label className="course-category-filter">
          <span className="visually-hidden">Catégorie de formation</span>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-image-wrapper">
                <img
                  src={image(course.image)}
                  alt={`Formation ${course.title} proposée par ED BUSINESS CENTER`}
                  loading="lazy"
                />

                <span className="course-duration">
                  {course.duration}
                </span>
              </div>

              <div className="course-card-content">
                <span className="course-category">
                  {course.category}
                </span>

                <h3>{course.title}</h3>

                <p>{course.description}</p>

                <div className="course-skills">
                  <strong>Ce que tu vas découvrir :</strong>

                  <ul>
                    {course.skills.map((skill) => (
                      <li key={skill}>
                        <span aria-hidden="true">✓</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="course-price-area">
                  <div className="course-price">
                    <strong>{formatPrice(course.price)}</strong>

                    {course.oldPrice && (
                      <del>{formatPrice(course.oldPrice)}</del>
                    )}
                  </div>

                  <button
                    type="button"
                    className="button button-primary course-register-button"
                    onClick={() => onRegister(course)}
                  >
                    M'inscrire
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            ⌕
          </span>

          <h3>Aucune formation trouvée</h3>

          <p>
            Essaie un autre mot-clé ou sélectionne une autre catégorie.
          </p>

          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setSearch("");
              setSelectedCategory("Toutes");
            }}
          >
            Réinitialiser la recherche
          </button>
        </div>
      )}

      <div className="courses-information">
        <div className="courses-information-icon" aria-hidden="true">
          ✦
        </div>

        <div>
          <h3>Apprendre, c'est aussi pratiquer</h3>

          <p>
            Notre objectif est de favoriser la mise en pratique des
            compétences. Les modalités précises de chaque session,
            les dates et les places disponibles doivent être confirmées
            auprès de notre équipe.
          </p>
        </div>

        <button
          type="button"
          className="button button-outline"
          onClick={() => onNavigate("contact")}
        >
          Poser une question
        </button>
      </div>
    </section>
  );
}
    /* =====================================================
   SECTION CONTACT
===================================================== */

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Demande d'information",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setStatus("Veuillez renseigner votre nom et votre message.");
      return;
    }

    const messageText = [
      "Bonjour ED BUSINESS CENTER,",
      "",
      `Nom : ${form.name}`,
      `E-mail : ${form.email || "Non renseigné"}`,
      `Téléphone : ${form.phone || "Non renseigné"}`,
      `Objet : ${form.subject}`,
      "",
      form.message,
    ].join("\n");

    const whatsappUrl =
      `${BRAND.whatsapp}?text=${encodeURIComponent(messageText)}`;

    setLoading(true);
    setStatus(
      "Votre message est prêt. WhatsApp va s'ouvrir pour vous permettre de l'envoyer."
    );

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setLoading(false);
  }

  return (
    <section className="contact-section section-container" id="contact">
      <div className="section-heading">
        <span className="eyebrow">RESTONS EN CONTACT</span>

        <h2>
          Parlons de <span>ton projet</span>
        </h2>

        <p>
          Tu souhaites suivre une formation, obtenir des informations
          sur un service ou discuter d'un projet ? Contacte notre équipe.
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-information">
          <div className="contact-brand">
            <img
              src={image("logo-ed-b-center.png")}
              alt="Logo ED BUSINESS CENTER"
            />

            <div>
              <h3>ED BUSINESS CENTER</h3>
              <p>Apprendre, pratiquer, entreprendre !</p>
            </div>
          </div>

          <p className="contact-intro">
            Nous privilégions une approche pratique et un échange
            clair afin de mieux comprendre tes besoins.
          </p>

          <div className="contact-detail">
            <span className="contact-detail-icon" aria-hidden="true">
              ✉
            </span>

            <div>
              <strong>E-mail</strong>
              <a href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
            </div>
          </div>

          <div className="contact-detail">
            <span className="contact-detail-icon" aria-hidden="true">
              ☎
            </span>

            <div>
              <strong>Téléphone</strong>
              <a href="tel:+237690418794">
                {BRAND.phone}
              </a>
            </div>
          </div>

          <a
            href={BRAND.whatsapp}
            className="button button-whatsapp"
            target="_blank"
            rel="noreferrer"
          >
            Contacter sur WhatsApp
          </a>

          <div className="contact-socials">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                title={social.description}
                aria-label={social.description}
              >
                <img
                  src={image(social.image)}
                  alt={social.name}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Envoie-nous un message</h3>

          <p>
            Complète le formulaire. Tu pourras ensuite envoyer ton
            message par WhatsApp.
          </p>

          <div className="form-field">
            <label htmlFor="contact-name">Nom complet *</label>

            <input
              id="contact-name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Ton nom complet"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="contact-email">Adresse e-mail</label>

              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="nom@exemple.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="contact-phone">Téléphone</label>

              <input
                id="contact-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="+237..."
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="contact-subject">Objet</label>

            <select
              id="contact-subject"
              name="subject"
              value={form.subject}
              onChange={updateField}
            >
              <option>Demande d'information</option>
              <option>Inscription à une formation</option>
              <option>Service de sourcing</option>
              <option>Communication digitale</option>
              <option>Photographie</option>
              <option>Partenariat</option>
              <option>Autre demande</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="contact-message">Ton message *</label>

            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={updateField}
              placeholder="Explique-nous ton besoin..."
              rows={5}
              required
            />
          </div>

          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Préparation..." : "Continuer sur WhatsApp"}
          </button>

          <small className="form-note">
            L'envoi final du message se fait dans WhatsApp.
          </small>
        </form>
      </div>
    </section>
  );
}

/* =====================================================
   FENÊTRE DE CONNEXION
===================================================== */

function LoginModal({ onClose, onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (data?.user) {
        await onLoginSuccess(data.user);
      }

      onClose();
    } catch (err) {
      setError(
        err?.message ||
          "Connexion impossible. Vérifie tes informations et réessaie."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          ×
        </button>

        <div className="auth-modal-brand">
          <img
            src={image("logo-ed-b-center.png")}
            alt="Logo ED BUSINESS CENTER"
          />
        </div>

        <span className="eyebrow">HEUREUX DE TE REVOIR</span>

        <h2 id="login-title">Connexion</h2>

        <p className="auth-description">
          Connecte-toi pour accéder à ton espace personnel.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">Adresse e-mail</label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@exemple.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Mot de passe</label>

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ton mot de passe"
              required
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Tu n'as pas encore de compte ?
          <button
            type="button"
            className="text-button"
            onClick={onSwitchToRegister}
          >
            Créer un compte
          </button>
        </p>
      </section>
    </div>
  );
}

/* =====================================================
   FENÊTRE DE CRÉATION DE COMPTE
===================================================== */

function RegisterModal({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
  selectedCourse,
}) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    sex: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
         setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
              sex: form.sex,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user && data.session) {
        await onRegisterSuccess(data.user, {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          sex: form.sex,
        });

        setSuccess("Ton compte a été créé avec succès.");

        window.setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setSuccess(
          "Ton inscription a été enregistrée. Consulte ta boîte e-mail pour confirmer ton adresse avant de te connecter."
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "La création du compte a échoué. Réessaie dans quelques instants."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="auth-modal register-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          ×
        </button>

        <div className="auth-modal-brand">
          <img
            src={image("logo-ed-b-center.png")}
            alt="Logo ED BUSINESS CENTER"
          />
        </div>

        <span className="eyebrow">REJOINS NOTRE COMMUNAUTÉ</span>

        <h2 id="register-title">Créer un compte</h2>

        <p className="auth-description">
          Crée ton espace personnel pour suivre tes démarches et tes
          formations.
        </p>

        {selectedCourse && (
          <div className="selected-course-notice">
            <strong>Formation sélectionnée :</strong>
            <span>{selectedCourse.title}</span>
            <span>{formatPrice(selectedCourse.price)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="register-name">Nom complet</label>

            <input
              id="register-name"
              name="full_name"
              type="text"
              autoComplete="name"
              value={form.full_name}
              onChange={updateField}
              placeholder="Ton nom complet"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-email">Adresse e-mail</label>

            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              placeholder="nom@exemple.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="register-phone">Téléphone</label>

              <input
                id="register-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={updateField}
                placeholder="+237..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-sex">Sexe</label>

              <select
                id="register-sex"
                name="sex"
                value={form.sex}
                onChange={updateField}
              >
                <option value="">Non précisé</option>
                <option value="F">Féminin</option>
                <option value="M">Masculin</option>
                <option value="other">Autre</option>
                <option value="prefer_not_to_say">
                  Je préfère ne pas préciser
                </option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="register-password">Mot de passe</label>

            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={updateField}
              placeholder="6 caractères minimum"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="register-confirm-password">
              Confirmer le mot de passe
            </label>

            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField}
              placeholder="Saisis à nouveau ton mot de passe"
              required
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>

          <small className="form-note">
            Ton compte doit être créé et confirmé selon les paramètres
            d'authentification de Supabase.
          </small>
        </form>

        <p className="auth-switch">
          Tu as déjà un compte ?
          <button
            type="button"
            className="text-button"
            onClick={onSwitchToLogin}
          >
            Se connecter
          </button>
        </p>
      </section>
    </div>
  );
}

/* =====================================================
   ESPACE PERSONNEL
===================================================== */

function AccountSection({
  user,
  profile,
  role,
  onNavigate,
  onLogout,
  onEditProfile,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Utilisateur";

  const points = Number(profile?.points || 0);

  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "trainer"
      ? "Formatrice"
      : "Membre";

  return (
    <section className="account-section section-container">
      <div className="account-welcome">
        <div className="account-welcome-content">
          <span className="eyebrow">ESPACE PERSONNEL</span>

          <h1>
            Bienvenue, <span>{displayName}</span>
          </h1>

          <p>
            Retrouve ici les informations de ton compte et les
            fonctionnalités disponibles selon ton profil.
          </p>
        </div>

        <UserAvatar
          user={{ ...profile, ...user, full_name: displayName }}
          size="large"
        />
      </div>

      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-profile-card">
            <UserAvatar
              user={{ ...profile, ...user, full_name: displayName }}
              size="large"
            />

            <h3>{displayName}</h3>

            <p>{user?.email}</p>

            <VerifiedBadge role={role} />

            <span className="account-role-label">
              {roleLabel}
            </span>
          </div>

          <nav
            className="account-navigation"
            aria-label="Menu personnel"
          >
            <button
              type="button"
              className={
                activeTab === "overview" ? "account-nav-active" : ""
              }
              onClick={() => setActiveTab("overview")}
            >
              <span aria-hidden="true">⌂</span>
              Vue d'ensemble
            </button>

            <button
              type="button"
              className={
                activeTab === "profile" ? "account-nav-active" : ""
              }
              onClick={() => setActiveTab("profile")}
            >
              <span aria-hidden="true">◉</span>
              Mon profil
            </button>

            <button
              type="button"
              className={
                activeTab === "courses" ? "account-nav-active" : ""
              }
              onClick={() => setActiveTab("courses")}
            >
              <span aria-hidden="true">▤</span>
              Formations
            </button>

            <button
              type="button"
              className={
                activeTab === "messages" ? "account-nav-active" : ""
              }
              onClick={() => setActiveTab("messages")}
            >
              <span aria-hidden="true">✉</span>
              Messagerie
            </button>

            {role === "admin" && (
              <button
                type="button"
                className={
                  activeTab === "admin" ? "account-nav-active" : ""
                }
                onClick={() => setActiveTab("admin")}
              >
                <span aria-hidden="true">⚙</span>
                Administration
              </button>
            )}
          </nav>

          <button
            type="button"
            className="account-logout-button"
            onClick={onLogout}
          >
            ↪ Déconnexion
          </button>
        </aside>

        <div className="account-main">
          {activeTab === "overview" && (
            <div className="account-tab-content">
              <div className="account-section-title">
                <div>
                  <span className="eyebrow">TABLEAU DE BORD</span>
                  <h2>Vue d'ensemble</h2>
                </div>

                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => onNavigate("home")}
                >
                  Retour à l'accueil
                </button>
              </div>

              <div className="account-stat-grid">
                <article className="account-stat-card">
                  <span className="account-stat-icon">★</span>
                  <div>
                    <span className="account-stat-label">
                      Mes points
                    </span>
                    <strong className="points-bubble">{points}</strong>
                  </div>
                </article>

                <article className="account-stat-card">
                  <span className="account-stat-icon">▤</span>
                  <div>
                    <span className="account-stat-label">
                      Formations
                    </span>
                    <strong>Découvrir</strong>
                  </div>
                </article>

                <article className="account-stat-card">
                  <span className="account-stat-icon">✉</span>
                  <div>
                    <span className="account-stat-label">
                      Messagerie
                    </span>
                    <strong>Mes messages</strong>
                  </div>
                </article>
              </div>

              <div className="account-content-card">
                <h3>Bienvenue dans ton espace</h3>

                <p>
                  Tu peux consulter les formations proposées par
                  ED B-CENTER, mettre à jour tes informations et
                  contacter notre équipe.
                </p>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onNavigate("courses")}
                >
                  Explorer les formations
                </button>
              </div>

              {role === "admin" && (
                <div className="account-content-card admin-highlight">
                  <span className="eyebrow">ESPACE ADMINISTRATEUR</span>

                  <h3>Gestion de la plateforme</h3>

                  <p>
                    Ton compte possède le rôle administrateur reconnu
                    par le système. Les fonctions de gestion avancée
                    seront activées selon la configuration de la base
                    de données.
                  </p>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setActiveTab("admin")}
                  >
                    Ouvrir l'administration
                  </button>
                </div>
              )}
            </div>
          )}
                     {activeTab === "profile" && (
            <div className="account-tab-content">
              <div className="account-section-title">
                <div>
                  <span className="eyebrow">MES INFORMATIONS</span>
                  <h2>Mon profil</h2>
                </div>
              </div>

              <div className="account-content-card profile-details-card">
                <div className="profile-detail-row">
                  <span>Nom complet</span>
                  <strong>{displayName}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Adresse e-mail</span>
                  <strong>{user?.email || "Non renseignée"}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Téléphone</span>
                  <strong>
                    {profile?.phone ||
                      user?.user_metadata?.phone ||
                      "Non renseigné"}
                  </strong>
                </div>

                <div className="profile-detail-row">
                  <span>Rôle</span>
                  <strong>{roleLabel}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Points</span>
                  <strong>{points}</strong>
                </div>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={onEditProfile}
                >
                  Modifier mon profil
                </button>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="account-tab-content">
              <div className="account-section-title">
                <div>
                  <span className="eyebrow">APPRENTISSAGE</span>
                  <h2>Les formations</h2>
                </div>
              </div>

              <div className="account-content-card">
                <h3>Développe tes compétences</h3>

                <p>
                  Consulte les formations disponibles et contacte
                  l'équipe pour connaître les modalités d'inscription,
                  les dates et les places disponibles.
                </p>

                <div className="account-course-list">
                  {COURSES.map((course) => (
                    <div className="account-course-item" key={course.id}>
                      <img
                        src={image(course.image)}
                        alt={`Illustration de ${course.title}`}
                        loading="lazy"
                      />

                      <div>
                        <strong>{course.title}</strong>
                        <span>{course.duration}</span>
                      </div>

                      <strong>{formatPrice(course.price)}</strong>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onNavigate("courses")}
                >
                  Voir le catalogue
                </button>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="account-tab-content">
              <div className="account-section-title">
                <div>
                  <span className="eyebrow">COMMUNICATION</span>
                  <h2>Ma messagerie</h2>
                </div>
              </div>

              <div className="account-content-card">
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    ✉
                  </span>

                  <h3>Ta messagerie personnelle</h3>

                  <p>
                    L'affichage des messages privés nécessite une table
                    de messagerie configurée dans Supabase.
                  </p>

                  <a
                    className="button button-primary"
                    href={BRAND.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contacter l'équipe sur WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === "admin" && role === "admin" && (
            <div className="account-tab-content">
              <div className="account-section-title">
                <div>
                  <span className="eyebrow">GESTION DE LA PLATEFORME</span>
                  <h2>Administration</h2>
                </div>
              </div>

              <div className="account-content-card admin-highlight">
                <h3>Bienvenue dans l'administration</h3>

                <p>
                  Cet espace est réservé aux comptes dont le rôle
                  administrateur est attribué dans la base de données.
                </p>

                <p>
                  Les fonctions de publication, de gestion des comptes,
                  de messagerie et de suivi des formations nécessitent
                  leur configuration côté Supabase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   MODIFICATION DU PROFIL
===================================================== */

function EditProfileModal({ user, profile, onClose, onSave }) {
  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || ""
  );

  const [phone, setPhone] = useState(
    profile?.phone || user?.user_metadata?.phone || ""
  );

  const [photoFile, setPhotoFile] = useState(null);

  const [preview, setPreview] = useState(
    profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      profile?.profile_photo ||
      ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!photoFile) return;

    const objectUrl = URL.createObjectURL(photoFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Veuillez renseigner votre nom complet.");
      return;
    }

    setLoading(true);

    try {
      await onSave({
        full_name: fullName.trim(),
        phone: phone.trim(),
        photoFile,
      });

      onClose();
    } catch (err) {
      setError(err.message || "Impossible d'enregistrer le profil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>

        <h2>Modifier mon profil</h2>
        <p>Actualisez vos informations personnelles.</p>

        <form onSubmit={handleSubmit}>
          <div className="profile-photo-editor">
            {preview ? (
              <img
                src={preview}
                alt="Aperçu de la photo de profil"
                className="profile-photo-preview"
              />
            ) : (
              <div className="profile-photo-placeholder">
                {getInitials(fullName)}
              </div>
            )}

            <label className="photo-upload-button">
              Ajouter une photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    setError("Veuillez sélectionner une image.");
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    setError("La photo ne doit pas dépasser 5 Mo.");
                    return;
                  }

                  setError("");
                  setPhotoFile(file);
                }}
              />
            </label>
          </div>

          <label className="form-label">
            Nom complet
            <input
              type="text"
              name="full_name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Téléphone
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
 }
/* =====================================================
   APPLICATION PRINCIPALE
===================================================== */

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState("client");

  const [activePage, setActivePage] = useState("home");
  const [authModal, setAuthModal] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [notification, setNotification] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  /* Notifications */
  function notify(message) {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 4000);
  }

  /* Chargement du profil utilisateur */
  async function loadUserData(currentUser) {
    if (!currentUser) {
      setProfile(null);
      setRole("client");
      return;
    }

    let currentProfile = {
      id: currentUser.id,
      full_name: currentUser.user_metadata?.full_name || "",
      phone: currentUser.user_metadata?.phone || "",
      sex: currentUser.user_metadata?.sex || "",
      avatar_url: currentUser.user_metadata?.avatar_url || "",
      points: 0,
    };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        if (!isMissingTableError(error)) {
          console.error("Erreur de chargement du profil :", error.message);
        }
      } else if (data) {
        currentProfile = {
          ...currentProfile,
          ...data,
        };
      }
    } catch (error) {
      console.error("Chargement du profil :", error.message);
    }

    setProfile(currentProfile);

    /* Récupération du rôle */
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!error && data?.role) {
        setRole(data.role);
      } else {
        setRole("client");
      }
    } catch {
      setRole("client");
    }
  }

  /* Compteur de notifications en temps réel pour le compte connecté */
  useEffect(() => {
    if (!user?.id) {
      setUnreadNotifications(0);
      return undefined;
    }

    let active = true;
    async function refreshUnread() {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (!error && active) setUnreadNotifications(count || 0);
    }
    refreshUnread();
    const channel = supabase
      .channel(`notification-count-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, refreshUnread)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* Initialisation de l'application */
  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        const currentUser = data.session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          await loadUserData(currentUser);
        }
      } catch (error) {
        console.error(
          "Erreur d'initialisation :",
          error.message
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeApp();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;

      setUser(currentUser);

      if (currentUser) {
        window.setTimeout(() => {
          if (mounted) {
            loadUserData(currentUser);
          }
        }, 0);
      } else {
        setProfile(null);
        setRole("client");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* Navigation */
  function navigateTo(page) {
    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* Ouverture de la connexion */
  function openLogin() {
    setAuthModal("login");
  }

  /* Ouverture de l'inscription */
  function openRegister(course = null) {
    setSelectedCourse(course);
    setAuthModal("register");
  }

  /* Connexion réussie */
  async function handleLoginSuccess(loggedInUser) {
    setUser(loggedInUser);

    await loadUserData(loggedInUser);

    setAuthModal(null);

    notify("Connexion réussie. Bienvenue chez ED B-CENTER !");
  }

  /* Inscription réussie */
  async function handleRegisterSuccess(newUser, newProfile) {
    setUser(newUser);

    try {
      const profileData = {
        id: newUser.id,
        full_name: newProfile.full_name,
        phone: newProfile.phone,
        sex: newProfile.sex,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
        });

      if (error && !isMissingTableError(error)) {
        console.error(
          "Enregistrement du profil :",
          error.message
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création du profil :",
        error.message
      );
    }

    await loadUserData(newUser);

    notify("Ton compte a été créé.");
  }

  /* Déconnexion */
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfile(null);
      setRole("client");
      setAuthModal(null);
      setEditProfileOpen(false);

      navigateTo("home");

      notify("Tu es maintenant déconnecté.");
    } catch (error) {
      notify(
        error.message || "La déconnexion a échoué."
      );
    }
  }

  /* Enregistrement des modifications du profil */
  async function handleSaveProfile({
    full_name,
    phone,
    photoFile,
  }) {
    if (!user) {
      throw new Error("Tu dois être connecté.");
    }

    let avatarUrl =
      profile?.avatar_url ||
      profile?.profile_photo ||
      user.user_metadata?.avatar_url ||
      "";

    /*
      Le téléversement de la photo nécessite un bucket
      Storage configuré dans Supabase.
    */
    if (photoFile) {
      const extension =
        photoFile.name.split(".").pop() || "jpg";

      const filePath =
        `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, photoFile, {
          upsert: true,
          contentType: photoFile.type,
        });

      if (uploadError) {
        throw new Error(
          "Impossible d'envoyer la photo. Vérifie la configuration du stockage Supabase."
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatarUrl = publicUrlData.publicUrl;
    }

    const updatedProfile = {
      id: user.id,
      full_name,
      phone,
      avatar_url: avatarUrl,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(updatedProfile, {
        onConflict: "id",
      });

    if (profileError) {
      throw new Error(
        "Impossible d'enregistrer les informations du profil : " +
          profileError.message
      );
    }

    const { error: metadataError } =
      await supabase.auth.updateUser({
        data: {
          full_name,
          phone,
          avatar_url: avatarUrl,
        },
      });

    if (metadataError) {
      console.error(
        "Mise à jour des informations du compte :",
        metadataError.message
      );
    }

    await loadUserData({
      ...user,
      user_metadata: {
        ...user.user_metadata,
        full_name,
        phone,
        avatar_url: avatarUrl,
      },
    });

    notify("Ton profil a été mis à jour.");
  }

  /* Sélection d'un service */
  function handleSelectService(service) {
    setSelectedService(service);
    navigateTo("contact");
  }

  /* Affichage du chargement */
  if (loading) {
    return (
      <div className="app-loading">
        <img
          src={image("logo-ed-b-center.png")}
          alt="Logo ED BUSINESS CENTER"
        />

        <p>Chargement de ED BUSINESS CENTER...</p>
      </div>
    );
  }

  /* Interface principale */
  return (
    <div className="app">
      <Header
        user={user}
        profile={profile}
        unreadNotifications={unreadNotifications}
        onLogin={openLogin}
        onRegister={() => openRegister()}
        onLogout={handleLogout}
        onNavigate={navigateTo}
        activePage={activePage}
      />

      <main>
        {activePage === "home" && (
          <>
            <MotivationCarousel />

            <IntroSection
              onNavigate={navigateTo}
              onRegister={() => openRegister()}
            />

            <ServicesSection
              onNavigate={navigateTo}
              onSelectService={handleSelectService}
            />

            <CoursesSection
              onRegister={openRegister}
              onNavigate={navigateTo}
            />

            <ContactSection />
          </>
        )}

        {activePage === "news" && (
          <CommunitySection
            user={user}
            profile={profile}
            onNotify={notify}
            onPointsUpdated={(nextPoints) => setProfile((previous) => previous ? { ...previous, points: nextPoints } : previous)}
          />
        )}

        {activePage === "notifications" && user && (
          <NotificationsSection user={user} onNotify={notify} />
        )}

        {activePage === "services" && (
          <ServicesSection
            onNavigate={navigateTo}
            onSelectService={handleSelectService}
          />
        )}

        {activePage === "courses" && (
          <CoursesSection
            onRegister={openRegister}
            onNavigate={navigateTo}
          />
        )}

        {activePage === "contact" && (
          <>
            {selectedService && (
              <div className="selected-service-notice section-container">
                <h2>{selectedService.name}</h2>

                <p>{selectedService.description}</p>

                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setSelectedService(null)}
                >
                  Fermer
                </button>
              </div>
            )}

            <ContactSection />
          </>
        )}

        {activePage === "account" && (
          user ? (
            <AccountSection
              user={user}
              profile={profile}
              role={role}
              onNavigate={navigateTo}
              onLogout={handleLogout}
              onEditProfile={() => setEditProfileOpen(true)}
            />
          ) : (
            <section className="account-access-denied section-container">
              <h2>Connecte-toi à ton espace</h2>

              <p>
                Tu dois être connecté pour accéder à ton espace personnel.
              </p>

              <button
                type="button"
                className="button button-primary"
                onClick={openLogin}
              >
                Se connecter
              </button>

              <button
                type="button"
                className="button button-outline"
                onClick={() => openRegister()}
              >
                Créer un compte
              </button>
            </section>
          )
        )}
      </main>

      {/* Pied de page */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img
              src={image("logo-ed-b-center.png")}
              alt="Logo ED BUSINESS CENTER"
            />

            <h3>{BRAND.name}</h3>

            <p>{BRAND.slogan}</p>
          </div>

          <div className="footer-links">
            <button
              type="button"
              onClick={() => navigateTo("home")}
            >
              Accueil
            </button>

            <button
              type="button"
              onClick={() => navigateTo("services")}
            >
              Services
            </button>

            <button
              type="button"
              onClick={() => navigateTo("courses")}
            >
              Formations
            </button>
            <button type="button" onClick={() => navigateTo("news")}>Actualités</button>

            <button
              type="button"
              onClick={() => navigateTo("contact")}
            >
              Contact
            </button>
          </div>

          <div className="footer-socials">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.description}
                title={social.name}
              >
                <img
                  src={image(social.image)}
                  alt={social.name}
                  loading="lazy"
                />
              </a>
            ))}
          </div>

          <p className="footer-copyright">
            © {new Date().getFullYear()} ED BUSINESS CENTER.
            Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Fenêtre de connexion */}
      {authModal === "login" && (
        <LoginModal
          onClose={() => setAuthModal(null)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthModal("register")}
        />
      )}

      {/* Fenêtre d'inscription */}
      {authModal === "register" && (
        <RegisterModal
          onClose={() => {
            setAuthModal(null);
            setSelectedCourse(null);
          }}
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthModal("login")}
          selectedCourse={selectedCourse}
        />
      )}

      {/* Modification du profil */}
      {editProfileOpen && user && (
        <EditProfileModal
          user={user}
          profile={profile}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className="app-notification" role="status">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;
