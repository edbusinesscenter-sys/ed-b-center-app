import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff, GraduationCap, LogOut, Menu, X, ShieldCheck, LoaderCircle, Mail, LockKeyhole, UserRound, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from './supabaseClient';
import AdminDashboard from './AdminDashboard';
// ===== FONCTION POUR MODIFIER LES 53 IMAGES - UNE SEULE FOIS =====
async function changeImage(postId, file){
  // 1. Upload nouvelle image
  const { data, error } = await supabase.storage.from('ed-images').upload(`post-${postId}-${Date.now()}.png`, file);
  if(error){ alert(error.message); return; }
  const url = supabase.storage.from('ed-images').getPublicUrl(data.path).data.publicUrl;
  // 2. Met à jour la DB
  await supabase.from('actualites').update({ image_name: url }).eq('id', postId);
  alert('Image modifiée ! Recharge la page');
}
// --- BRAND AVEC TA MODIF ---
function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark"><BookOpen size={22} /></div>
      <div>
        <strong>ED B-CENTER</strong>
        <span>APPRENDRE · PRATIQUER · ENTREPRENDRE</span>
      </div>
    </div>
  );
}

// Badge bleu vérifié
const VerifiedBadge = () => (
  <span className="verified-badge" title="Vérifié">
    <svg viewBox="0 0 24 24" fill="white"><path d="M9.2 14.6l-3.1-3.1 1.4-1.4 1.7 1.7 4.6-4.6 1.4 1.4z"/></svg>
  </span>
);

// --- SPLASH + AUTH (ton ancien code gardé) ---
function Splash({ onStart }) { /* garde ton code Splash d'origine ici */ 
  return (
    <main className="splash-screen">
      <Brand light />
      <h1>Apprends aujourd'hui.<br/><span>Construis demain.</span></h1>
      <button className="primary-button" onClick={onStart}>Commencer <ArrowRight size={18}/></button>
    </main>
  )
}

function AuthScreen({ mode, setMode, onBack, onAuthenticated }) {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const isSignup = mode === 'signup';
  async function handleSubmit(e){ e.preventDefault(); setLoading(true); setError('');
    try{
      if(isSignup){
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options:{ data:{ full_name: fullName } } });
        if(error) throw error; if(data.session) onAuthenticated(data.session);
      }else{
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if(error) throw error; onAuthenticated(data.session);
      }
    }catch(err){ setError(err.message) } finally{ setLoading(false) }
  }
  return (
    <main className="auth-screen">
      <button onClick={onBack} className="round-back"><ArrowLeft/></button>
      <Brand light/>
      <section className="auth-card">
        <h2>{isSignup ? 'Créer un compte' : 'Connexion'}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nom complet" required/>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/>
          <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" required/>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-button" disabled={loading}>{loading?'...': isSignup ? 'Créer' : 'Se connecter'}</button>
        </form>
        <button onClick={()=>setMode(isSignup?'login':'signup')}>{isSignup?'Déjà un compte ? Se connecter':'Pas de compte ? Créer'}</button>
      </section>
    </main>
  )
}

// --- HOME SCREEN AVEC NOUVEAU DESIGN PREMIUM + DONNEES SUPABASE ---
function HomeScreen({ session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false); const [profile, setProfile] = useState(null); const [userRole, setUserRole] = useState('client');
  const [courses, setCourses] = useState([]); const [showAdmin, setShowAdmin] = useState(false);
  const [slide, setSlide] = useState(0);

  const motivImages = ["image carousel motivation.jpeg","image de motivation carousel.png","images carousel.motivation.jpeg"];

  useEffect(()=>{
    async function load(){
      const userId = session?.user?.id;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      const { data: r } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
      const { data: c } = await supabase.from('courses').select('*').eq('status','active').order('created_at',{ascending:false});
      setProfile(p); setUserRole(r?.role || 'client'); setCourses(c || []);
    }
    load();
  }, [session]);

  if(showAdmin && userRole === 'admin') return <AdminDashboard onBack={()=>setShowAdmin(false)} />;

  const userName = profile?.full_name || session?.user?.email?.split('@')[0];

  return (
    <main className="premium-app">
      <header className="header">
        <Brand />
        <span className="slogan">APPRENDRE • PRATIQUER • ENTREPRENDRE</span>
        <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
        {menuOpen && <nav className="home-menu">
          {userRole==='admin' && <button onClick={()=>setShowAdmin(true)}><ShieldCheck size={16}/> Administration</button>}
          <button onClick={onLogout}><LogOut size={16}/> Déconnexion</button>
        </nav>}
      </header>

      {/* CAROUSEL MOTIVATION */}
      <div className="motiv-carousel">
        <div className="motiv-track" style={{transform:`translateX(-${slide*100}%)`}}>
          {motivImages.map((img,i)=><div key={i} className="motiv-slide"><img src={img} alt=""/><div className="motiv-overlay"><h2>ED B-CENTER</h2><p>Bienvenue {userName}</p></div></div>)}
        </div>
        <div className="dots">{motivImages.map((_,i)=><span key={i} className={i===slide?'active':''} onClick={()=>setSlide(i)}></span>)}</div>
      </div>

      {/* FORMATIONS VENANT DE SUPABASE */}
      <section className="section">
        <h2 className="section-title">Nos Formations {VerifiedBadge && ''}</h2>
        <div className="grid">
          {courses.map(course=>(
            <div key={course.id} className="card">
              <div className="card-img"><img src={`${course.title.toLowerCase().includes('power')?'04-power-bi.png': course.title.toLowerCase().includes('excel')?'03-excel.png':'01-infographie-ia.png'}`} alt=""/><span className="badge">{course.category}</span></div>
              <div className="card-body">
                <h3>{course.title} <VerifiedBadge/></h3>
                <p className="cat">{course.duration_hours}h</p>
                <div className="price"><span className="new">{Number(course.price_fcfa).toLocaleString()} FCFA</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer"><Brand/><p>edbusinesscenter@gmail.com</p></footer>
    </main>
  )
}

export default function App(){
  const [screen, setScreen] = useState('splash'); const [authMode, setAuthMode] = useState('login'); const [session, setSession] = useState(null); const [checking, setChecking] = useState(true);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{ setSession(data.session); setScreen(data.session?'home':'splash'); setChecking(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_,s)=>{ setSession(s); setScreen(s?'home':'splash'); });
    return ()=> sub.subscription.unsubscribe();
  },[]);
  if(checking) return <div className="loading-screen">Chargement...</div>;
  if(screen==='splash') return <Splash onStart={()=>setScreen('auth')} />;
  if(screen==='auth') return <AuthScreen mode={authMode} setMode={setAuthMode} onBack={()=>setScreen('splash')} onAuthenticated={(s)=>{setSession(s); setScreen('home');}} />;
  return <HomeScreen session={session} onLogout={async()=>{ await supabase.auth.signOut(); }} />;
          }
