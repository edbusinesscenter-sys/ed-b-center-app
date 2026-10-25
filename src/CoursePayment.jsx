import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function CoursePayment({ course, regId, whatsapp, whatsappText, onNotify }) {
  const [step, setStep] = useState(course.price && regId ? 1 : 3);
  const [tx, setTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const code = `#150*46*0439998*${course.price}#`;
  const amount = Number(course.price || 0).toLocaleString("fr-FR");
  const wa = <a className="button button-outline button-full" href={`${whatsapp}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer">Une question ? Écris-nous sur WhatsApp</a>;

  async function confirm(event) {
    event.preventDefault();
    if (tx.trim().length < 6) { setError("Entre l'ID de transaction complet reçu par SMS."); return; }
    setBusy(true); setError("");
    const { error: err } = await supabase.rpc("submit_course_payment", { p_registration_id: regId, p_transaction_id: tx.trim() });
    setBusy(false);
    if (err) { setError(/function|schema cache/i.test(err.message) ? "Le SQL « partie 13 » doit être installé dans Supabase." : err.message); return; }
    onNotify?.("ID de transaction envoyé. Ton inscription sera confirmée après vérification.");
    setStep(3);
  }

  if (step === 1) return (
    <>
      <p>Ton inscription est enregistrée. Montant à payer : <strong>{amount} FCFA</strong></p>
      <ol className="payment-steps"><li>Compose le code ci-dessous et valide le paiement.</li><li>Reviens ici et clique sur « J'ai payé ».</li></ol>
      <a className="button button-outline button-full" href={"tel:" + encodeURIComponent(code)}>Composer {code}</a>
      <button type="button" className="button button-primary button-full" onClick={() => setStep(2)}>J'ai payé</button>
      {wa}
    </>
  );
  if (step === 2) return (
    <form onSubmit={confirm} className="atelier-reservation-form">
      <p>Merci de renseigner l'<strong>ID de transaction</strong> du dépôt, reçu par SMS.</p>
      <label>ID de transaction<input value={tx} onChange={(e) => setTx(e.target.value)} required maxLength={40} autoComplete="off" autoCapitalize="characters" placeholder="CI000000.0000.C00000" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="button button-primary button-full" disabled={busy}>{busy ? "Envoi…" : "Confirmer"}</button>
      <button type="button" className="button button-outline button-full" onClick={() => setStep(1)}>Retour</button>
    </form>
  );
  return (<><p>{regId && course.price ? "Merci ! Ton paiement sera vérifié par notre équipe, puis ton inscription sera confirmée dans tes notifications." : "Ta demande est enregistrée. Notre équipe te contactera."}</p>{wa}</>);
}
