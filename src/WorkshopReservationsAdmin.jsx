import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { RefreshCw, Download, Search, Ticket, CalendarDays, AlertCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const money = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
const dateTime = (value) => value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "—";
const statusLabels = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function WorkshopReservationsAdmin() {
  const [reservations, setReservations] = useState([]);
  const [workshops, setWorkshops] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionReservation, setActionReservation] = useState(null);
  const [actionType, setActionType] = useState("confirmed");
  const [paymentReference, setPaymentReference] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const loadReservations = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("workshop_reservations")
      .select("id, workshop_id, user_id, full_name, phone, amount_xaf, status, payment_reference, payment_verified_at, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Chargement des réservations d'ateliers :", queryError.message);
      setReservations([]);
      setError("Impossible de charger les réservations. Vérifie que la table workshop_reservations existe et que les politiques RLS autorisent l'administrateur à les consulter.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const rows = data || [];
    setReservations(rows);
    const ids = [...new Set(rows.map((row) => row.workshop_id).filter(Boolean))];
    if (ids.length) {
      const { data: workshopRows, error: workshopsError } = await supabase
        .from("workshops")
        .select("id, title, starts_at, location")
        .in("id", ids);
      if (workshopsError) {
        console.error("Chargement des informations des ateliers :", workshopsError.message);
      }
      setWorkshops(Object.fromEntries((workshopRows || []).map((item) => [item.id, item])));
    } else {
      setWorkshops({});
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr-FR");
    return reservations.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      const workshop = workshops[row.workshop_id];
      const haystack = [row.full_name, row.phone, row.payment_reference, workshop?.title, row.id]
        .filter(Boolean).join(" ").toLocaleLowerCase("fr-FR");
      return !term || haystack.includes(term);
    });
  }, [reservations, workshops, search, statusFilter]);

  const counts = useMemo(() => ({
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    refunded: reservations.filter((r) => r.status === "refunded").length,
  }), [reservations]);


  async function updateReservationStatus(event) {
    event.preventDefault();
    if (!actionReservation) return;
    if (actionType === "confirmed" && paymentReference.trim().length < 4) {
      setError("Pour confirmer le paiement, saisis une référence vérifiée d'au moins 4 caractères.");
      return;
    }
    if (actionType === "refunded" && !actionNote.trim()) {
      setError("Ajoute une note confirmant que le remboursement a réellement été effectué.");
      return;
    }
    setActionBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_update_workshop_reservation", {
      p_reservation_id: actionReservation.id,
      p_new_status: actionType,
      p_payment_reference: paymentReference.trim() || null,
      p_note: actionNote.trim() || null,
    });
    setActionBusy(false);
    if (rpcError) {
      console.error("Mise à jour de réservation :", rpcError.message);
      setError("Action impossible. Vérifie que la migration SQL de gestion des réservations a été appliquée et que ton compte possède le rôle administrateur.");
      return;
    }
    setActionReservation(null);
    setPaymentReference("");
    setActionNote("");
    await loadReservations(true);
  }

  function exportCsv() {
    const headers = ["ID réservation", "Nom complet", "Téléphone", "Atelier", "Montant FCFA", "Statut", "Référence paiement", "Paiement vérifié le", "Réservation créée le"];
    const lines = filtered.map((row) => [
      row.id, row.full_name, row.phone, workshops[row.workshop_id]?.title || "Atelier indisponible",
      row.amount_xaf, statusLabels[row.status] || row.status, row.payment_reference || "",
      row.payment_verified_at ? dateTime(row.payment_verified_at) : "", dateTime(row.created_at),
    ].map(csvCell).join(";"));
    const csv = "\uFEFF" + [headers.map(csvCell).join(";"), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservations-ateliers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="account-tab-content workshop-reservations-admin">
      <div className="account-section-title workshop-reservations-heading">
        <div>
          <span className="eyebrow">GESTION DES ATELIERS</span>
          <h2>Réservations des tickets</h2>
          <p>Consulte les demandes enregistrées. Une réservation en attente n'est pas une preuve de paiement.</p>
        </div>
        <div className="workshop-reservations-actions">
          <button type="button" className="button button-outline" onClick={() => loadReservations(true)} disabled={loading || refreshing}>
            <RefreshCw size={16} aria-hidden="true" /> {refreshing ? "Actualisation…" : "Actualiser"}
          </button>
          <button type="button" className="button button-primary" onClick={exportCsv} disabled={!filtered.length}>
            <Download size={16} aria-hidden="true" /> Exporter CSV
          </button>
        </div>
      </div>

      <div className="workshop-reservation-stats">
        <article><span>Toutes les demandes</span><strong>{counts.all}</strong></article>
        <article><span>En attente</span><strong>{counts.pending}</strong></article>
        <article><span>Confirmées</span><strong>{counts.confirmed}</strong></article>
        <article><span>Annulées</span><strong>{counts.cancelled}</strong></article>
        <article><span>Remboursées</span><strong>{counts.refunded}</strong></article>
      </div>

      <div className="workshop-reservation-filters">
        <label className="workshop-reservation-search"><Search size={17} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un nom, téléphone ou atelier…" aria-label="Rechercher une réservation" /></label>
        <label className="workshop-reservation-status-filter">Statut
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
            <option value="refunded">Remboursées</option>
          </select>
        </label>
      </div>

      {error && <div className="workshop-reservation-error" role="alert"><AlertCircle size={18} /> <span>{error}</span></div>}
      {loading ? <div className="community-empty">Chargement des réservations…</div> : !error && filtered.length === 0 ? <div className="community-empty"><Ticket size={32} /><h3>Aucune réservation trouvée</h3><p>Les nouvelles demandes apparaîtront ici lorsqu'elles seront enregistrées dans Supabase.</p></div> : (
        <div className="workshop-reservation-table-wrap">
          <table className="workshop-reservation-table">
            <thead><tr><th>Client</th><th>Atelier</th><th>Montant</th><th>Statut</th><th>Paiement</th><th>Réservation</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map((row) => {
              const workshop = workshops[row.workshop_id];
              return <tr key={row.id}>
                <td><strong>{row.full_name}</strong><span>{row.phone}</span><small>{row.id}</small></td>
                <td><strong>{workshop?.title || "Atelier indisponible"}</strong>{workshop?.starts_at && <span><CalendarDays size={13} /> {dateTime(workshop.starts_at)}</span>}{workshop?.location && <span>{workshop.location}</span>}</td>
                <td>{money(row.amount_xaf)}</td>
                <td><span className={`workshop-status-pill workshop-status-${row.status}`}>{statusLabels[row.status] || row.status}</span></td>
                <td>{row.payment_reference ? <><strong>{row.payment_reference}</strong><span>{dateTime(row.payment_verified_at)}</span></> : <span>Non vérifié</span>}</td>
                <td>{dateTime(row.created_at)}</td>
                <td><div className="workshop-reservation-row-actions">
                  {row.status === "pending" && <button type="button" className="button button-primary" onClick={() => { setActionReservation(row); setActionType("confirmed"); setPaymentReference(row.payment_reference || ""); setActionNote(""); }}><CheckCircle2 size={14}/> Confirmer paiement</button>}
                  {row.status !== "cancelled" && row.status !== "refunded" && <button type="button" className="button button-outline" onClick={() => { setActionReservation(row); setActionType("cancelled"); setPaymentReference(""); setActionNote(""); }}><XCircle size={14}/> Annuler</button>}
                  {row.status === "confirmed" && <button type="button" className="button button-outline" onClick={() => { setActionReservation(row); setActionType("refunded"); setPaymentReference(row.payment_reference || ""); setActionNote(""); }}><RotateCcw size={14}/> Remboursé</button>}
                </div></td>
              </tr>
            })}</tbody>
          </table>
          <div className="workshop-reservation-mobile-list">{filtered.map((row) => {
            const workshop = workshops[row.workshop_id];
            return <article className="workshop-reservation-mobile-card" key={`mobile-${row.id}`}>
              <div className="workshop-reservation-mobile-card-top"><strong>{row.full_name}</strong><span className={`workshop-status-pill workshop-status-${row.status}`}>{statusLabels[row.status] || row.status}</span></div>
              <p>{row.phone}</p><h3>{workshop?.title || "Atelier indisponible"}</h3>
              <div className="workshop-reservation-mobile-meta"><span>Montant : <strong>{money(row.amount_xaf)}</strong></span><span>Créée le : {dateTime(row.created_at)}</span><span>Paiement : {row.payment_reference || "Non vérifié"}</span></div>
              <div className="workshop-reservation-row-actions">
                {row.status === "pending" && <button type="button" className="button button-primary" onClick={() => { setActionReservation(row); setActionType("confirmed"); setPaymentReference(row.payment_reference || ""); setActionNote(""); }}><CheckCircle2 size={14}/> Confirmer paiement</button>}
                {row.status !== "cancelled" && row.status !== "refunded" && <button type="button" className="button button-outline" onClick={() => { setActionReservation(row); setActionType("cancelled"); setPaymentReference(""); setActionNote(""); }}><XCircle size={14}/> Annuler</button>}
                {row.status === "confirmed" && <button type="button" className="button button-outline" onClick={() => { setActionReservation(row); setActionType("refunded"); setPaymentReference(row.payment_reference || ""); setActionNote(""); }}><RotateCcw size={14}/> Remboursé</button>}
              </div>
            </article>;
          })}</div>
          <p className="workshop-reservation-footnote">Affichage de {filtered.length} réservation(s) sur {reservations.length}. Confirme uniquement après vérification effective du paiement. Le statut « Remboursée » doit être utilisé après avoir réellement effectué le remboursement.</p>
        </div>
      )}
      {actionReservation && <div className="atelier-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !actionBusy) setActionReservation(null); }}>
        <section className="atelier-reservation-modal workshop-admin-action-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-action-title">
          <button type="button" className="atelier-modal-close" onClick={() => setActionReservation(null)} aria-label="Fermer" disabled={actionBusy}>×</button>
          <span className="eyebrow">GESTION DE RÉSERVATION</span>
          <h2 id="reservation-action-title">{actionType === "confirmed" ? "Confirmer le paiement" : actionType === "cancelled" ? "Annuler la réservation" : "Enregistrer le remboursement"}</h2>
          <p><strong>{actionReservation.full_name}</strong> — {money(actionReservation.amount_xaf)}</p>
          {actionType === "confirmed" && <label>Référence de transaction vérifiée<input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} required minLength={4} placeholder="Référence reçue sur le compte Mobile Money" /></label>}
          {actionType !== "confirmed" && <label>Note interne {actionType === "refunded" ? "(obligatoire)" : "(facultatif)"}<textarea value={actionNote} onChange={(event) => setActionNote(event.target.value)} required={actionType === "refunded"} placeholder={actionType === "refunded" ? "Référence ou preuve du remboursement effectué" : "Motif de l'annulation"} rows={3}/></label>}
          {actionType === "confirmed" && <p className="workshop-reservation-footnote">Ce bouton enregistre la vérification administrative. Vérifie d'abord la transaction dans ton compte Mobile Money.</p>}
          {error && <div className="workshop-reservation-error" role="alert">{error}</div>}
          <form onSubmit={updateReservationStatus} className="workshop-admin-action-buttons">
            <button type="button" className="button button-outline" onClick={() => setActionReservation(null)} disabled={actionBusy}>Retour</button>
            <button type="submit" className="button button-primary" disabled={actionBusy}>{actionBusy ? "Enregistrement…" : actionType === "confirmed" ? "Confirmer le paiement" : actionType === "cancelled" ? "Confirmer l'annulation" : "Confirmer le remboursement"}</button>
          </form>
        </section>
      </div>}
    </section>
  );
}
