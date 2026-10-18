import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  BookOpen,
  CalendarDays,
  Search,
  RefreshCw,
  ShieldCheck,
  Plus,
  GraduationCap,
  X,
} from 'lucide-react';

import { supabase } from './supabaseClient';

const EMPTY_COURSE = {
  title: '',
  description: '',
  category: '',
  duration_hours: '',
  price_fcfa: '',
  status: 'active',
};

const EMPTY_SESSION = {
  course_id: '',
  title: '',
  trainer_id: '',
  start_date: '',
  end_date: '',
  schedule: '',
  location: '',
  capacity: '6',
  status: 'planned',
};

export default function AdminDashboard({ onBack }) {
  const [tab, setTab] = useState('overview');

  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION);

  const [editingCourseId, setEditingCourseId] = useState(null);

  const [trainers, setTrainers] = useState([]);

  async function loadData() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error('Session utilisateur introuvable. Connecte-toi à nouveau.');
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) throw roleError;

      if (roleData?.role !== 'admin') {
        throw new Error("Accès refusé : cet espace est réservé à l'administrateur.");
      }

      const [
        membersResult,
        coursesResult,
        sessionsResult,
        trainersResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, created_at')
          .order('created_at', { ascending: false }),

        supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('training_sessions')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('role', 'formatrice'),
      ]);

      if (membersResult.error) throw membersResult.error;
      if (coursesResult.error) throw coursesResult.error;
      if (sessionsResult.error) throw sessionsResult.error;
      if (trainersResult.error) throw trainersResult.error;

      const trainerIds = (trainersResult.data || []).map(
        (item) => item.user_id
      );

      let trainerProfiles = [];

      if (trainerIds.length > 0) {
        const { data, error: trainerProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', trainerIds);

        if (trainerProfilesError) throw trainerProfilesError;

        trainerProfiles = data || [];
      }

      setMembers(membersResult.data || []);
      setCourses(coursesResult.data || []);
      setSessions(sessionsResult.data || []);
      setTrainers(trainerProfiles);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function notifySuccess(message) {
    setSuccess(message);
    setError('');
  }

  function updateCourseField(event) {
    const { name, value } = event.target;

    setCourseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateSessionField(event) {
    const { name, value } = event.target;

    setSessionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openNewCourse() {
    setCourseForm(EMPTY_COURSE);
    setEditingCourseId(null);
    setShowCourseForm(true);
    setError('');
    setSuccess('');
  }

  function openEditCourse(course) {
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      duration_hours: course.duration_hours ?? '',
      price_fcfa: course.price_fcfa ?? '',
      status: course.status || 'active',
    });

    setEditingCourseId(course.id);
    setShowCourseForm(true);
    setError('');
    setSuccess('');
  }

  async function saveCourse(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const title = courseForm.title.trim();

      if (!title) {
        throw new Error('Le nom de la formation est obligatoire.');
      }

      const duration =
        courseForm.duration_hours === ''
          ? null
          : Number(courseForm.duration_hours);

      const price =
        courseForm.price_fcfa === ''
          ? null
          : Number(courseForm.price_fcfa);

      if (duration !== null && (!Number.isInteger(duration) || duration < 0)) {
        throw new Error('La durée doit être un nombre entier positif.');
      }

      if (price !== null && (!Number.isInteger(price) || price < 0)) {
        throw new Error('Le prix doit être un montant positif.');
      }

      const payload = {
        title,
        description: courseForm.description.trim() || null,
        category: courseForm.category.trim() || null,
        duration_hours: duration,
        price_fcfa: price,
        status: courseForm.status,
      };

      let result;

      if (editingCourseId) {
        result = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingCourseId);
      } else {
        result = await supabase
          .from('courses')
          .insert(payload);
      }

      if (result.error) throw result.error;

      setShowCourseForm(false);
      setCourseForm(EMPTY_COURSE);
      setEditingCourseId(null);

      await loadData();
      notifySuccess(
        editingCourseId
          ? 'Formation modifiée avec succès.'
          : 'Formation créée avec succès.'
      );
    } catch (err) {
      setError(err?.message || 'Impossible d’enregistrer la formation.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleCourseStatus(course) {
    const nextStatus = course.status === 'active' ? 'inactive' : 'active';

    const confirmed = window.confirm(
      `Voulez-vous ${nextStatus === 'active' ? 'activer' : 'désactiver'} la formation « ${course.title} » ?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ status: nextStatus })
        .eq('id', course.id);

      if (updateError) throw updateError;

      await loadData();

      notifySuccess(
        nextStatus === 'active'
          ? 'Formation activée.'
          : 'Formation désactivée.'
      );
    } catch (err) {
      setError(err?.message || 'Impossible de modifier cette formation.');
    } finally {
      setSaving(false);
    }
  }

  async function saveSession(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!sessionForm.course_id) {
        throw new Error('Choisis une formation.');
      }

      if (!sessionForm.title.trim()) {
        throw new Error('Le nom de la session est obligatoire.');
      }

      if (
        sessionForm.start_date &&
        sessionForm.end_date &&
        sessionForm.end_date < sessionForm.start_date
      ) {
        throw new Error('La date de fin doit être postérieure à la date de début.');
      }

      const capacity = Number(sessionForm.capacity);

      if (!Number.isInteger(capacity) || capacity < 1) {
        throw new Error('La capacité doit être au minimum de 1 apprenant.');
      }

      const payload = {
        course_id: sessionForm.course_id,
        title: sessionForm.title.trim(),
        trainer_id: sessionForm.trainer_id || null,
        start_date: sessionForm.start_date || null,
        end_date: sessionForm.end_date || null,
        schedule: sessionForm.schedule.trim() || null,
        location: sessionForm.location.trim() || null,
        capacity,
        status: sessionForm.status,
      };

      const { error: insertError } = await supabase
        .from('training_sessions')
        .insert(payload);

      if (insertError) throw insertError;

      setShowSessionForm(false);
      setSessionForm(EMPTY_SESSION);

      await loadData();
      notifySuccess('Session créée avec succès.');
    } catch (err) {
      setError(err?.message || 'Impossible de créer la session.');
    } finally {
      setSaving(false);
    }
  }

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      (member.full_name || '').toLowerCase().includes(query) ||
      (member.email || '').toLowerCase().includes(query) ||
      (member.id || '').toLowerCase().includes(query)
    );
  });

  const activeCourses = courses.filter(
    (course) => course.status === 'active'
  ).length;

  const openSessions = sessions.filter(
    (session) =>
      session.status === 'planned' ||
      session.status === 'registration_open' ||
      session.status === 'in_progress'
  ).length;

  const tabs = [
    { id: 'overview', label: 'Vue générale', icon: ShieldCheck },
    { id: 'members', label: 'Membres', icon: Users },
    { id: 'courses', label: 'Formations', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
  ];

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
            <p>Gestion de ED B-CENTER</p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading || saving}
          className="admin-refresh"
        >
          <RefreshCw size={17} />
          Actualiser
        </button>
      </header>

      <nav className="admin-tabs" aria-label="Navigation administration">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`admin-tab ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setError('');
              setSuccess('');
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="admin-content">
        {error && (
          <div className="admin-message admin-message-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-message admin-message-success" role="status">
            {success}
          </div>
        )}

        {loading ? (
          <div className="admin-empty">Chargement des données…</div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <section className="admin-welcome">
                  <span className="admin-eyebrow">ESPACE ADMINISTRATEUR</span>
                  <h2>Bienvenue dans ton espace de gestion</h2>
                  <p>
                    Pilote les formations, les sessions et les membres de
                    ED B-CENTER depuis un seul endroit.
                  </p>
                </section>

                <section className="admin-stats">
                  <div className="admin-stat-card">
                    <Users size={25} />
                    <div>
                      <span>Total des membres</span>
                      <strong>{members.length}</strong>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <BookOpen size={25} />
                    <div>
                      <span>Formations actives</span>
                      <strong>{activeCourses}</strong>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <CalendarDays size={25} />
                    <div>
                      <span>Sessions en cours ou prévues</span>
                      <strong>{openSessions}</strong>
                    </div>
                  </div>
                </section>

                <section className="admin-panel">
                  <h2>Actions rapides</h2>

                  <div className="admin-quick-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('courses');
                        openNewCourse();
                      }}
                    >
                      <Plus size={19} />
                      Ajouter une formation
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTab('sessions');
                        setSessionForm({
                          ...EMPTY_SESSION,
                          course_id: courses.find(
                            (course) => course.status === 'active'
                          )?.id || '',
                        });
                        setShowSessionForm(true);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      <CalendarDays size={19} />
                      Créer une session
                    </button>

                    <button
                      type="button"
                      onClick={() => setTab('members')}
                    >
                      <Users size={19} />
                      Consulter les membres
                    </button>
                  </div>
                </section>
              </>
            )}

            {tab === 'members' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Liste des membres</h2>
                    <p>{filteredMembers.length} résultat(s)</p>
                  </div>
                </div>

                <label className="admin-search">
                  <Search size={18} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un nom, un e-mail ou un identifiant…"
                  />
                </label>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>E-mail</th>
                        <th>Identifiant</th>
                        <th>Inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member) => (
                        <tr key={member.id}>
                          <td>{member.full_name || 'Membre'}</td>
                          <td>{member.email || 'Non renseigné'}</td>
                          <td className="admin-id">{member.id}</td>
                          <td>
                            {member.created_at
                              ? new Date(member.created_at).toLocaleDateString('fr-FR')
                              : 'Non renseignée'}
                          </td>
                        </tr>
                      ))}

                      {filteredMembers.length === 0 && (
                        <tr>
                          <td colSpan={4}>Aucun membre trouvé.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === 'courses' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Gestion des formations</h2>
                    <p>{courses.length} formation(s) enregistrée(s)</p>
                  </div>

                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={openNewCourse}
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="admin-empty">
                    Aucune formation enregistrée. Clique sur « Ajouter » pour
                    créer la première.
                  </div>
                ) : (
                  <div className="admin-course-grid">
                    {courses.map((course) => (
                      <article className="admin-course-card" key={course.id}>
                        <div className="admin-course-icon">
                          <GraduationCap size={25} />
                        </div>

                        <span
                          className={`admin-status ${
                            course.status === 'active'
                              ? 'is-active'
                              : 'is-inactive'
                          }`}
                        >
                          {course.status === 'active' ? 'Active' : 'Inactive'}
                        </span>

                        <h3>{course.title}</h3>
                        <p>{course.description || 'Aucune description.'}</p>

                        <div className="admin-course-meta">
                          <span>
                            {course.duration_hours ?? '—'} h
                          </span>
                          <span>
                            {course.price_fcfa != null
                              ? `${Number(course.price_fcfa).toLocaleString('fr-FR')} FCFA`
                              : 'Prix à définir'}
                          </span>
                        </div>

                        <div className="admin-card-actions">
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => openEditCourse(course)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="admin-secondary-button"
                            disabled={saving}
                            onClick={() => toggleCourseStatus(course)}
                          >
                            {course.status === 'active'
                              ? 'Désactiver'
                              : 'Activer'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

                        {tab === 'sessions' && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Gestion des sessions</h2>
                    <p>{sessions.length} session(s) enregistrée(s)</p>
                  </div>

                  <button
                    type="button"
                    className="admin-primary-button"
                    onClick={() => {
                      setSessionForm({
                        ...EMPTY_SESSION,
                        course_id:
                          courses.find(
                            (course) => course.status === 'active'
                          )?.id || '',
                      });
                      setShowSessionForm(true);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={
                      courses.filter(
                        (course) => course.status === 'active'
                      ).length === 0
                    }
                  >
                    <Plus size={18} />
                    Créer une session
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="admin-empty">
                    Aucune session enregistrée.
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Session</th>
                          <th>Formation</th>
                          <th>Formatrice</th>
                          <th>Début</th>
                          <th>Statut</th>
                        </tr>
                      </thead>

                      <tbody>
                        {sessions.map((session) => {
                          const course = courses.find(
                            (item) => item.id === session.course_id
                          );

                          const trainer = trainers.find(
                            (item) => item.id === session.trainer_id
                          );

                          const statusLabels = {
                            planned: 'Prévue',
                            registration_open: 'Inscriptions ouvertes',
                            in_progress: 'En cours',
                            completed: 'Terminée',
                            cancelled: 'Annulée',
                          };

                          return (
                            <tr key={session.id}>
                              <td>{session.title}</td>
                              <td>{course?.title || 'Formation inconnue'}</td>
                              <td>
                                {trainer?.full_name ||
                                  trainer?.email ||
                                  'Non attribuée'}
                              </td>
                              <td>
                                {session.start_date
                                  ? new Date(
                                      `${session.start_date}T00:00:00`
                                    ).toLocaleDateString('fr-FR')
                                  : 'À définir'}
                              </td>
                              <td>
                                <span className="admin-status">
                                  {statusLabels[session.status] ||
                                    session.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* FORMULAIRE DE FORMATION */}

      {showCourseForm && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCourseForm(false);
            }
          }}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
          >
            <div className="admin-modal-heading">
              <div>
                <h2 id="course-modal-title">
                  {editingCourseId
                    ? 'Modifier la formation'
                    : 'Nouvelle formation'}
                </h2>
                <p>Renseigne les informations de la formation.</p>
              </div>

              <button
                type="button"
                className="admin-icon-button"
                aria-label="Fermer"
                onClick={() => setShowCourseForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCourse}>
              <label>
                Nom de la formation *
                <input
                  name="title"
                  value={courseForm.title}
                  onChange={updateCourseField}
                  required
                  placeholder="Ex. Infographie et intelligence artificielle"
                />
              </label>

              <label>
                Catégorie
                <input
                  name="category"
                  value={courseForm.category}
                  onChange={updateCourseField}
                  placeholder="Ex. Design et numérique"
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={courseForm.description}
                  onChange={updateCourseField}
                  placeholder="Présente brièvement la formation."
                />
              </label>

              <div className="admin-form-row">
                <label>
                  Durée (heures)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="duration_hours"
                    value={courseForm.duration_hours}
                    onChange={updateCourseField}
                  />
                </label>

                <label>
                  Prix (FCFA)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="price_fcfa"
                    value={courseForm.price_fcfa}
                    onChange={updateCourseField}
                  />
                </label>
              </div>

              <label>
                Statut
                <select
                  name="status"
                  value={courseForm.status}
                  onChange={updateCourseField}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setShowCourseForm(false)}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* FORMULAIRE DE SESSION */}

      {showSessionForm && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowSessionForm(false);
            }
          }}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
          >
            <div className="admin-modal-heading">
              <div>
                <h2 id="session-modal-title">Créer une session</h2>
                <p>Planifie une session et attribue une formatrice.</p>
              </div>

              <button
                type="button"
                className="admin-icon-button"
                aria-label="Fermer"
                onClick={() => setShowSessionForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveSession}>
              <label>
                Formation *
                <select
                  name="course_id"
                  value={sessionForm.course_id}
                  onChange={updateSessionField}
                  required
                >
                  <option value="">Choisir une formation</option>

                  {courses
                    .filter((course) => course.status === 'active')
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Nom de la session *
                <input
                  name="title"
                  value={sessionForm.title}
                  onChange={updateSessionField}
                  required
                  placeholder="Ex. Session pilote - Infographie et IA"
                />
              </label>

              <label>
                Formatrice
                <select
                  name="trainer_id"
                  value={sessionForm.trainer_id}
                  onChange={updateSessionField}
                >
                  <option value="">Pas encore attribuée</option>

                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.full_name ||
                        trainer.email ||
                        trainer.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-form-row">
                <label>
                  Date de début
                  <input
                    type="date"
                    name="start_date"
                    value={sessionForm.start_date}
                    onChange={updateSessionField}
                  />
                </label>

                <label>
                  Date de fin
                  <input
                    type="date"
                    name="end_date"
                    min={sessionForm.start_date || undefined}
                    value={sessionForm.end_date}
                    onChange={updateSessionField}
                  />
                </label>
              </div>

              <label>
                Horaires
                <input
                  name="schedule"
                  value={sessionForm.schedule}
                  onChange={updateSessionField}
                  placeholder="Ex. Lundi, mercredi et vendredi, 14 h–17 h"
                />
              </label>

              <div className="admin-form-row">
                <label>
                  Lieu
                  <input
                    name="location"
                    value={sessionForm.location}
                    onChange={updateSessionField}
                    placeholder="Ex. Douala ou en ligne"
                  />
                </label>

                <label>
                  Nombre de places
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="capacity"
                    value={sessionForm.capacity}
                    onChange={updateSessionField}
                    required
                  />
                </label>
              </div>

              <label>
                Statut
                <select
                  name="status"
                  value={sessionForm.status}
                  onChange={updateSessionField}
                >
                  <option value="planned">Prévue</option>
                  <option value="registration_open">
                    Inscriptions ouvertes
                  </option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setShowSessionForm(false)}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement…' : 'Créer la session'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
            }
