import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import { supabase } from './supabaseClient';

export default function AdminDashboard({ onBack }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMembers() {
    setLoading(true);
    setError('');

    try {
      // Vérifier le rôle de l'utilisateur connecté
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error('Session utilisateur introuvable.');
      }

      const { data: roleData, error: roleError } =
        await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

      if (roleError) throw roleError;

      if (roleData?.role !== 'admin') {
        throw new Error(
          "Accès refusé : cet espace est réservé à l'administrateur."
        );
      }

      // Récupérer les membres autorisés par les règles RLS
      const { data, error: membersError } =
        await supabase
          .from('profiles')
          .select('id, full_name, email, created_at')
          .order('created_at', { ascending: false });

      if (membersError) throw membersError;

      setMembers(data || []);
    } catch (err) {
      setError(
        err?.message ||
          'Impossible de charger la liste des membres.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      (member.full_name || '').toLowerCase().includes(query) ||
      (member.email || '').toLowerCase().includes(query) ||
      (member.id || '').toLowerCase().includes(query)
    );
  });

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <button
          type="button"
          onClick={onBack}
          className="admin-back-button"
        >
          <ArrowLeft size={18} />
          Retour à l'accueil
        </button>

        <div className="admin-title">
          <ShieldCheck size={28} />

          <div>
            <h1>Administration</h1>
            <p>Gestion des membres ED B-CENTER</p>
          </div>
        </div>
      </header>

      <section className="admin-stats">
        <div className="admin-stat-card">
          <Users size={28} />

          <div>
            <span>Total des membres</span>
            <strong>
              {loading ? '…' : members.length}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-members">
        <div className="admin-members-heading">
          <div>
            <h2>Liste des membres</h2>
            <p>
              {filteredMembers.length} résultat(s)
            </p>
          </div>

          <button
            type="button"
            onClick={loadMembers}
            disabled={loading}
            className="admin-refresh"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>
        </div>

        <label className="admin-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Rechercher un nom, un e-mail ou un identifiant…"
          />
        </label>

        {loading && (
          <p role="status">
            Chargement des membres…
          </p>
        )}

        {error && (
          <div className="form-message form-error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Identifiant</th>
                  <th>E-mail</th>
                  <th>Date d'inscription</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.full_name || 'Membre'}
                    </td>

                    <td className="admin-id">
                      {member.id}
                    </td>

                    <td>
                      {member.email || 'Non renseigné'}
                    </td>

                    <td>
                      {member.created_at
                        ? new Date(
                            member.created_at
                          ).toLocaleDateString('fr-FR')
                        : 'Non renseignée'}
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      Aucun membre trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
            }
