import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL
const IMG = (name) => `${BASE}${name}`
function VerifiedBadge({ size=18 }){
  return (
    <span className="verified-badge" style={{width:size, height:size}}>
      <svg viewBox="0 0 24 24" fill="white"><path d="M9.5 16.5L5 12l1.4-1.4 3.1 3.1 7.1-7.1L18 8l-8.5 8.5z"/></svg>
    </span>
  )
}
const MOTIVATION = [
  "motivation-1-entrepreneur.png",
  "motivation-2-reflexion.jpeg",
  "motivation-3-entrepreneur.jpeg",
  "motivation-4-meditation.jpeg",
]

const FORMATIONS = [
  { img: "formation-infographie-ia.png", title: "Infographie & IA", old: 110000, price: 85000, cat: "Design", badge: "Bestseller" },
  { img: "formation-excel-avance-power-bi.png", title: "Excel Avancé + Power BI", old: 110000, price: 85000, cat: "Data", badge: "Nouveau" },
  { img: "formation-power-bi.png", title: "Power BI Pro", old: 90000, price: 65000, cat: "Data", badge: "" },
  { img: "formation-excel.png", title: "Excel Complet", old: 60000, price: 40000, cat: "Data", badge: "" },
  { img: "formation-analyse-visualisation-big-data.png", title: "Analyse Big Data", old: 120000, price: 95000, cat: "Data", badge: "Top" },
  { img: "formation-big-data.png", title: "Big Data", old: 100000, price: 75000, cat: "Data", badge: "" },
  { img: "formation-sourcing-chine.png", title: "Sourcing Chine", old: 80000, price: 50000, cat: "Business", badge: "Top Vente" },
  { img: "visuel-infographie-ia.jpeg", title: "IA Créative", old: 85000, price: 60000, cat: "IA", badge: "" },
  { img: "visuel-technologie-apprentissage.jpeg", title: "Tech & Apprentissage", old: 70000, price: 45000, cat: "Tech", badge: "" },
]

const RESEAU = [
  "le-reseau-sourcing-chine.png","le-reseau-recherche-produits.png","le-reseau-verification-fournisseurs.png",
  "le-reseau-comparaison-fournisseurs.png","le-reseau-avantages.png","le-reseau-petits-stocks.png",
  "le-reseau-produits-sur-commande.png","le-reseau-inscription-fonctionnement.png",
  "le-reseau-recherche-telephones.png","le-reseau-recherche-pieces-auto.png"
]
const PHOTOS = [
  "photographie-professionnelle-portrait.png","photographie-mariage-decoration.png",
  "photographie-mariage-detail.png","photographie-evenementielle-fleurs.png",
  "photographie-artistique-silhouette.png"
]
const SERVICES = [
  "service-ed-b-academy.png","service-ed-b-consulting.png","service-ed-b-sourcing.png",
  "service-ed-b-solution.png","service-ed-digital-agency.png","service-solutions-numeriques.png",
  "service-solutions-numeriques-1.png","service-visuels-publicitaires.png",
  "service-contenus-reseaux-sociaux.png","service-photographie-professionnelle.png",
  "service-photographie-evenementielle.png","service-photographie-produits.png",
  "service-packs-photographie.png","service-accompagnement-formation.png","maquette-conception-graphique.png"
]

export default function App(){
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  useEffect(()=>{
    const id = setInterval(()=> setCurrent(m=> (m+1)%MOTIVATION.length), 3500)
    return ()=> clearInterval(id)
  },[])
  return (
    <div className="premium-app">
      <header className="header">
        <img src={IMG("logo-ed-b-center.png")} className="logo-img" alt="logo"/>
        <div className="brand">ED B-CENTER</div>
        <div className="slogan">Apprendre • Pratiquer • Entreprendre</div>
      </header>

      <section className="motiv-carousel">
        <div className="motiv-track" style={{transform:`translateX(-${current*100}%)`}}>
          {MOTIVATION.map((img,i)=>(
            <div key={i} className="motiv-slide">
              <img src={IMG(img)} alt="motiv"/>
              <div className="motiv-overlay">
                <h2>{["Passe à l'action","Réfléchis Stratégique","Entreprends Maintenant","Reste Focus"][i]}</h2>
                <p>Formation premium dès 50.000 FCFA</p>
              </div>
            </div>
          ))}
        </div>
        <div className="dots">{MOTIVATION.map((_,i)=><span key={i} className={i===current?'active':''}></span>)}</div>
      </section>

      <section className="banner-section"><img src={IMG("banniere-facebook-ed-b-center.png")} alt="banniere"/></section>

      <section className="section">
        <h2 className="section-title">Formations Premium</h2>
        <div className="grid">
          {FORMATIONS.map((f,i)=>(
            <div key={i} className="card" onClick={()=>setSelected(f)}>
              <div className="card-img"><img src={IMG(f.img)} alt={f.title}/>{f.badge&&<span className="badge">{f.badge}</span>}</div>
              <div className="card-body">
                <span className="cat">{f.cat}</span>
                <h3>{f.title}</h3>
                <div className="price"><span className="old">{f.old.toLocaleString()} FCFA</span><span className="new">{f.price.toLocaleString()} FCFA</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section dark">
        <h2>Le Réseau Sourcing Chine</h2>
        <div className="grid-reseau">
          {RESEAU.map((img,i)=> <img key={i} src={IMG(img)} className="reseau-img" alt="reseau" /> )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Studio Photo</h2>
        <div className="grid-photo">
          {PHOTOS.map((img,i)=><div key={i} className="photo-card"><img src={IMG(img)} alt="photo"/></div>)}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Nos Services</h2>
        <div className="grid-service">
          {SERVICES.map((img,i)=> <img key={i} src={IMG(img)} className="service-img" alt="service" /> )}
        </div>
      </section>

      <footer className="footer">
        <img src={IMG("logo-ed-b-center.png")} className="footer-logo" alt="logo"/>
        <div className="socials"><img src={IMG("logo-whatsapp.png")} alt=""/><img src={IMG("logo-facebook.png")} alt=""/><img src={IMG("logo-instagram.jpeg")} alt=""/><img src={IMG("logo-gmail.png")} alt=""/></div>
        <p>© ED B-CENTER Douala</p>
      </footer>

      {selected&&(
        <div className="modal" onClick={()=>setSelected(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <img src={IMG(selected.img)} alt=""/><h2>{selected.title}</h2>
            <div className="price"><span className="old">{selected.old.toLocaleString()}</span><span className="new">{selected.price.toLocaleString()} FCFA</span></div>
            <a className="btn" href={`https://wa.me/237690418794?text=Je veux ${selected.title}`}>S'inscrire WhatsApp</a>
            <button className="close" onClick={()=>setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}
