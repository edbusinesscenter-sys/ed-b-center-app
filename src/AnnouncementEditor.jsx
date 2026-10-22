import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const EMPTY = { image_name: "mon livre.jpeg", title: "", description: "", event_day: "", event_date: "", price: "", is_published: true };

export default function AnnouncementEditor({ onNotify }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  useEffect(() => {
    supabase.from("home_announcement").select("*").eq("singleton", true).maybeSingle().then(({ data, error }) => {
      if (error) onNotify?.("Installe le SQL « partie 10 » dans Supabase.");
      else if (data) setForm({ ...EMPTY, ...data, event_date: data.event_date || "" });
    });
  }, []);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("home_announcement").upsert({
      singleton: true,
      image_name: form.image_name.trim() || "mon livre.jpeg",
      title: form.title.trim(),
      description: form.description.trim(),
      event_day: form.event_day.trim(),
      event_date: form.event_date || null,
      price: form.price.trim(),
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    }, { onConflict: "singleton" });
    setBusy(false);
    onNotify?.(error ? error.message : "Annonce de l'accueil mise à jour.");
  }

  return (
    <form className="account-content-card" onSubmit={save}>
      <h3>Annonce de la page d'accueil</h3>
      <label>Nom de l'image (dans le stockage Supabase)<input value={form.image_name} onChange={set("image_name")} placeholder="mon livre.jpeg" /></label>
      <label>Titre<input value={form.title} onChange={set("title")} maxLength={120} /></label>
      <label>Texte court<textarea rows={3} value={form.description} onChange={set("description")} maxLength={300} /></label>
      <label>Jour<input value={form.event_day} onChange={set("event_day")} placeholder="Samedi" maxLength={30} /></label>
      <label>Date<input type="date" value={form.event_date} onChange={set("event_date")} /></label>
      <label>Prix<input value={form.price} onChange={set("price")} placeholder="5 000 FCFA" maxLength={40} /></label>
      <label className="admin-check"><input type="checkbox" checked={form.is_published} onChange={set("is_published")} /> Afficher l'annonce sur l'accueil</label>
      <button type="submit" className="button button-primary" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}
