import { useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP_NUMBER = "237690418794";

function formatPrice(price) {
  const n = Number(price);
  return Number.isFinite(n) && n > 0 ? `${n.toLocaleString("fr-FR")} FCFA` : "";
}

export default function CourseEnrollmentModal({ user, profile, course, onClose, onNotify }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || "",
    phone: profile?.phone || user?.user_metadata?.phone || "",
    email: user?.email || "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  function update(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.phone.trim().length < 8) { setError("Saisis un numéro de téléphone valide."); return; }
    setLoading(true);
    const { error: err } = await supabase.from("course_enrollments").insert({
      user_id: user.id,
      course_id: String(course.id ?? ""),
      course_title: course.title,
      course_price: course.price ?? null,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim() || null,
    });
    setLoading(false);
    if (err) { setError("Inscription impossible : " + err.message); return; }

    const text =
      `Bonjour ED BUSINESS CENTER, je viens de m'inscrire à la formation « ${course.title} »` +
      (formatPrice(course.price) ? ` (${formatPrice(course.price)})` : "") +
      `.\nNom : ${form.full_name.trim()}\nTéléphone : ${form.phone.trim()}` +
      (form.message.trim() ? `\nMessage : ${form.message.trim()}` : "");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(url);
    onNotify?.("Ton inscription est enregistrée.");
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) onNotify?.("Appuie sur le bouton WhatsApp pour finaliser.");
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="auth-modal register-modal" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <span className="eyebrow">INSCRIPTION À LA FORMATION</span>
        <h2 id="enroll-title">{course.title}</h2>
        {formatPrice(course.price) && <p className="auth-description">Prix : {formatPrice(course.price)}</p>}

        {whatsappUrl ? (
          <div>
            <div className="form-success" role="status">
              Inscription enregistrée. L'équipe a été prévenue. Termine sur WhatsApp pour être contacté rapidement.
            </div>
            <a className="button button-whatsapp button-full" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Continuer sur WhatsApp
            </a>
            <button type="button" className="button button-outline button-full" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="form-field">
              <label htmlFor="enroll-name">Nom complet</label>
              <input id="enroll-name" name="full_name" value={form.full_name} onChange={update} required />
            </div>
            <div className="form-field">
              <label htmlFor="enroll-phone">Téléphone (WhatsApp)</label>
              <input id="enroll-phone" name="phone" type="tel" value={form.phone} onChange={update} placeholder="+237..." required />
            </div>
            <div className="form-field">
              <label htmlFor="enroll-email">E-mail</label>
              <input id="enroll-email" name="email" type="email" value={form.email} onChange={update} />
            </div>
            <div className="form-field">
              <label htmlFor="enroll-message">Message (facultatif)</label>
              <textarea id="enroll-message" name="message" rows={3} value={form.message} onChange={update} placeholder="Disponibilités, questions…" />
            </div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button type="submit" className="button button-primary button-full" disabled={loading}>
              {loading ? "Envoi en cours..." : "Valider mon inscription"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
