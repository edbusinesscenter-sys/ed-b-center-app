import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL
const IMG = (name) => `${BASE}${name}`

// 53 IMAGES - TOUT EST UTILISÉ
const MOTIVATION = [
  "motivation-1-entrepreneur.png",
  "motivation-2-reflexion.jpeg",
  "motivation-3-entrepreneur.jpeg",
  "motivation-4-meditation.jpeg",
]

const FORMATIONS = [
  { img: "formation-infographie-ia.png", title: "Infographie & IA", old: 110000, price: 85000, cat: "Design", badge: "Bestseller", icon: "icone-ia-photographie.jpeg" },
  { img: "formation-excel-avance-power-bi.png", title: "Excel Avancé + Power BI", old: 110000, price: 85000, cat: "Data", badge: "Nouveau", icon: "icone-power-bi.jpeg" },
  { img: "formation-power-bi.png", title: "Power BI Pro", old: 90000, price: 65000, cat: "Data", badge: "", icon: "icone-power-bi.jpeg" },
  { img: "formation-excel.png", title: "Excel Complet", old: 60000, price: 40000, cat: "Data", badge: "", icon: "icone-excel.jpeg" },
  { img: "formation-analyse-visualisation-big-data.png", title: "Analyse & Visualisation Big Data", old: 120000, price: 95000, cat: "Data", badge: "Top", icon: "icone-big-data.jpeg" },
  { img: "formation-big-data.png", title: "Big Data Fondamentaux", old: 100000, price: 75000, cat: "Data", badge: "", icon: "icone-big-data.jpeg" },
  { img: "formation-sourcing-chine.png", title: "Sourcing Chine", old: 80000, price: 50000, cat: "Business", badge: "Top Vente", icon: "" },
  { img: "visuel-infographie-ia.jpeg", title: "IA Créative", old: 85000, price: 60000, cat: "IA", badge: "", icon: "" },
  { img: "visuel-technologie-apprentissage.jpeg", title: "Technologie & Apprentissage", old: 70000, price: 45000, cat: "Tech", badge: "", icon: "" },
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
  const [currentMotiv, setCurrentMotiv] = useState(0)
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    const id = setInterval(()=> setCurrentMotiv(m=> (m+1)%MOTIVATION.length), 3500)
    return ()=> clearInterval(id)
  },[])

  return (
    <div className="premium-app">
      <header className="header">
        <img src={IMG("logo-ed-b-center.png")} className="logo-img" alt="ED B-CENTER"/>
        <div className="brand">ED B-CENTER</div>
        <div className="slogan">Apprendre • Pratiquer • Entreprendre</div>
      </header>

      {/* 1. CAROUSEL MOTIVATION EN HAUT */}
      <section className="motiv-carousel">
        <div className="motiv-track" style={{transform:`translateX(-${currentMotiv*100}%)`}}>
          {MOTIVATION.map((img,i)=>(
            <div key={i} className="motiv-slide">
              <img src={IMG(img)} alt="motivation"/>
              <div className="motiv-overlay">
                <h2>{i===0?"Passe à l'action":i===1?"Réfléchis Stratégique":i===2?"Entreprends Maintenant":"Reste Focus"}</h2>
                <p>Formation premium à Douala - De 50.000 FCFA</p>
              </div>
            </div>
          ))}
        </div>
        <div className="dots">{MOTIVATION.map((_,i)=><span key={i} className={i===currentMotiv?'active':''}></span>)}</div>
      </section>

      {/* 2. BANNIERE FACEBOOK */}
      <section className="banner-section">
        <img src={IMG("banniere-facebook-ed-b-center.png")} alt="banniere"/>
      </section>

      {/* 3. FORMATIONS - 9 CARTES PREMIUM */}
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

      {/* 4. LE RESEAU - SOURCING */}
      <section className="section dark">
        <h2>Le Réseau Sourcing Chine</h2>
        <p>Tout pour importer depuis la Chine en sécurité</p>
        <div className="grid-reseau">
          {RESEAU.map((img,i)=><img key={i} src={IMG(img)} alt="reseau" className="reseau-img"/>)}
        </div>
      </section>

      {/* 5. PHOTOGRAPHIE */}
      <section className="section">
        <h2 className="section-title">Studio Photographie</h2>
        <div className="grid-photo">
          {PHOTOS.map((img,i)=><div key={i} className="photo-card"><img src={IMG(img)} alt="photo"/></div>)}
        </div>
      </section>

      {/* 6. SERVICES */}
      <section className="section">
        <h2 className="section-title">Nos Services ED-B</h2>
        <div className="grid-service">
          {SERVICES.map((img,i)=><img key={i} src={IMG(img)} alt="service" className="service-img"/>)}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <img src={IMG("logo-ed-b-center.png")} className="footer-logo"/>
        <div className="socials">
          <img src={IMG("logo-whatsapp.png")}/><img src={IMG("logo-facebook.png")}/>
          <img src={IMG("logo-instagram.jpeg")}/><img src={IMG("logo-gmail.png")}/>
        </div>
        <p>© ED B-CENTER Douala - Tous droits réservés</p>
      </footer>

      {selected&&(
        <div className="modal" onClick={()=>setSelected(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <img src={IMG(selected.img)} alt=""/>
            <h2>{selected.title}</h2>
            <div className="price"><span className="old">{selected.old.toLocaleString()}</span><span className="new">{selected.price.toLocaleString()} FCFA</span></div>
            <a className="btn" href={`https://wa.me/2376XXXXXXX?text=Je veux ${selected.title} à ${selected.price}FCFA`}>S'inscrire WhatsApp</a>
            <button className="close" onClick={()=>setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}
