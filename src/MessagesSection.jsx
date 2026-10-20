import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, RefreshCw, CheckCheck, Inbox } from "lucide-react";

export default function MessagesSection({ user, onNotify }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("user_messages")
      .select("id, sender_id, recipient_id, subject, body, related_reservation_id, created_at, read_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(100);
    if (queryError) {
      console.error("Chargement de la messagerie :", queryError.message);
      setMessages([]);
      setError("La messagerie interne n'est pas encore disponible. Applique la migration SQL de messagerie et réservations dans Supabase.");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function markRead(message) {
    if (message.recipient_id !== user.id || message.read_at) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("user_messages").update({ read_at: readAt }).eq("id", message.id).eq("recipient_id", user.id);
    if (updateError) {
      onNotify?.("Impossible de marquer ce message comme lu.");
      return;
    }
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read_at: readAt } : item));
  }

  return <section className="account-tab-content internal-messages-section">
    <div className="account-section-title">
      <div><span className="eyebrow">COMMUNICATION</span><h2>Ma messagerie</h2><p>Messages de confirmation et échanges liés à tes réservations.</p></div>
      <button type="button" className="button button-outline" onClick={loadMessages} disabled={loading}><RefreshCw size={16} aria-hidden="true" /> Actualiser</button>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    {loading ? <div className="community-empty">Chargement des messages…</div> : !error && messages.length === 0 ? <div className="empty-state"><Inbox size={36} /><h3>Aucun message pour le moment</h3><p>Les confirmations de paiement et les messages importants apparaîtront ici.</p></div> : <div className="internal-message-list">{messages.map((message) => {
      const received = message.recipient_id === user.id;
      return <article key={message.id} className={`internal-message-card ${received && !message.read_at ? "is-unread" : ""}`}>
        <div className="internal-message-icon"><Mail size={19} aria-hidden="true" /></div>
        <div className="internal-message-content"><div className="internal-message-heading"><strong>{message.subject}</strong><small>{new Date(message.created_at).toLocaleString("fr-FR")}</small></div><p>{message.body}</p>{message.related_reservation_id && <small className="internal-message-reference">Réservation : {message.related_reservation_id}</small>}{received && !message.read_at && <button type="button" className="notification-mark" onClick={() => markRead(message)}><CheckCheck size={14} /> Marquer comme lu</button>}</div>
        <span className="internal-message-direction">{received ? "Reçu" : "Envoyé"}</span>
      </article>;
    })}</div>}
  </section>;
}
