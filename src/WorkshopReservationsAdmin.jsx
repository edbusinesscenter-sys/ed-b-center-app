import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { RefreshCw, Download, Search, Ticket, CalendarDays, AlertCircle } from "lucide-react";

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
  }), [reservations]);

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
            <thead><tr><th>Client</th><th>Atelier</th><th>Montant</th><th>Statut</th><th>Paiement</th><th>Réservation</th></tr></thead>
            <tbody>{filtered.map((row) => {
              const workshop = workshops[row.workshop_id];
              return <tr key={row.id}>
                <td><strong>{row.full_name}</strong><span>{row.phone}</span><small>{row.id}</small></td>
                <td><strong>{workshop?.title || "Atelier indisponible"}</strong>{workshop?.starts_at && <span><CalendarDays size={13} /> {dateTime(workshop.starts_at)}</span>}{workshop?.location && <span>{workshop.location}</span>}</td>
                <td>{money(row.amount_xaf)}</td>
                <td><span className={`workshop-status-pill workshop-status-${row.status}`}>{statusLabels[row.status] || row.status}</span></td>
                <td>{row.payment_reference ? <><strong>{row.payment_reference}</strong><span>{dateTime(row.payment_verified_at)}</span></> : <span>Non vérifié</span>}</td>
                <td>{dateTime(row.created_at)}</td>
              </tr>;
            })}</tbody>
          </table>
          <div className="workshop-reservation-mobile-list">{filtered.map((row) => {
            const workshop = workshops[row.workshop_id];
            return <article className="workshop-reservation-mobile-card" key={`mobile-${row.id}`}>
              <div className="workshop-reservation-mobile-card-top"><strong>{row.full_name}</strong><span className={`workshop-status-pill workshop-status-${row.status}`}>{statusLabels[row.status] || row.status}</span></div>
              <p>{row.phone}</p><h3>{workshop?.title || "Atelier indisponible"}</h3>
              <div className="workshop-reservation-mobile-meta"><span>Montant : <strong>{money(row.amount_xaf)}</strong></span><span>Créée le : {dateTime(row.created_at)}</span><span>Paiement : {row.payment_reference || "Non vérifié"}</span></div>
            </article>;
          })}</div>
          <p className="workshop-reservation-footnote">Affichage de {filtered.length} réservation(s) sur {reservations.length}. Les tickets ne sont pas confirmés depuis cette interface : la confirmation doit provenir d'une vérification de paiement fiable.</p>
        </div>
      )}
    </section>
  );
}
