import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../../services/api';
import type { AttendanceRecord, AttendanceStatus, Member } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Attendance.module.css';

type AttendanceRow = {
  member: Member;
  status: AttendanceStatus;
  notes: string;
};

const statuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];

const AttendancePage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const loadMembers = useCallback(async () => {
    try {
      const response = await api.get<{ members: Member[] }>('/members');
      setMembers(response.data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load members');
      setLoading(false);
    }
  }, []);

  const loadAttendance = useCallback(
    async (selectedDate: string) => {
      if (members.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<{ attendance: (AttendanceRecord & { member: Member })[] }>(
          `/attendance?date=${selectedDate}`,
        );
        const attendanceMap = new Map<number, AttendanceRecord & { member: Member }>();
        response.data.attendance.forEach((record) => {
          attendanceMap.set(record.memberId, record);
        });
        setRows(
          members.map((member) => {
            const record = attendanceMap.get(member.id);
            return {
              member,
              status: record?.status ?? 'PRESENT',
              notes: record?.notes ?? '',
            };
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load attendance');
      } finally {
        setLoading(false);
      }
    },
    [members],
  );

  useEffect(() => {
    setLoading(true);
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (members.length === 0) return;
    void loadAttendance(date);
  }, [members, date, loadAttendance]);

  const handleStatusChange = (memberId: number, status: AttendanceStatus) => {
    setRows((current) =>
      current.map((row) =>
        row.member.id === memberId
          ? {
              ...row,
              status,
            }
          : row,
      ),
    );
  };

  const handleNoteChange = (memberId: number, notes: string) => {
    setRows((current) =>
      current.map((row) => (row.member.id === memberId ? { ...row, notes } : row)),
    );
  };

  const handleSave = async () => {
    if (!canManage) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = rows.map((row) => ({
        memberId: row.member.id,
        date,
        status: row.status,
        notes: row.notes || undefined,
      }));
      await api.post('/attendance/bulk', { records: payload });
      setMessage('Attendance updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const attendanceSummary = useMemo(() => {
    const totals = { PRESENT: 0, LATE: 0, ABSENT: 0, EXCUSED: 0 } as Record<AttendanceStatus, number>;
    rows.forEach((row) => {
      totals[row.status] += 1;
    });
    return totals;
  }, [rows]);

  if (loading) {
    return <div>Loading attendance...</div>;
  }

  return (
    <div className={styles.grid}>
      <section className={styles.filters}>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <div style={{ display: 'flex', gap: '18px', color: '#4b5563' }}>
          {statuses.map((statusKey) => (
            <div key={statusKey}>
              <strong>{statusKey}:</strong> {attendanceSummary[statusKey]}
            </div>
          ))}
        </div>
        {message ? <span style={{ color: '#16a34a' }}>{message}</span> : null}
        {error ? <span style={{ color: '#ef4444' }}>{error}</span> : null}
      </section>

      <section className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Department</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.member.id}>
                <td>
                  {row.member.firstName} {row.member.lastName}
                </td>
                <td>{row.member.department}</td>
                <td>
                  <select
                    value={row.status}
                    onChange={(event) =>
                      handleStatusChange(row.member.id, event.target.value as AttendanceStatus)
                    }
                    disabled={!canManage}
                  >
                    {statuses.map((statusKey) => (
                      <option key={statusKey} value={statusKey}>
                        {statusKey}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={row.notes}
                    placeholder="Optional note"
                    onChange={(event) => handleNoteChange(row.member.id, event.target.value)}
                    disabled={!canManage}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {canManage ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save attendance'}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AttendancePage;
