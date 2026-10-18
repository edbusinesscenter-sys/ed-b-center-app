import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ===== CONFIG SUPABASE - FINAL =====
const supabase = createClient(
  "https://jvwmkoshkkzupgrjcttx.supabase.co",
  "sb_publishable_ojrPvKcGUnlIGvxwVx2f3Q_DDtp3mk8"
);

// ===== TES 53 IMAGES =====
const IMG_BASE = "https://raw.githubusercontent.com/edbusinesscenter-sys/ed-b-center-app/main/public/images/";
const IMG = (name) => {
  if(!name) return `${IMG_BASE}logo-ed-b-center.png`;
  if(name.startsWith('http')) return name;
  return `${IMG_BASE}${name}`;
};

async function changeImage(postId, file, setLoading){
  if(!file) return;
  setLoading(true);
  const path = `post-${postId}-${Date.now()}.png`;
  const { data, error } = await supabase.storage.from('ed-images').upload(path, file, {upsert:true});
  if(error){ alert(error.message); setLoading(false); return; }
  const url = supabase.storage.from('ed-images').getPublicUrl(data.path).data.publicUrl;
  await supabase.from('actualites').update({ image_name: url }).eq('id', postId);
  alert('✅ Image modifiée !');
  window.location.reload();
}

export default function App(){
  const [actualites, setActualites] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('home');

  useEffect(()=>{
    fetchActualites();
    checkUser();
  },[]);

  async function fetchActualites(){
    const { data } = await supabase.from('actualites').select('*').order('created_at', {ascending:false});
    if(data) setActualites(data);
  }

  async function checkUser(){
    const { data } = await supabase.auth.getUser();
    if(data?.user){
      setUser(data.user);
      const { data:role } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).single();
      if(role?.role === 'admin') setIsAdmin(true);
    }
  }

  const heroImages = [
    '01-infographie-ia.png',
    '10-photo-professionnelle.png',
    '08-visuels-publicitaires.png',
    '14-accompagnement.png'
  ];

  return (
    <div style={{background:'#FFFAFB', minHeight:'100vh', fontFamily:'Inter'}}>
      <header style={{
        background:'linear-gradient(90deg, #2DD4BF 0%, #373DDB 100%)',
        padding:'12px 16px',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        color:'white'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <img src={IMG('logo-ed-b-center.png')} style={{width:36, height:36, borderRadius:8, background:'white'}}/>
          <b>ED B-CENTER</b>
        </div>
        <div style={{display:'flex', gap:12}}>
          <button onClick={()=>setView('notifications')}>🔔</button>
          <button onClick={()=>setView(isAdmin?'admin':'profile')}>👤</button>
        </div>
      </header>

      {view==='home' && (
        <>
          <div style={{padding:16}}>
            <h2 style={{color:'#373DDB'}}>Motivation</h2>
            <div style={{display:'flex', gap:12, overflowX:'auto'}}>
              {heroImages.map((img,i)=>(
                <img key={i} src={IMG(img)} style={{width:280, height:160, objectFit:'cover', borderRadius:16}}/>
              ))}
            </div>
          </div>

          <div style={{padding:16}}>
            <h2 style={{color:'#373DDB'}}>Formations</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {actualites.filter(a=>a.category==='formation').map(post=>(
                <div key={post.id} style={{background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  <img src={IMG(post.image_name)} style={{width:'100%', height:120, objectFit:'cover'}}/>
                  <div style={{padding:8}}><b style={{fontSize:12}}>{post.title}</b></div>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:16}}>
            <h2 style={{color:'#373DDB'}}>Services & LE RESEAU</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {actualites.filter(a=>a.category==='service').map(post=>(
                <div key={post.id} style={{background:'white', borderRadius:16, overflow:'hidden'}}>
                  <img src={IMG(post.image_name)} style={{width:'100%', height:120, objectFit:'cover'}}/>
                  <div style={{padding:8, fontSize:12}}>{post.title}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view==='admin' && isAdmin && <AdminDashboard actualites={actualites} />}
      {view==='profile' && <div style={{padding:16}}>Profil modifiable</div>}
    </div>
  );
}

function AdminDashboard({actualites}){
  const [loading, setLoading] = useState(false);
  return (
    <div style={{padding:16, background:'#FFFAFB'}}>
      <h1 style={{color:'#373DDB'}}>Admin - Modifier les 53 Images</h1>
      <div style={{display:'grid', gap:16}}>
        {actualites.map(post=>(
          <div key={post.id} style={{background:'white', padding:12, borderRadius:12, display:'flex', gap:12, alignItems:'center'}}>
            <img src={IMG(post.image_name)} style={{width:80, height:80, objectFit:'cover', borderRadius:8}}/>
            <div style={{flex:1}}>
              <b>{post.title}</b><br/>
              <small style={{color:'#666'}}>{post.image_name}</small>
              <div style={{marginTop:8}}>
                <input type="file" id={`file-${post.id}`} style={{display:'none'}} 
                  onChange={(e)=>changeImage(post.id, e.target.files[0], setLoading)} />
                <button 
                  onClick={()=>document.getElementById(`file-${post.id}`).click()}
                  style={{background:'linear-gradient(90deg,#2DD4BF,#373DDB)', color:'white', border:'none', padding:'6px 12px', borderRadius:8, fontSize:12}}
                  disabled={loading}
                >
                  {loading ? '...' : '📸 Modifier'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
