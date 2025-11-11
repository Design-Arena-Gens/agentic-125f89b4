import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../services/api';
import type { Member, PerformanceCategory, PerformanceRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Performance.module.css';

type PerformanceRow = PerformanceRecord & { member?: Member };

const categories: PerformanceCategory[] = [
  'MECHANICAL',
  'ELECTRONICS',
  'PROGRAMMING',
  'STRATEGY',
  'DESIGN',
  'OUTREACH',
];

const PerformancePage = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [records, setRecords] = useState<PerformanceRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    memberId: '',
    category: 'MECHANICAL',
    score: '80',
    rating: '8',
    notes: '',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const loadMembers = useCallback(async () => {
    const response = await api.get<{ members: Member[] }>('/members');
    setMembers(response.data.members);
  }, []);

  const loadPerformance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.role === 'MEMBER' && user.memberId) {
        const response = await api.get<{ performance: PerformanceRow[] }>(
          `/performance/member/${user.memberId}`,
        );
        setRecords(response.data.performance);
      } else {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        const response = await api.get<{ performance: PerformanceRow[] }>(
          `/performance${params.size ? `?${params.toString()}` : ''}`,
        );
        setRecords(response.data.performance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load performance records');
    } finally {
      setLoading(false);
    }
  }, [category, user?.role, user?.memberId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    void loadPerformance();
  }, [loadPerformance]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/performance', {
        memberId: Number(form.memberId),
        category: form.category,
        score: Number(form.score),
        rating: Number(form.rating),
        notes: form.notes || undefined,
      });
      setForm((prev) => ({ ...prev, notes: '' }));
      await loadPerformance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record performance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.layout}>
      <section className={styles.filters}>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {error ? <span style={{ color: '#ef4444' }}>{error}</span> : null}
      </section>

      <section className={styles.table}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading performance...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Category</th>
                <th>Score</th>
                <th>Rating</th>
                <th>Recorded</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    {record.member
                      ? `${record.member.firstName} ${record.member.lastName}`
                      : user?.member?.firstName ?? '—'}
                  </td>
                  <td>{record.category}</td>
                  <td>{record.score}/100</td>
                  <td>{record.rating}/10</td>
                  <td>{dayjs(record.recordedAt).format('DD MMM YYYY')}</td>
                  <td>{record.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {canManage ? (
        <section className={styles.formCard}>
          <h2>Log performance update</h2>
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <label htmlFor="memberId">
              Member
              <select
                id="memberId"
                value={form.memberId}
                onChange={(event) => setForm((prev) => ({ ...prev, memberId: event.target.value }))}
                required
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="category">
              Category
              <select
                id="category"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="score">
              Score
              <input
                id="score"
                type="number"
                min={0}
                max={100}
                value={form.score}
                onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))}
                required
              />
            </label>
            <label htmlFor="rating">
              Rating
              <input
                id="rating"
                type="number"
                min={1}
                max={10}
                value={form.rating}
                onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
                required
              />
            </label>
            <label htmlFor="notes" style={{ gridColumn: '1 / -1' }}>
              Notes
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
            <div className={styles.actions} style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? 'Saving...' : 'Record update'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
};

export default PerformancePage;
