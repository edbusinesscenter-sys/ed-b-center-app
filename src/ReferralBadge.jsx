import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Solde de parrainage affiché près du profil ; un clic ouvre la page Parrainage.
export default function ReferralBadge() {
  const [value, setValue] = useState(null);
  useEffect(() => {
    supabase.rpc("my_referral_hub").then(({ data, error }) => {
      if (!error && data && typeof data.available === "number") setValue(data.available);
    });
  }, []);
  if (value === null) return null;
  return (
    <button type="button" className="referral-badge" onClick={() => window.dispatchEvent(new CustomEvent("ed-navigate", { detail: "referral" }))}>
      <span>Solde parrainage</span>
      <strong>{Number(value).toLocaleString("fr-FR")} FCFA</strong>
    </button>
  );
}
