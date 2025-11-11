import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../services/api';
import type { Member } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import MembersTable from '../../components/shared/MembersTable';
import styles from './Members.module.css';

const defaultForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  batch: '',
  joinDate: dayjs().format('YYYY-MM-DD'),
  status: 'Active',
  position: '',
  skills: '',
  notes: '',
};

const MembersPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (department) params.append('department', department);
      const response = await api.get<{ members: Member[] }>(`/members?${params.toString()}`);
      setMembers(response.data.members);
      if (response.data.members.length) {
        const existing = response.data.members.find((item) => item.id === selectedMemberId);
        if (!existing) {
          setSelectedMemberId(response.data.members[0].id);
        }
      } else {
        setSelectedMemberId(null);
        setSelectedMember(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch members');
    } finally {
      setLoading(false);
    }
  }, [search, status, department, selectedMemberId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!selectedMemberId) return;
    const fetchDetails = async () => {
      setDetailError(null);
      try {
        const response = await api.get<{ member: Member }>(`/members/${selectedMemberId}`);
        setSelectedMember(response.data.member);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : 'Failed to load member insights');
      }
    };
    void fetchDetails();
  }, [selectedMemberId]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    try {
      if (editingMember) {
        const response = await api.put<{ member: Member }>(`/members/${editingMember.id}`, form);
        setMembers((current) =>
          current.map((member) => (member.id === editingMember.id ? response.data.member : member)),
        );
      } else {
        const response = await api.post<{ member: Member }>('/members', form);
        setMembers((current) => [response.data.member, ...current]);
      }
      setShowForm(false);
      setForm(defaultForm);
      setEditingMember(null);
      void loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save member');
    }
  };

  const handleDelete = async (member: Member) => {
    if (!canManage) return;
    if (!confirm(`Remove ${member.firstName} ${member.lastName}?`)) return;
    try {
      await api.delete(`/members/${member.id}`);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      if (selectedMemberId === member.id) {
        setSelectedMemberId(null);
        setSelectedMember(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete member');
    }
  };

  const startCreate = () => {
    setForm(defaultForm);
    setEditingMember(null);
    setShowForm(true);
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      department: member.department,
      batch: member.batch,
      joinDate: dayjs(member.joinDate).format('YYYY-MM-DD'),
      status: member.status,
      position: member.position,
      skills: member.skills,
      notes: member.notes ?? '',
    });
    setShowForm(true);
  };

  const departments = useMemo(
    () => Array.from(new Set(members.map((member) => member.department))).sort(),
    [members],
  );

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className={styles.layout}>
      <section>
        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder="Search members or VIN"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Core">Core</option>
            <option value="Trainee">Trainee</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option value="">All Departments</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {canManage ? (
            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} onClick={startCreate}>
                + Add member
              </button>
            </div>
          ) : null}
        </div>
        {error ? <div style={{ color: '#ef4444' }}>{error}</div> : null}
        <MembersTable
          members={members}
          canEdit={canManage}
          onEdit={startEdit}
          onDelete={handleDelete}
          onView={(member) => setSelectedMemberId(member.id)}
        />
      </section>

      {showForm && canManage ? (
        <section className={styles.panel}>
          <h2>{editingMember ? 'Update Member' : 'Create Member'}</h2>
          <form className={styles.formGrid} onSubmit={handleFormSubmit}>
            <div className={styles.field}>
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="department">Department</label>
              <input
                id="department"
                value={form.department}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, department: event.target.value }))
                }
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="batch">Batch</label>
              <input
                id="batch"
                value={form.batch}
                onChange={(event) => setForm((prev) => ({ ...prev, batch: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="joinDate">Join Date</label>
              <input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, joinDate: event.target.value }))
                }
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <input
                id="status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="position">Position</label>
              <input
                id="position"
                value={form.position}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, position: event.target.value }))
                }
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="skills">Skills</label>
              <input
                id="skills"
                value={form.skills}
                onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
                required
              />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className={styles.panelActions} style={{ gridColumn: '1 / -1' }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setShowForm(false);
                  setEditingMember(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton}>
                {editingMember ? 'Save changes' : 'Create member'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {selectedMember ? (
        <section className={styles.panel}>
          <h2>{selectedMember.firstName} {selectedMember.lastName}</h2>
          {detailError ? <div style={{ color: '#ef4444' }}>{detailError}</div> : null}
          <div className={styles.infoGrid}>
            <div>
              <strong>Role:</strong> <span>{selectedMember.position}</span>
            </div>
            <div>
              <strong>Skills radar:</strong> <span>{selectedMember.skills}</span>
            </div>
            <div>
              <strong>Member since:</strong>{' '}
              <span>{dayjs(selectedMember.joinDate).format('DD MMM YYYY')}</span>
            </div>
            <div>
              <strong>Attendance (recent 5):</strong>{' '}
              <span>
                {selectedMember.attendance
                  ?.slice(0, 5)
                  .map((item) => `${dayjs(item.date).format('DD MMM')}: ${item.status}`)
                  .join(' • ') ?? 'No records'}
              </span>
            </div>
            <div>
              <strong>Performance streak:</strong>{' '}
              <span>
                {selectedMember.performance
                  ?.slice(0, 5)
                  .map((item) => `${item.category} ${item.score}/100`)
                  .join(' • ') ?? 'No performance entries'}
              </span>
            </div>
            <div>
              <strong>Notes:</strong> <span>{selectedMember.notes ?? '—'}</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default MembersPage;
