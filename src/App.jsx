import { useEffect, useRef, useState } from 'react';
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
  Sparkles,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';

/* =========================================================
   SERVICES ED B-CENTER
========================================================= */

const services = [
  {
    name: 'ED B-ACADEMY',
    description:
      'Des formations pratiques pour apprendre, pratiquer et entreprendre.',
    detail:
      'Infographie, intelligence artificielle, sourcing et outils de gestion.',
    icon: GraduationCap,
  },
  {
    name: 'ED DIGITAL AGENCY',
    description:
      'Développez une image professionnelle et attirez vos clients.',
    detail:
      'Création graphique, identité visuelle et communication digitale.',
    icon: Palette,
  },
  {
    name: 'ED B-SOURCING',
    description:
      'Recherchez des produits et préparez vos approvisionnements.',
    detail:
      'Recherche, comparaison, sourcing Chine et précommandes.',
    icon: Globe,
  },
  {
    name: 'ED B-CONSULTING',
    description:
      'Structurez vos idées et avancez avec une méthode claire.',
    detail:
      'Conseils pratiques pour les entrepreneurs et porteurs de projets.',
    icon: BriefcaseBusiness,
  },
  {
    name: 'ED B-SOLUTION',
    description:
      'Des solutions numériques adaptées à vos besoins.',
    detail:
      'Outils digitaux et accompagnement vers des méthodes plus efficaces.',
    icon: Lightbulb,
  },
];

/* =========================================================
   ÉLÉMENTS GRAPHIQUES
========================================================= */

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
      <div className="brand-mark">
        <BookOpen size={25} strokeWidth={2.2} />
      </div>

      <div>
        <strong>ED B-CENTER</strong>
        <span>APPRENDRE · PRATIQUER · ENTREPRENDRE</span>
      </div>
    </div>
  );
}

function LoadingScreen({
  message = 'Préparation de ton espace…',
}) {
  return (
    <main className="loading-screen" aria-live="polite">
      <div className="loading-mark">
        <BookOpen size={35} />
      </div>

      <LoaderCircle className="spin" size={25} />

      <p>{message}</p>
    </main>
  );
}

/* =========================================================
   ÉCRAN DE BIENVENUE
========================================================= */

function Splash({ onStart }) {
  return (
    <main className="splash-screen">
      <Wave className="splash-wave splash-wave-top" />

      <div className="splash-brand">
        <Brand light />
      </div>

      <div className="splash-center">
        <div className="splash-book">
          <BookOpen size={82} strokeWidth={1.5} />

          <span className="book-line book-line-one" />
          <span className="book-line book-line-two" />
        </div>

        <div className="splash-sparkle">
          <Sparkles size={24} />
        </div>
      </div>

      <Wave className="splash-wave splash-wave-bottom" />

      <section className="splash-card">
        <div className="eyebrow">TON AVENIR COMMENCE ICI</div>

        <h1>
          Apprends aujourd’hui.
          <br />
          <span>Construis demain.</span>
        </h1>

        <p>
          Des compétences pratiques, des outils numériques et un
          accompagnement pour passer à l’action.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={onStart}
        >
          Commencer <ArrowRight size={19} />
        </button>

        <div className="splash-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   AUTHENTIFICATION
========================================================= */

function AuthScreen({
  mode,
  setMode,
  onBack,
  onAuthenticated,
}) {
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

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Entre ton adresse e-mail.');
      return;
    }

    if (isSignup && fullName.trim().length < 2) {
      setError('Entre ton nom complet pour continuer.');
      return;
    }

    if (password.length < 6) {
      setError(
        'Le mot de passe doit contenir au moins 6 caractères.'
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: authError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

        if (authError) {
          throw authError;
        }

        if (data.session) {
          onAuthenticated(data.session);
        } else {
          setMessage(
            'Compte créé. Consulte ta boîte mail pour confirmer ton adresse avant de te connecter.'
          );

          setPassword('');
          setMode('login');
        }
      } else {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (authError) {
          throw authError;
        }

        if (!data.session) {
          throw new Error(
            'Connexion incomplète. Réessaie dans quelques instants.'
          );
        }

        onAuthenticated(data.session);
      }
    } catch (err) {
      const errorMessage = String(err?.message || '');

      if (
        errorMessage
          .toLowerCase()
          .includes('invalid login credentials')
      ) {
        setError(
          'Adresse e-mail ou mot de passe incorrect.'
        );
      } else if (
        errorMessage
          .toLowerCase()
          .includes('user already registered')
      ) {
        setError(
          'Cette adresse possède déjà un compte. Essaie de te connecter.'
        );
      } else if (
        errorMessage
          .toLowerCase()
          .includes('email not confirmed')
      ) {
        setError(
          'Confirme ton adresse e-mail avant de te connecter.'
        );
      } else {
        setError(
          errorMessage || 'Une erreur est survenue. Réessaie.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setError('');
    setMessage('');
    setPassword('');
    setMode(isSignup ? 'login' : 'signup');
  }

  return (
    <main className="auth-screen">
      <header className="auth-header">
        <button
          type="button"
          className="round-back"
          onClick={onBack}
          aria-label="Retour à l’accueil"
        >
          <ArrowLeft size={21} />
        </button>

        <Brand light />

        <div className="auth-header-copy">
          <div className="eyebrow">
            BIENVENUE CHEZ ED B-CENTER
          </div>

          <h1>
            {isSignup
              ? 'Créer un compte'
              : 'Heureux de te revoir !'}
          </h1>

          <p>
            {isSignup
              ? 'Prépare-toi à apprendre et à progresser.'
              : 'Connecte-toi pour continuer ton parcours.'}
          </p>
        </div>

        <Wave className="auth-wave" />
      </header>

      <section className="auth-card">
        <div className="auth-illustration">
          <div className="illustration-orbit orbit-one" />
          <div className="illustration-orbit orbit-two" />

          <div className="illustration-book">
            <BookOpen size={54} />
          </div>

          <div className="illustration-cap">
            <GraduationCap size={33} />
          </div>

          <div className="illustration-sparkle">
            <Sparkles size={22} />
          </div>

          <div className="illustration-label">
            APPRENDRE • CRÉER • ÉVOLUER
          </div>
        </div>

        <div className="auth-form-heading">
          <h2>
            {isSignup
              ? 'Rejoins la communauté'
              : 'Connexion'}
          </h2>

          <p>
            {isSignup
              ? 'Quelques informations pour commencer.'
              : 'Entre tes identifiants pour accéder à ton espace.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          {isSignup && (
            <label className="field">
              <span>Nom complet</span>

              <div className="input-wrap">
                <UserRound size={19} />

                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Ex. Jean Dupont"
                  required
                />

                {fullName.trim().length >= 2 && (
                  <CheckCircle2
                    className="valid-icon"
                    size={18}
                  />
                )}
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="nom@exemple.com"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>

            <div className="input-wrap">
              <LockKeyhole size={19} />

              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  isSignup
                    ? 'new-password'
                    : 'current-password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="6 caractères minimum"
                minLength={6}
                required
              />

              <button
                type="button"
                className="input-action"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div
              className="form-message form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="form-message form-success"
              role="status"
            >
              {message}
            </div>
          )}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading && (
              <LoaderCircle
                className="spin"
                size={19}
              />
            )}

            {loading
              ? 'Patiente…'
              : isSignup
                ? 'Créer mon compte'
                : 'Me connecter'}

            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <div className="auth-switch">
          {isSignup
            ? 'Tu as déjà un compte ?'
            : 'Nouveau ici ?'}

          <button
            type="button"
            onClick={switchMode}
          >
            {isSignup
              ? 'Se connecter'
              : 'Créer un compte'}
          </button>
        </div>

        <p className="auth-legal">
          En continuant, tu acceptes d’utiliser ED B-CENTER
          de manière responsable.
        </p>
      </section>
    </main>
  );
}

/* =========================================================
   CARROUSEL DES SERVICES
========================================================= */

function ServiceCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    if (paused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActive(
        (current) => (current + 1) % services.length
      );
    }, 2500);

    return () => window.clearInterval(timer);
  }, [paused]);

  function changeSlide(direction) {
    setActive(
      (current) =>
        (current + direction + services.length) %
        services.length
    );

    setPaused(true);
  }

  return (
    <section
      className="services-section"
      id="services"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            DÉCOUVRE NOS ACTIVITÉS
          </div>

          <h2>Nos services</h2>

          <p>
            Des solutions pour apprendre, créer et entreprendre.
          </p>
        </div>

        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            aria-label="Service précédent"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => changeSlide(1)}
            aria-label="Service suivant"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="service-carousel"
        onTouchStart={(event) => {
          startX.current =
            event.touches[0].clientX;

          setPaused(true);
        }}
        onTouchEnd={(event) => {
          const distance =
            event.changedTouches[0].clientX -
            startX.current;

          if (Math.abs(distance) > 45) {
            changeSlide(distance < 0 ? 1 : -1);
          }
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {services.map((service, index) => {
          const Icon = service.icon;

          const offset =
            (index - active + services.length) %
            services.length;

          const relativeOffset =
            offset > services.length / 2
              ? offset - services.length
              : offset;

          return (
            <article
              key={service.name}
              className={[
                'service-card',
                index === active ? 'is-active' : '',
                Math.abs(relativeOffset) === 1
                  ? 'is-near'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                '--card-offset': relativeOffset,
              }}
              onClick={() => {
                setActive(index);
                setPaused(true);
              }}
            >
              <div className="service-icon">
                <Icon size={28} />
              </div>

              <h3>{service.name}</h3>

              <p>{service.description}</p>

              <div className="service-detail">
                {service.detail}
              </div>

              <a
                className="service-link"
                href={`mailto:edbusinesscenter@gmail.com?subject=${encodeURIComponent(service.name)}`}
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                En savoir plus <ArrowRight size={17} />
              </a>
            </article>
          );
        })}
      </div>

      <div
        className="carousel-dots"
        aria-label="Choisir un service"
      >
        {services.map((service, index) => (
          <button
            type="button"
            key={service.name}
            className={
              active === index ? 'active' : ''
            }
            onClick={() => {
              setActive(index);
              setPaused(true);
            }}
            aria-label={`Afficher ${service.name}`}
          />
        ))}
      </div>

      {paused && (
        <button
          type="button"
          className="resume-carousel"
          onClick={() => setPaused(false)}
        >
          Reprendre le défilement automatique
        </button>
      )}
    </section>
  );
}

/* =========================================================
   ACCUEIL MEMBRE ET CHARGEMENT DU PROFIL
========================================================= */

function HomeScreen({ session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError('');

      try {
        const userId = session?.user?.id;

        if (!userId) {
          throw new Error(
            'Session utilisateur introuvable.'
          );
        }

        const [
          { data: profileData, error: profileErr },
          { data: roleData, error: roleErr },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, email, created_at')
            .eq('id', userId)
            .maybeSingle(),

          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle(),
        ]);

        if (profileErr) throw profileErr;
        if (roleErr) throw roleErr;

        if (active) {
          setProfile(profileData);
          setIsAdmin(roleData?.role === 'admin');
        }
      } catch (err) {
        console.error(
          'Erreur de chargement du profil :',
          err
        );

        if (active) {
          setProfileError(
            'Impossible de charger toutes les informations du profil.'
          );

          setIsAdmin(false);
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  async function handleLogoutClick() {
  if (loggingOut) return;

  setLoggingOut(true);

  try {
    await onLogout();
  } finally {
    setLoggingOut(false);
  }
}

const userName =
  profile?.full_name ||
  session?.user?.user_metadata?.full_name ||
  session?.user?.email?.split('@')[0] ||
  'Membre';

if (showAdmin && isAdmin) {
  return (
    <AdminDashboard
      onBack={() => setShowAdmin(false)}
    />
  );
}

return (
  <main className="home-screen">
    <header className="home-header">
      <Brand />

      <button
        type="button"
        className="menu-toggle"
        onClick={() =>
          setMenuOpen((current) => !current)
        }
        aria-label={
          menuOpen
            ? 'Fermer le menu'
            : 'Ouvrir le menu'
        }
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

      {menuOpen && (
        <nav className="home-menu">
          <a
            href="#services"
            onClick={() => setMenuOpen(false)}
          >
            Nos services
          </a>

          <a
            href="mailto:edbusinesscenter@gmail.com"
            onClick={() => setMenuOpen(false)}
          >
            Nous contacter
          </a>

          <a
            href="https://bassomodominique9-debug.github.io/Suivi/"
            target="_blank"
            rel="noreferrer"
          >
            Suivi et évaluation des apprenants
          </a>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setShowAdmin(true);
                setMenuOpen(false);
              }}
            >
              <ShieldCheck size={17} />
              Administration
            </button>
          )}

          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
          >
            <LogOut size={17} />
            {loggingOut
              ? 'Déconnexion…'
              : 'Se déconnecter'}
          </button>
        </nav>
      )}
    </header>

    <section className="home-welcome">
      <div className="eyebrow">
        TON ESPACE PERSONNEL
      </div>

      <h1>
        👋 Hello, ravi de te revoir,
        <br />
        <span>{userName} !</span>
      </h1>

      <p>
        Continue à apprendre, à pratiquer et à entreprendre
        avec ED B-CENTER.
      </p>

      {profileLoading && (
        <p role="status">
          Chargement de ton profil…
        </p>
      )}

      {profileError && (
        <p role="status">{profileError}</p>
      )}

      {isAdmin && (
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowAdmin(true)}
        >
          <ShieldCheck size={19} />
          Ouvrir le tableau de bord
          <ArrowRight size={19} />
        </button>
      )}
    </section>

    <ServiceCarousel />

    <footer className="home-footer">
      <Brand />

      <div className="home-footer-links">
        <a href="mailto:edbusinesscenter@gmail.com">
          E-mail
        </a>
      </div>
    </footer>
  </main>
  );
}

/* =========================================================
   APPLICATION PRINCIPALE
========================================================= */

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [authMode, setAuthMode] = useState('login');
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (!mounted) return;
        if (error) throw error;

        const currentSession = data?.session ?? null;

        setSession(currentSession);
        setScreen(
          currentSession ? 'home' : 'splash'
        );
      } catch (err) {
        if (!mounted) return;

        console.error(
          'Erreur de vérification de session :',
          err?.message
        );

        setSessionError(
          'Impossible de vérifier ta session. Vérifie ta connexion Internet puis réessaie.'
        );

        setSession(null);
        setScreen('splash');
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession) {
          setScreen('home');
          setSessionError('');
        } else {
          setScreen('splash');
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      window.alert(
        'Impossible de se déconnecter pour le moment. Réessaie.'
      );

      throw error;
    }

    setSession(null);
    setAuthMode('login');
    setScreen('splash');
  }

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (session) {
    return (
      <HomeScreen
        session={session}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'auth') {
    return (
      <>
        {sessionError && (
          <div
            className="form-message form-error"
            role="alert"
          >
            {sessionError}
          </div>
        )}

        <AuthScreen
          mode={authMode}
          setMode={setAuthMode}
          onBack={() => {
            setSessionError('');
            setScreen('splash');
          }}
          onAuthenticated={(newSession) => {
            setSession(newSession);
            setSessionError('');
            setScreen('home');
          }}
        />
      </>
    );
  }

  return (
    <Splash
      onStart={() => {
        setSessionError('');
        setAuthMode('login');
        setScreen('auth');
      }}
    />
  );
}
