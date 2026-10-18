import { useState } from "react";

const IMG_BASE = "https://raw.githubusercontent.com/edbusinesscenter-sys/ed-b-center-app/main/public/images";
function IMG(name){ return `${IMG_BASE}/${encodeURIComponent(name)}`; }

export default function App(){
  const [view,setView] = useState("home");
  const imgs = ["46-produits-phares.png","10-gamme-complete.png","08-visuels-publicitaires.png","14-assortiment.png","ed-b-center-logo.png","47-catalogue.png","05-presentation.png"];

  return (
    <div style={{background:"#FFFBF0",minHeight:"100vh",fontFamily:"system-ui"}}>
      <header style={{background:"linear-gradient(90deg,#4200FF,#A73D00)",padding:"12px 20px",display:"flex",justifyContent:"space-between",color:"white"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={IMG("ed-b-center-logo.png")} alt="" style={{width:35,height:35,borderRadius:8,background:"white"}}/>
          <b>ED B-CENTER</b>
        </div>
        <button onClick={()=>setView(view==="home"?"admin":"home")} style={{background:"white",border:0,padding:"8px 14px",borderRadius:8,fontWeight:"bold"}}>{view==="home"?"Admin":"Home"}</button>
      </header>

      <div style={{padding:20}}>
        <h2 style={{color:"#FF2200"}}>✅ SITE EN LIGNE - Motivation</h2>
        <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:10}}>
          {imgs.map((n,i)=><img key={i} src={IMG(n)} alt="" style={{width:280,height:180,objectFit:"cover",borderRadius:12,border:"2px solid white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}/>)}
        </div>

        <h2 style={{color:"#720000",marginTop:30}}>Formations</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {imgs.map((n,i)=><div key={i} style={{background:"white",padding:8,borderRadius:12}}><img src={IMG(n)} style={{width:"100%",height:140,objectFit:"cover",borderRadius:8}}/><p style={{fontSize:12,marginTop:6,fontWeight:600}}>{n}</p></div>)}
        </div>

        <div style={{marginTop:30,background:"white",padding:20,borderRadius:12}}>
          <h3>Si tu vois ça, la page blanche est réparée !</h3>
          <p>Maintenant on pourra remettre Supabase avec ta vraie clé anon.</p>
        </div>
      </div>
    </div>
  );
}
