import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Palette,
  Globe,
  BriefcaseBusiness,
  Lightbulb,
  LoaderCircle,
  Mail,
  LockKeyhole,
  UserRound,
  CheckCircle2,
  LogOut,
  Headphones,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from './supabaseClient';

const services = [
  {
    name: 'ED B-ACADEMY',
    description: 'Des formations pratiques pour apprendre, pratiquer et entreprendre.',
    detail: 'Infographie, intelligence artificielle, sourcing et outils de gestion.',
    icon: GraduationCap,
  },
  {
    name: 'ED DIGITAL AGENCY',
    description: 'Développez une image professionnelle et attirez vos clients.',
    detail: 'Création graphique, identité visuelle et communication digitale.',
    icon: Palette,
  },
  {
    name: 'ED B-SOURCING',
    description: 'Recherchez des produits et préparez vos approvisionnements.',
    detail: 'Recherche, comparaison, sourcing Chine et précommandes.',
    icon: Globe,
  },
  {
    name: 'ED B-CONSULTING',
    description: 'Structurez vos idées et avancez avec une méthode claire.',
    detail: 'Conseils pratiques pour les entrepreneurs et porteurs de projets.',
    icon: BriefcaseBusiness,
  },
  {
    name: 'ED B-SOLUTION',
    description: 'Des solutions numériques adaptées à vos besoins.',
    detail: 'Outils digitaux et accompagnement vers des méthodes plus efficaces.',
    icon: Lightbulb,
  },
];

function Wave({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 180"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,70 C260,180 440,10 720,70 S1160,160 1440,35 L1440,180 L0,180 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark"><BookOpen size={25} strokeWidth={2.2} /></div>
      <div>
        <strong>ED B-CENTER</strong>
        <span>APPRENDRE · PRATIQUER · ENTREPRENDRE</span>
      </div>
    </div>
  );
}

function Splash({ onStart }) {
  return (
    <main className="splash-screen">
      <Wave className="splash-wave splash-wave-top" />
      <div className="splash-brand"><Brand light /></div>

      <div className="splash-center">
        <div className="splash-book">
          <BookOpen size={82} strokeWidth={1.5} />
          <span className="book-line book-line-one" />
          <span className="book-line book-line-two" />
        </div>
        <div className="splash-sparkle"><Sparkles size={24} /></div>
      </div>

      <Wave className="splash-wave splash-wave-bottom" />

      <section className="splash-card">
        <div className="eyebrow">TON AVENIR COMMENCE ICI</div>
        <h1>Apprends aujourd’hui.<br /><span>Construis demain.</span></h1>
        <p>Des compétences pratiques, des outils numériques et un accompagnement pour passer à l’action.</p>
        <button className="primary-button" onClick={onStart}>
          Commencer <ArrowRight size={19} />
        </button>
        <div className="splash-dots"><i /><i /><i /></div>
      </section>
    </main>
  );
}

function AuthScreen({ mode, setMode, onBack, onAuthenticated }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (isSignup && fullName.trim().length < 2) {
      setError('Entre ton nom complet pour continuer.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'client',
            },
          },
        });

        if (authError) throw authError;

        if (data.session) {
          onAuthenticated(data.session);
        } else {
          setMessage(
            'Compte créé ! Consulte ta boîte mail pour confirmer ton adresse avant de te connecter.'
          );
          setMode('login');
        }
      } else {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;
        onAuthenticated(data.session);
      }
    } catch (err) {
      setError(
        err?.message === 'Invalid login credentials'
          ? 'Adresse e-mail ou mot de passe incorrect.'
          : err?.message || 'Une erreur est survenue. Réessaie.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <header className="auth-header">
        <button className="round-back" onClick={onBack} aria-label="Retour">
          <ArrowLeft size={21} />
        </button>
        <Brand light />
        <div className="auth-header-copy">
          <div className="eyebrow">BIENVENUE CHEZ ED B-CENTER</div>
          <h1>{isSignup ? 'Créer un compte' : 'Heureux de te revoir !'}</h1>
          <p>{isSignup ? 'Prépare-toi à apprendre et à progresser.' : 'Connecte-toi pour continuer ton parcours.'}</p>
        </div>
        <Wave className="auth-wave" />
      </header>

      <section className="auth-card">
        <div className="auth-illustration">
          <div className="illustration-orbit orbit-one" />
          <div className="illustration-orbit orbit-two" />
          <div className="illustration-book"><BookOpen size={54} /></div>
          <div className="illustration-cap"><GraduationCap size={33} /></div>
          <div className="illustration-sparkle"><Sparkles size={22} /></div>
          <div className="illustration-label">APPRENDRE • CRÉER • ÉVOLUER</div>
        </div>

        <div className="auth-form-heading">
          <h2>{isSignup ? 'Rejoins la communauté' : 'Connexion'}</h2>
          <p>{isSignup ? 'Quelques informations pour commencer.' : 'Entre tes identifiants pour accéder à ton espace.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <label className="field">
              <span>Nom complet</span>
              <div className="input-wrap">
                <UserRound size={19} />
                <input
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex. Jean Dupont"
                  required
                />
                {fullName.trim().length >= 2 && <CheckCircle2 className="valid-icon" size={18} />}
              </div>
            </label>
          )}

          <label className="field">
            <span>Adresse e-mail</span>
            <div className="input-wrap">
              <Mail size={19} />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
              />
              {email.includes('@') && email.includes('.') && <CheckCircle2 className="valid-icon" size={18} />}
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-wrap">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                minLength={6}
                required
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <div className="form-message form-error" role="alert">{error}</div>}
          {message && <div className="form-message form-success" role="status">{message}</div>}

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={19} /> : null}
            {loading ? 'Patiente…' : isSignup ? 'Créer mon compte' : 'Me connecter'}
            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <div className="auth-switch">
          {isSignup ? 'Tu as déjà un compte ?' : 'Nouveau ici ?'}
          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
              setMode(isSignup ? 'login' : 'signup');
            }}
          >
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </div>

        <p className="auth-legal">
          En continuant, tu acceptes d’utiliser ED B-CENTER de manière responsable.
        </p>
      </section>
    </main>
  );
}

function ServiceCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = { current: 0 };

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % services.length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [paused]);

  function changeSlide(direction) {
    setActive((current) => (current + direction + services.length) % services.length);
    setPaused(true);
  }

  return (
    <section className="services-section" id="services">
      <div className="section-heading">
        <div>
          <div className="eyebrow">DÉCOUVRE NOS ACTIVITÉS</div>
          <h2>Nos services</h2>
          <p>Des solutions pour apprendre, créer et entreprendre.</p>
        </div>
        <div className="carousel-controls">
          <button onClick={() => changeSlide(-1)} aria-label="Service précédent"><ArrowLeft size={18} /></button>
          <button onClick={() => changeSlide(1)} aria-label="Service suivant"><ArrowRight size={18} /></button>
        </div>
      </div>

      <div
        className="service-carousel"
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const distance = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(distance) > 45) changeSlide(distance < 0 ? 1 : -1);
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {services.map((service, index) => {
          const Icon = service.icon;
          const offset = (index - active + services.length) % services.length;
          const relativeOffset = offset > services.length / 2 ? offset - services.length : offset;
          return (
            <article
              key={service.name}
              className={`service-card ${index === active ? 'is-active' : ''} ${Math.abs(relativeOffset) === 1 ? 'is-near' : ''}`}
              style={{ '--card-offset': relativeOffset }}
              onClick={() => {
                setActive(index);
                setPaused(true);
              }}
            >
              <div className="service-icon"><Icon size={28} /></div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-detail">{service.detail}</div>
              <button className="service-link" onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:edbusinesscenter@gmail.com?subject=${encodeURIComponent(service.name)}`;
              }}>
                En savoir plus <ArrowRight size={17} />
              </button>
            </article>
          );
        })}
      </div>

      <div className="carousel-dots" aria-label="Choisir un service">
        {services.map((service, index) => (
          <button
            key={service.name}
            className={active === index ? 'active' : ''}
            onClick={() => {
              setActive(index);
              setPaused(true);
            }}
            aria-label={`Afficher ${service.name}`}
          />
        ))}
      </div>
      {paused && (
        <button className="resume-carousel" onClick={() => setPaused(false)}>
          Reprendre le défilement automatique
        </button>
      )}
    </section>
  );
}

function HomeScreen({ session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0] ||
    'Membre';

  return (
    <main className="home-screen">
      <header className="home-header">
        <Brand />
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav className="home-menu">
            <a href="#services" onClick={() => setMenuOpen(false)}>Nos services</a>
            <a href="mailto:edbusinesscenter@gmail.com">Nous contacter</a>
            <a href="https://bassomodominique9-debug.github.io/Suivi/" target="_blank" rel="noreferrer">
              Suivi et évaluation apprenants
            </a>
            <button onClick={onLogout}><LogOut size={17} /> Déconnexion</button>
          </nav>
        )}
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">TON ESPACE ED B-CENTER</div>
          <h1>Bonjour,<br /><span>{userName}</span> 👋</h1>
          <p>Apprends de nouvelles compétences et transforme tes idées en projets concrets.</p>
          <a className="primary-button hero-cta" href="#services">
            Explorer les services <ArrowRight size={18} />
          </a>
        </div>
        <div className="home-hero-art">
          <div className="hero-art-circle"><BookOpen size={78} /></div>
          <div className="hero-art-badge"><Sparkles size={20} /> Ton potentiel, en action</div>
        </div>
      </section>

      <ServiceCarousel />

      <section className="help-banner">
        <div className="help-icon"><Headphones size={26} /></div>
        <div>
          <h3>Besoin d’aide ?</h3>
          <p>Notre équipe est là pour t’accompagner.</p>
        </div>
        <a href="mailto:edbusinesscenter@gmail.com?subject=ED%20HELP" aria-label="Contacter ED HELP">
          <ArrowRight size={21} />
        </a>
      </section>

      <footer className="home-footer">
        <Brand />
        <p>© {new Date().getFullYear()} ED B-CENTER · Apprendre, pratiquer, entreprendre.</p>
        <div className="footer-links">
          <a href="https://wa.me/237690418794" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="mailto:edbusinesscenter@gmail.com">E-mail</a>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [authMode, setAuthMode] = useState('login');
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error('Session check:', error.message);
      setSession(data?.session ?? null);
      setScreen(data?.session ? 'home' : 'splash');
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) setScreen('home');
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      window.alert('Impossible de se déconnecter pour le moment.');
      return;
    }
    setSession(null);
    setAuthMode('login');
    setScreen('splash');
  }

  if (checkingSession) {
    return (
      <main className="loading-screen">
        <div className="loading-mark"><BookOpen size={35} /></div>
        <LoaderCircle className="spin" size={25} />
        <p>Préparation de ton espace…</p>
      </main>
    );
  }

  if (session) return <HomeScreen session={session} onLogout={handleLogout} />;

  if (screen === 'auth') {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onBack={() => setScreen('splash')}
        onAuthenticated={(newSession) => {
          setSession(newSession);
          setScreen('home');
        }}
      />
    );
  }

  return (
    <Splash
      onStart={() => {
        setAuthMode('login');
        setScreen('auth');
      }}
    />
  );
}
