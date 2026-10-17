import { useState } from 'react';
import {
  GraduationCap,
  Palette,
  Globe,
  BriefcaseBusiness,
  Lightbulb,
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Users,
  Sparkles,
  Mail,
} from 'lucide-react';

const services = [
  {
    icon: GraduationCap,
    title: 'ED B-ACADEMY',
    description:
      'Des formations pratiques en infographie, intelligence artificielle, sourcing et outils professionnels.',
    tag: 'Formation',
  },
  {
    icon: Palette,
    title: 'ED DIGITAL AGENCY',
    description:
      'Création de visuels publicitaires, affiches, identité visuelle et supports de communication.',
    tag: 'Créativité',
  },
  {
    icon: ShoppingBag,
    title: 'ED B-SOURCING',
    description:
      'Recherche de produits, comparaison de fournisseurs et accompagnement des commandes.',
    tag: 'Approvisionnement',
  },
  {
    icon: BriefcaseBusiness,
    title: 'ED B-CONSULTING',
    description:
      'Un accompagnement pratique pour structurer vos idées et développer vos activités.',
    tag: 'Conseil',
  },
  {
    icon: Lightbulb,
    title: 'ED B-SOLUTION',
    description:
      'Des solutions numériques adaptées aux besoins des entrepreneurs et des entreprises.',
    tag: 'Solutions',
  },
];

const features = [
  'Des compétences orientées vers la pratique',
  'Des services adaptés aux entrepreneurs',
  'Un accompagnement humain et progressif',
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#accueil" onClick={closeMenu}>
          <span className="brand-mark">ED</span>
          <span className="brand-text">
            <strong>ED B-CENTER</strong>
            <small>APPRENDRE · PRATIQUER · ENTREPRENDRE</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={menuOpen ? 'navigation navigation-open' : 'navigation'}>
          <a href="#accueil" onClick={closeMenu}>Accueil</a>
          <a href="#services" onClick={closeMenu}>Nos services</a>
          <a href="#apropos" onClick={closeMenu}>À propos</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a
            className="nav-cta"
            href="https://wa.me/237690418794"
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            Nous contacter <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-content">
            <span className="eyebrow">
              <Sparkles size={15} /> VOTRE PARTENAIRE DE DÉVELOPPEMENT
            </span>

            <h1>
              Transformez vos <span>compétences</span> en opportunités.
            </h1>

            <p className="hero-description">
              ED B-CENTER accompagne les apprenants, les entrepreneurs et les
              entreprises grâce à la formation pratique, aux services
              numériques et à la recherche de produits.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#services">
                Découvrir nos services <ArrowRight size={18} />
              </a>
              <a
                className="button button-secondary"
                href="https://wa.me/237690418794"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> Parler à notre équipe
              </a>
            </div>

            <div className="hero-trust">
              <span><CheckCircle2 size={17} /> Approche pratique</span>
              <span><CheckCircle2 size={17} /> Accompagnement humain</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Présentation des activités ED B-CENTER">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-center">
              <span className="visual-logo">ED</span>
              <strong>B-CENTER</strong>
              <small>INNOVER · APPRENDRE · GRANDIR</small>
            </div>

            <div className="floating-card card-top">
              <span className="floating-icon icon-cyan"><GraduationCap size={21} /></span>
              <span><strong>Formation</strong><small>Apprendre par la pratique</small></span>
            </div>

            <div className="floating-card card-right">
              <span className="floating-icon icon-purple"><Globe size={21} /></span>
              <span><strong>Sourcing</strong><small>Rechercher des produits</small></span>
            </div>

            <div className="floating-card card-bottom">
              <span className="floating-icon icon-orange"><Palette size={21} /></span>
              <span><strong>Créativité</strong><small>Créer et communiquer</small></span>
            </div>
          </div>
        </section>

        <section className="value-strip" aria-label="Nos engagements">
          {features.map((feature) => (
            <div className="value-item" key={feature}>
              <CheckCircle2 size={19} />
              <span>{feature}</span>
            </div>
          ))}
        </section>

        <section className="services-section section-padding" id="services">
          <div className="section-heading">
            <span className="eyebrow">NOS DOMAINES D'INTERVENTION</span>
            <h2>Des services conçus pour <span>vous faire avancer.</span></h2>
            <p>
              Découvrez les différentes branches de ED B-CENTER et trouvez
              l'accompagnement correspondant à votre besoin.
            </p>
          </div>

          <div className="services-grid">
            {services.map(({ icon: Icon, title, description, tag }, index) => (
              <article className="service-card" key={title}>
                <div className={`service-icon service-icon-${index + 1}`}>
                  <Icon size={25} strokeWidth={1.8} />
                </div>
                <span className="service-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#contact" className="service-link">
                  En savoir plus <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section section-padding" id="apropos">
          <div className="about-decoration">
            <div className="about-number">ED<span>.</span></div>
            <div className="about-note">
              <Users size={20} />
              <span>Apprendre ensemble.<br />Progresser concrètement.</span>
            </div>
          </div>

          <div className="about-content">
            <span className="eyebrow">QUI SOMMES-NOUS ?</span>
            <h2>Une vision tournée vers la <span>pratique.</span></h2>
            <p>
              ED B-CENTER est un espace de développement de compétences et de
              services destiné aux personnes qui souhaitent apprendre,
              pratiquer et construire des opportunités professionnelles.
            </p>
            <p>
              Notre approche privilégie les exercices concrets, les projets
              applicables et l'accompagnement, afin de rapprocher les
              compétences des besoins du terrain.
            </p>
            <a className="button button-primary" href="#contact">
              Échangeons sur votre projet <ArrowRight size={18} />
            </a>
          </div>
        </section>

        <section className="contact-section section-padding" id="contact">
          <div className="contact-panel">
            <div>
              <span className="eyebrow">PASSAGE À L'ACTION</span>
              <h2>Parlons de votre <span>projet.</span></h2>
              <p>
                Besoin d'une formation, d'un visuel ou d'un accompagnement ?
                Notre équipe est disponible pour échanger avec vous.
              </p>
            </div>
            <div className="contact-actions">
              <a
                className="button button-light"
                href="https://wa.me/237690418794"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
              <a
                className="button button-outline-light"
                href="mailto:edbusinesscenter@gmail.com"
              >
                <Mail size={18} /> Envoyer un e-mail
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#accueil">ED B-CENTER<span>.</span></a>
        <p>Apprendre · Pratiquer · Entreprendre</p>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#apropos">À propos</a>
          <a href="#contact">Contact</a>
        </div>
        <small>© {new Date().getFullYear()} ED B-CENTER. Tous droits réservés.</small>
      </footer>
    </div>
  );
            }
