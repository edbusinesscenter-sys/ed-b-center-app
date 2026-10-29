import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { uploadFile } from "./Attachments";
import "./catalogs.css";

const notify = (m) => window.dispatchEvent(new CustomEvent("ed-bcenter-notify", { detail: m }));
const go = (page) => window.dispatchEvent(new CustomEvent("ed-navigate", { detail: page }));
const errMsg = (e) => (/function|schema cache|does not exist/i.test(e?.message || "") ? "Installe le SQL « partie 30 » dans Supabase." : e?.message || "Erreur");

export const CATALOG_TITLES = { tableaux: "Tableaux muraux", chine: "Précommandes Chine", design: "Services design et data", photo: "Photographie" };

// Liste d'un catalogue : cartes compactes avec galerie (3 à 5 photos)
export function CatalogPage({ catalog }) {
  const [items, setItems] = useState(null);
  const [quoting, setQuoting] = useState(null);
  const [china, setChina] = useState("");

  useEffect(() => {
    supabase.rpc("list_catalog", { p_catalog: catalog }).then(({ data, error }) => {
      if (error) { notify(errMsg(error)); setItems([]); return; }
      setItems(Array.isArray(data) ? data : []);
    });
    if (catalog === "chine") {
      supabase.from("service_links").select("url").eq("key", "whatsapp_china_group").maybeSingle().then(({ data }) => setChina(data?.url || ""));
    }
  }, [catalog]);

  return (
    <section className="section-container catalog-page">
      <button type="button" className="text-button" onClick={() => go("home")}>← Retour</button>
      <span className="eyebrow">CATALOGUE</span>
      <h1>{CATALOG_TITLES[catalog]}</h1>
      {catalog === "chine" && china && (
        <a className="button button-primary button-full" href={china} target="_blank" rel="noopener noreferrer">Rejoindre le groupe de précommande</a>
      )}
      {items === null && <p>Chargement…</p>}
      {items && items.length === 0 && <p>Aucun article pour le moment.</p>}
      <div className="catalog-grid">
        {(items || []).map((it) => <ItemCard key={it.id} item={it} catalog={catalog} onQuote={() => setQuoting(it)} />)}
      </div>
      {quoting && <QuoteModal catalog={catalog} item={quoting} onClose={() => setQuoting(null)} />}
    </section>
  );
}

export function ItemCard({ item, onQuote }) {
  const [idx, setIdx] = useState(0);
  const photos = item.gallery || [];
  return (
    <article className="catalog-item">
      {photos.length > 0 ? (
        <div className="catalog-gallery">
          <img src={photos[idx]} alt={item.title} loading="lazy" />
          {photos.length > 1 && (
            <div className="gallery-dots" role="tablist">
              {photos.map((_, i) => (
                <button key={i} type="button" className={i === idx ? "dot dot-on" : "dot"} aria-label={`Photo ${i + 1}`} onClick={() => setIdx(i)} />
              ))}
            </div>
          )}
        </div>
      ) : <div className="catalog-noimg" aria-hidden="true">{item.title.slice(0, 1)}</div>}
      <div className="catalog-body">
        <strong>{item.title}</strong>
        {item.description && <p>{item.description}</p>}
        <span className="catalog-price">{item.price_text || "Devis après étude"}</span>
        <button type="button" className="button button-primary catalog-cta" onClick={onQuote}>Demander un devis</button>
      </div>
    </article>
  );
}

export function QuoteModal({ catalog, item, onClose }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", need: "", deadline: "" });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function send(event) {
    event.preventDefault();
    setBusy(true);
    try {
      let fileUrl = null;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Connecte-toi pour joindre un fichier.");
        if (file.size > 10 * 1024 * 1024) throw new Error("Fichier trop lourd (10 Mo maximum).");
        fileUrl = await uploadFile(user, file, "devis/");
      }
      const { error } = await supabase.rpc("create_quote_request", {
        p_catalog: catalog, p_item: item?.id || null, p_name: f.name, p_phone: f.phone, p_email: f.email,
        p_need: f.need, p_deadline: f.deadline || null, p_file: fileUrl,
      });
      if (error) throw error;
      notify("Demande envoyée. L'équipe te répond rapidement.");
      onClose();
    } catch (err) { notify(errMsg(err)); }
    setBusy(false);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="auth-modal quote-modal" onSubmit={send} role="dialog" aria-modal="true" aria-label="Demande de devis">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <h2>Demande de devis</h2>
        <p className="auth-description">{item ? item.title : CATALOG_TITLES[catalog]}</p>
        <input value={f.name} onChange={set("name")} placeholder="Nom complet" required maxLength={120} />
        <input value={f.phone} onChange={set("phone")} placeholder="Téléphone" required maxLength={30} />
        <input type="email" value={f.email} onChange={set("email")} placeholder="E-mail (facultatif)" maxLength={120} />
        <textarea rows={4} value={f.need} onChange={set("need")} placeholder="Décris ton besoin : contenu, dimensions, quantité, usage" required minLength={10} maxLength={2000} />
        <label>Délai souhaité<input type="date" value={f.deadline} onChange={set("deadline")} /></label>
        <label>Fichier de référence (facultatif)<input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        <button type="submit" className="button button-primary button-full" disabled={busy}>{busy ? "Envoi…" : "Envoyer la demande"}</button>
      </form>
    </div>
  );
}

// Galeries de la page photo (affichées au-dessus du choix studio / événementiel)
export function PhotoGallery() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    supabase.rpc("list_catalog", { p_catalog: "photo" }).then(({ data }) => setItems(Array.isArray(data) ? data : []));
  }, []);
  const withPhotos = items.filter((i) => (i.gallery || []).length > 0);
  if (withPhotos.length === 0) return null;
  return (
    <div className="catalog-grid photo-gallery">
      {withPhotos.map((it) => <ItemCard key={it.id} item={it} catalog="photo" onQuote={() => go("photo")} />)}
    </div>
  );
}

// Administration : articles, galeries (3 à 5 photos) et demandes de devis
export function CatalogAdmin({ onNotify }) {
  const [items, setItems] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [form, setForm] = useState({ catalog: "design", title: "", description: "", price_text: "Devis après étude" });
  const [galleryFor, setGalleryFor] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  async function load() {
    const i = await supabase.from("catalog_items").select("*").order("catalog").order("position");
    if (i.error) onNotify?.(errMsg(i.error)); else setItems(i.data || []);
    const q = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(100);
    if (!q.error) setQuotes(q.data || []);
  }
  useEffect(() => { load(); }, []);

  async function addItem(e) {
    e.preventDefault();
    if (form.title.trim().length < 2) { onNotify?.("Indique un titre."); return; }
    const { error } = await supabase.from("catalog_items").insert({ catalog: form.catalog, title: form.title.trim(), description: form.description.trim(), price_text: form.price_text.trim() || "Devis après étude" });
    if (error) { onNotify?.(errMsg(error)); return; }
    setForm({ ...form, title: "", description: "" }); onNotify?.("Article ajouté."); load();
  }
  async function togglePublish(it) {
    const { error } = await supabase.from("catalog_items").update({ is_published: !it.is_published }).eq("id", it.id);
    if (error) onNotify?.(errMsg(error)); else load();
  }
  async function removeItem(it) {
    if (!window.confirm("Supprimer cet article et ses photos ?")) return;
    const { error } = await supabase.from("catalog_items").delete().eq("id", it.id);
    if (error) onNotify?.(errMsg(error)); else load();
  }
  async function addPhotos(it) {
    const current = await supabase.from("catalog_gallery").select("id").eq("item_id", it.id);
    const count = current.data ? current.data.length : 0;
    if (count + galleryFiles.length > 5) { onNotify?.(`Une galerie ne peut pas dépasser 5 photos (actuellement ${count}).`); return; }
    if (galleryFiles.length === 0) { onNotify?.("Choisis des photos."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    try {
      for (let k = 0; k < galleryFiles.length; k++) {
        const file = galleryFiles[k];
        if (!file.type.startsWith("image/")) throw new Error("Seules les images sont acceptées.");
        const url = await uploadFile(user, file, "catalogue/");
        const { error } = await supabase.from("catalog_gallery").insert({ item_id: it.id, url, position: count + k + 1 });
        if (error) throw error;
      }
      onNotify?.("Photos ajoutées."); setGalleryFiles([]); setGalleryFor(null); load();
    } catch (err) { onNotify?.(errMsg(err)); }
  }
  async function removePhoto(itemId, url) {
    const { error } = await supabase.from("catalog_gallery").delete().eq("item_id", itemId).eq("url", url);
    if (error) onNotify?.(errMsg(error)); else load();
  }
  async function setQuote(id, status, note) {
    const { error } = await supabase.rpc("admin_update_quote", { p_id: id, p_status: status, p_note: note || "" });
    if (error) onNotify?.(errMsg(error)); else { onNotify?.("Demande mise à jour."); load(); }
  }

  return (
    <>
      <form className="account-content-card admin-form" onSubmit={addItem}>
        <h3>Ajouter un article</h3>
        <select value={form.catalog} onChange={(e) => setForm({ ...form, catalog: e.target.value })}>
          <option value="design">Services design et data</option>
          <option value="tableaux">Tableaux muraux</option>
          <option value="chine">Précommandes Chine</option>
          <option value="photo">Photographie</option>
        </select>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" required maxLength={160} />
        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" maxLength={1000} />
        <input value={form.price_text} onChange={(e) => setForm({ ...form, price_text: e.target.value })} placeholder="Prix affiché (ex. Devis après étude)" maxLength={60} />
        <button type="submit" className="button button-outline">Ajouter</button>
      </form>

      <div className="account-content-card">
        <h3>Articles et galeries</h3>
        {items.map((it) => (
          <div key={it.id} className="admin-row admin-item">
            <div>
              <strong>{it.title}</strong>
              <p>{it.catalog} · {it.price_text} · {it.is_published ? "publié" : "masqué"}</p>
            </div>
            <div className="admin-row-actions">
              <button type="button" className="button button-outline" onClick={() => togglePublish(it)}>{it.is_published ? "Masquer" : "Publier"}</button>
              <button type="button" className="button button-outline" onClick={() => setGalleryFor(galleryFor === it.id ? null : it.id)}>Photos</button>
              <button type="button" className="button button-danger" onClick={() => removeItem(it)}>Supprimer</button>
            </div>
            {galleryFor === it.id && (
              <div className="gallery-admin">
                <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} />
                <button type="button" className="button button-primary" onClick={() => addPhotos(it)}>Ajouter les photos (max. 5 au total)</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="account-content-card">
        <h3>Demandes de devis</h3>
        {quotes.length === 0 && <p>Aucune demande.</p>}
        {quotes.map((q) => (
          <QuoteRow key={q.id} q={q} onSave={setQuote} />
        ))}
      </div>
    </>
  );
}

function QuoteRow({ q, onSave }) {
  const [note, setNote] = useState(q.admin_note || "");
  return (
    <div className="admin-row admin-quote">
      <div>
        <strong>{q.name}</strong> <small>· {q.catalog} · {q.item_title || "demande générale"}</small>
        <p>{q.phone}{q.email ? ` · ${q.email}` : ""}</p>
        <p>{q.need}</p>
        {q.deadline && <small>Délai : {q.deadline}</small>}
        {q.file_url && <a href={q.file_url} target="_blank" rel="noopener noreferrer">Fichier joint</a>}
      </div>
      <div className="admin-row-actions">
        <select value={q.status} onChange={(e) => onSave(q.id, e.target.value, note)}>
          <option value="new">Nouvelle</option>
          <option value="in_progress">En cours</option>
          <option value="quoted">Devis envoyé</option>
          <option value="closed">Clôturée</option>
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note interne" maxLength={1000} />
        <button type="button" className="button button-outline" onClick={() => onSave(q.id, q.status, note)}>Enregistrer la note</button>
      </div>
    </div>
  );
}
