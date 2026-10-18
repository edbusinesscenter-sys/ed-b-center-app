import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// METS TES VRAIES VALEURS ICI - va dans supabase.com > Project Settings > API
const SUPABASE_URL = "https://rwmokskkupjctsx.supabase.co"; 
const SUPABASE_KEY = "METS_TA_CLE_ANON_ICI"; // la longue qui commence par eyJ...

let supabase = null;
try { supabase = createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e){}

const IMG_BASE = "https://raw.githubusercontent.com/edbusinesscenter-sys/ed-b-center-app/main/public/images";
function IMG(name){ if(!name) return ""; if(name.startsWith("http")) return name; return `${IMG_BASE}/${encodeURIComponent(name)}`; }

async function changeImage(postId, file, setLoading) {
  if(!file || !supabase) return;
  setLoading(true);
  try{
    const path = `post-${postId}-${Date.now()}-${file.name}`;
    const {data, error} = await supabase.storage.from("images").upload(path, file);
    if(error) throw error;
    const {data: urlData} = supabase.storage.from("images").getPublicUrl(data.path);
    await supabase.from("actualites").update({image_url: urlData.publicUrl}).eq("id", postId);
    alert("Image modifiée !"); window.location.reload();
  }catch(e){ alert("Erreur: "+e.message); }
  setLoading(false);
}

export default function App(){
  const [actualites, setActualites] = useState([]);
  const [view, setView] = useState("home");
  useEffect(()=>{ if(supabase){ supabase.from("actualites").select("*").order("created_at",{ascending:false}).then(({data})=>{ if(data) setActualites(data); }); } },[]);

  const fallback = ["46-produits-phares.png","10-gamme-complete.png","08-visuels-publicitaires.png","14-assortiment.png"];

  return (
    <div style={{background:"#FFFBF0", minHeight:"100vh"}}>
      <header style={{background:"linear-gradient(90deg,#4200FF,#A73D00)", padding:"12px 20px", display:"flex", justifyContent:"space-between", color:"white"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><img src={IMG("ed-b-center-logo.png")} alt="" style={{width:35,height:35,borderRadius:8,background:"white"}}/><b>ED B-CENTER</b></div>
        <button onClick={()=>setView(view==="admin"?"home":"admin")} style={{background:"white",border:0,padding:"6px 12px",borderRadius:8}}>Admin</button>
      </header>

      {view==="home" && <>
        <div style={{padding:20}}><h2 style={{color:"#FF2200"}}>Motivation</h2><div style={{display:"flex",gap:12,overflowX:"auto"}}>{fallback.map((img,i)=><img key={i} src={IMG(img)} style={{width:260,height:160,objectFit:"cover",borderRadius:12}}/>)}</div></div>
        <div style={{padding:20}}><h2>Formations</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{actualites.length>0 ? actualites.map(p=><div key={p.id} style={{background:"white",padding:8,borderRadius:12}}><img src={p.image_url||IMG(p.image_name)} style={{width:"100%",height:120,objectFit:"cover",borderRadius:8}}/><p style={{fontSize:12}}>{p.title||p.image_name}</p></div>) : fallback.map((img,i)=><div key={i} style={{background:"white",padding:8,borderRadius:12}}><img src={IMG(img)} style={{width:"100%",height:120,objectFit:"cover"}}/></div>)}</div></div>
      </>}

      {view==="admin" && <div style={{padding:20}}><h1>Admin - Modifier les 52 Images</h1><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{actualites.map(post=><div key={post.id} style={{background:"white",padding:10,borderRadius:10}}><img src={post.image_url||IMG(post.image_name)} style={{width:"100%",height:120,objectFit:"cover"}}/><p style={{fontSize:11}}>{post.image_name}</p><input type="file" id={`file-${post.id}`} style={{display:"none"}} onChange={(e)=>changeImage(post.id,e.target.files[0],()=>{})}/><button onClick={()=>document.getElementById(`file-${post.id}`).click()} style={{background:"linear-gradient(90deg,#4200FF,#A73D00)",color:"white",border:0,padding:"6px",borderRadius:6,width:"100%"}}>Modifier</button></div>)}</div></div>}
    </div>
  );
}
