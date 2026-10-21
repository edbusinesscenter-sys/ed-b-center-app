import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ResetPasswordModal({ onClose, onNotify }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onNotify?.("Mot de passe modifié avec succès.");
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
        <span className="eyebrow">SÉCURITÉ</span>
        <h2 id="reset-title">Nouveau mot de passe</h2>
        <p className="auth-description">Choisis un nouveau mot de passe pour ton compte.</p>
        <form onSubmit={submit}>
          <div className="form-field">
            <label htmlFor="reset-pass">Nouveau mot de passe</label>
            <input id="reset-pass" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="reset-confirm">Confirmer</label>
            <input id="reset-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button type="submit" className="button button-primary button-full" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </section>
    </div>
  );
}
