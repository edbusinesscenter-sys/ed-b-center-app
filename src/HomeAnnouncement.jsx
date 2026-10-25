import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { imageUrl } from "./imageCatalog";

export default function HomeAnnouncement() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.from("home_announcement").select("*").eq("singleton", true).maybeSingle().then(({ data, error }) => {
      if (active && !error) setItem(data);
    });
    return () => { active = false; };
  }, []);

  if (!item || !item.is_published) return null;
  const date = item.event_date
    ? new Date(`${item.event_date}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const facts = [["Jour", item.event_day], ["Date", date], ["Prix", item.price]].filter(([, value]) => value);

  return (
    <section className="home-announcement section-container" aria-label="Annonce">
      <figure className="home-announcement-image">
        <img src={/^https?:\/\//i.test(item.image_name) ? item.image_name : imageUrl(item.image_name)} alt={item.title || "Annonce"} width="1122" height="1402" />
      </figure>
      <div className="home-announcement-info">
        <span className="eyebrow">ANNONCE</span>
        {item.title && <h2>{item.title}</h2>}
        {item.description && <p>{item.description}</p>}
        {facts.length > 0 ? (
          <dl className="announcement-facts">
            {facts.map(([label, value]) => (
              <div key={label} className={label === "Prix" ? "announcement-fact announcement-price" : "announcement-fact"}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : <p>Informations à venir.</p>}
      </div>
    </section>
  );
}
