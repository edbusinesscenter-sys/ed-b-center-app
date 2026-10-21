import { useState } from "react";
import { supabase } from "./supabaseClient";

const USSD = "#150*46*0439998*2500#";

export default function TicketPayment({ payment, onClose, onNotify }) {
  const [step, setStep] = useState(1);
  const [txId, setTxId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm(event) {
    event.preventDefault();
    if (!payment?.id) { setError("Réservation introuvable. Recommence la réservation."); return; }
    if (txId.trim().length < 6) { setError("Entre l'ID de transaction complet reçu par SMS."); return; }
    setBusy(true);
    setError("");
    const { error: err } = await supabase.rpc("submit_workshop_payment", {
      p_reservation_id: payment.id,
      p_transaction_id: txId.trim(),
    });
    setBusy(false);
    if (err) {
      setError(err.message.includes("function") ? "Le SQL « partie 5 » doit être installé dans Supabase." : err.message);
      return;
    }
    onNotify?.("ID de transaction envoyé. Ton ticket sera confirmé après vérification par l'administrateur.");
    onClose();
  }

  return (
    <div className="atelier-modal-backdrop" role="presentation">
      <section className="atelier-reservation-modal" role="dialog" aria-modal="true" aria-label="Paiement du ticket">
        <button className="atelier-modal-close" type="button" onClick={onClose} aria-label="Fermer">×</button>
        <span className="eyebrow">PAIEMENT DU TICKET</span>
        <h2>{payment?.title}</h2>
        {step === 1 ? (
          <>
            <p>Suis ces étapes pour payer ton ticket de <strong>2 500 FCFA</strong> :</p>
            <ol className="payment-steps">
              <li>Compose le code ci-dessous sur ton téléphone.</li>
              <li>Suis les instructions et valide le paiement.</li>
              <li>Reviens ici et clique sur « J'ai payé ».</li>
            </ol>
            <a className="button button-outline button-full" href={"tel:" + encodeURIComponent(USSD)}>Composer {USSD}</a>
            <button type="button" className="button button-primary button-full" onClick={() => setStep(2)}>J'ai payé</button>
          </>
        ) : (
          <form onSubmit={confirm} className="atelier-reservation-form">
            <p>Merci de renseigner l'<strong>ID de transaction</strong> du dépôt, reçu par SMS (exemple : CI261017.1533.C73180).</p>
            <label>ID de transaction
              <input value={txId} onChange={(e) => setTxId(e.target.value)} required maxLength={40} autoComplete="off" autoCapitalize="characters" placeholder="CI261017.1533.C73180" />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="button button-primary button-full" disabled={busy}>{busy ? "Envoi…" : "Confirmer"}</button>
            <button type="button" className="button button-outline button-full" onClick={() => setStep(1)}>Retour</button>
          </form>
        )}
        {step === 1 && error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}
