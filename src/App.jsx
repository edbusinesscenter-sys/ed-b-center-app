import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL
const IMG = (name) => `${BASE}${name}`

function VerifiedBadge({ size=18 }){
  return (
    <span className="verified-badge" style={{width:size, height:size}}>
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
      </svg>
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
        <div className="brand">ED B-CENTER <VerifiedBadge size={18} /></div>
        <div className="slogan">Apprendre • Pratiquer • Entreprendre</div>
      </header>

      <section className="motiv-carousel">
        <div className="motiv-track" style={{transform:`translateX(-${current*100}%)`}}>
          {MOTIVATION.map((img,i)=>(
            <div key={i} className="motiv-slide">
              <img src={IMG(img)} alt="motiv"/>
              <div className="motiv-overlay">
                <h2>{["Passe à l'action","Réfléchis Stratégique","Entreprends Maintenant","Reste Focus"]
