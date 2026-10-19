import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { imageUrl } from "./imageCatalog";

function CommunitySection({ user, profile, onNotify, onPointsUpdated }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const currentPoints = Number(profile?.community_points ?? profile?.points ?? 0);

  async function loadPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("publications")
      .select("id, user_id, title, content, image_url, category, is_published, created_at")
      .eq("is_published", true)
      .eq("category", "community")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Chargement des publications :", error.message);
      onNotify?.("Impossible de charger les publications. Vérifie les autorisations Supabase.");
      setPosts([]);
      setLoading(false);
      return;
    }

    const rows = data || [];
    const publicationIds = rows.map((post) => post.id);
    const authorIds = [...new Set(rows.map((post) => post.user_id).filter(Boolean))];

    let reactions = [];
    if (publicationIds.length) {
      const { data: interactionData, error: interactionError } = await supabase
        .from("publication_interactions")
        .select("id, publication_id, user_id, interaction_type, content, created_at")
        .in("publication_id", publicationIds);

      if (interactionError) {
        console.error("Chargement des interactions :", interactionError.message);
      } else {
        reactions = interactionData || [];
      }
    }

    // Charger uniquement les champs de profil nécessaires à l'affichage.
    // La sécurité de la lecture publique doit aussi être réglée côté Supabase.
    let profilesById = {};
    if (authorIds.length) {
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", authorIds);

      if (profileError) {
        console.error("Chargement des auteurs :", profileError.message);
      } else {
        profilesById = Object.fromEntries((profileRows || []).map((row) => [row.id, row]));
      }
    }

    setPosts(rows.map((post) => ({
      ...post,
      // Alias de compatibilité avec le JSX ci-dessous.
      body: post.content,
      author_id: post.user_id,
      profiles: profilesById[post.user_id] || null,
      interactions: reactions.filter((reaction) => reaction.publication_id === post.id),
    })));
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
    // Chargement initial du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPost(event) {
    event.preventDefault();
    if (!user) {
      onNotify?.("Connecte-toi pour publier.");
      return;
    }
    if (!newBody.trim()) {
      onNotify?.("Écris le contenu de ta publication.");
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("publications").insert({
      title: newTitle.trim() || null,
      content: newBody.trim(),
      image_url: newImageUrl.trim() || null,
      user_id: user.id,
      category: "community",
      is_published: true,
    });
    setCreating(false);

    if (error) {
      console.error("Création publication :", error.message);
      onNotify?.("Impossible de publier. Vérifie les autorisations Supabase.");
      return;
    }

    setNewTitle("");
    setNewBody("");
    setNewImageUrl("");
    onNotify?.("Publication ajoutée à la communauté.");
    await loadPosts();
  }

  async function deletePost(post) {
    if (!user || post.user_id !== user.id) return;
    if (!window.confirm("Supprimer ta publication ? Cette action est définitive.")) return;

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", post.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Suppression publication :", error.message);
      onNotify?.("Impossible de supprimer cette publication.");
      return;
    }

    onNotify?.("Publication supprimée.");
    await loadPosts();
  }

  async function interact(postId, type) {
    if (!user) {
      onNotify?.("Connecte-toi pour interagir avec une publication.");
      return;
    }

    const content = type === "comment" ? (comments[postId] || "").trim() : null;
    if (type === "comment" && !content) {
      onNotify?.("Écris un commentaire avant de l’envoyer.");
      return;
    }

    setSending(postId + type);
    const { data, error } = await supabase.rpc("interact_with_publication", {
      p_publication_id: postId,
      p_interaction_type: type,
      p_content: content,
    });
    setSending(null);

    if (error) {
      console.error("Interaction publication :", error.message);
      onNotify?.("Impossible d’enregistrer l’action. Vérifie la fonction SQL et les autorisations Supabase.");
      return;
    }

    const pointsAdded = Number(data?.points_added ?? 0);
    if (pointsAdded > 0) {
      // La fonction SQL renvoie le nombre de points ajoutés, pas le total du profil.
      // On met à jour l'affichage localement; le profil pourra être rechargé par le parent.
      onPointsUpdated?.(currentPoints + pointsAdded);
      onNotify?.(`Interaction enregistrée : +${pointsAdded} point${pointsAdded > 1 ? "s" : ""}.`);
    } else if (data?.status === "unliked") {
      onNotify?.("Tu as retiré ton J’aime.");
    } else {
      onNotify?.(type === "like" ? "J’aime enregistré." : "Commentaire enregistré.");
    }

    if (type === "comment") {
      setComments((previous) => ({ ...previous, [postId]: "" }));
    }
    await loadPosts();
  }

  return (
    <section className="community-section section-container">
      <div className="community-heading">
        <div>
          <span className="eyebrow">LA COMMUNAUTÉ ED B-CENTER</span>
          <h1>Communauté</h1>
          <p>Découvre les publications, réagis et échange avec les autres membres.</p>
        </div>
        <div className="community-points" title="Ton total de points">
          <span>★</span><strong>{currentPoints}</strong><small>POINTS</small>
        </div>
      </div>

      <img
        className="community-interface-preview"
        src={imageUrl("banniere-communaute-ed-b-center.png")}
        alt="Aperçu de l'espace Communauté"
        loading="lazy"
      />

      <div className="points-explainer">
        ★ Les points affichés sont gérés par Supabase selon les règles de la communauté.
      </div>

      <div className="community-guides">
        <article>
          <img src={imageUrl("publication-communaute-01-decouvrir-la-communaute.png")} alt="Découvrir la communauté" loading="lazy" />
          <h2>Découvrir la communauté</h2>
          <p>Consulte les publications partagées dans cet espace.</p>
        </article>
        <article>
          <img src={imageUrl("publication-communaute-02-interagir-et-commenter.png")} alt="Interagir et commenter" loading="lazy" />
          <h2>Interagir et commenter</h2>
          <p>Connecte-toi pour aimer une publication ou ajouter un commentaire.</p>
        </article>
        <article>
          <img src={imageUrl("publication-communaute-03-profils-et-abonnements.png")} alt="Profils et abonnements" loading="lazy" />
          <h2>Découvrir les membres</h2>
          <p>Explore les profils publics et les possibilités de suivi disponibles.</p>
        </article>
      </div>

      {user && (
        <form className="community-create-form" onSubmit={createPost}>
          <h2>Partager avec la communauté</h2>
          <label>
            Titre (facultatif)
            <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} maxLength={180} placeholder="Le titre de ta publication" />
          </label>
          <label>
            Ton message
            <textarea value={newBody} onChange={(event) => setNewBody(event.target.value)} required maxLength={5000} rows={4} placeholder="Partage une idée, une expérience ou une question…" />
          </label>
          <label>
            URL d'une image (facultatif)
            <input type="url" value={newImageUrl} onChange={(event) => setNewImageUrl(event.target.value)} placeholder="https://…" />
          </label>
          <button className="button button-primary" type="submit" disabled={creating}>
            {creating ? "Publication…" : "Publier"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="community-empty">Chargement des publications…</div>
      ) : posts.length === 0 ? (
        <div className="community-empty">
          <img src={imageUrl("illustration-conversation-vide.png")} alt="Aucune publication pour le moment" loading="lazy" />
          <h2>Aucune publication pour le moment</h2>
          <p>Les publications publiées par l’équipe apparaîtront ici.</p>
        </div>
      ) : (
        <div className="publication-list">
          {posts.map((post) => {
            const interactions = post.interactions || [];
            const liked = interactions.some((reaction) => reaction.user_id === user?.id && reaction.interaction_type === "like");
            const postComments = interactions
              .filter((reaction) => reaction.interaction_type === "comment")
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            return (
              <article className="publication-card" key={post.id}>
                <div className="publication-author">
                  {post.profiles?.avatar_url ? (
                    <img className="publication-avatar" src={post.profiles.avatar_url} alt="" loading="lazy" />
                  ) : (
                    <div className="publication-avatar">ED</div>
                  )}
                  <div>
                    <strong>{post.profiles?.full_name || "ED BUSINESS CENTER"}</strong>
                    <small>{new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</small>
                  </div>
                </div>

                {post.title && <h2>{post.title}</h2>}
                <p className="publication-body">{post.content}</p>
                {post.image_url && <img className="publication-image" src={post.image_url} alt={post.title || "Publication ED B-CENTER"} loading="lazy" />}

                <div className="publication-stats">
                  <span>♥ {interactions.filter((reaction) => reaction.interaction_type === "like").length} J’aime</span>
                  <span>▢ {postComments.length} commentaire(s)</span>
                </div>

                <div className="publication-actions">
                  <button
                    type="button"
                    className={liked ? "publication-action liked" : "publication-action"}
                    disabled={sending === post.id + "like"}
                    onClick={() => interact(post.id, "like")}
                  >
                    {liked ? "♥ Aimé" : "♡ J’aime"}
                  </button>
                  <span className="publication-action-divider" />
                  <label className="publication-comment-label" htmlFor={`comment-${post.id}`}>Commenter</label>
                  {user?.id === post.user_id && (
                    <button type="button" className="publication-action publication-delete-action" onClick={() => deletePost(post)}>
                      Supprimer
                    </button>
                  )}
                </div>

                {postComments.map((comment) => (
                  <div className="publication-comment" key={comment.id}>
                    <strong>{comment.user_id === user?.id ? "Vous" : "Membre"}</strong>
                    <p>{comment.content}</p>
                  </div>
                ))}

                <form className="publication-comment-form" onSubmit={(event) => { event.preventDefault(); interact(post.id, "comment"); }}>
                  <input
                    id={`comment-${post.id}`}
                    value={comments[post.id] || ""}
                    onChange={(event) => setComments((previous) => ({ ...previous, [post.id]: event.target.value }))}
                    placeholder="Écrire un commentaire…"
                    maxLength={1000}
                  />
                  <button className="button button-primary" type="submit" disabled={sending === post.id + "comment"}>
                    Envoyer
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CommunitySection;
