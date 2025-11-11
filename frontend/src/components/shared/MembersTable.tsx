import type { Member } from '../../types';
import styles from './Table.module.css';

interface MembersTableProps {
  members: Member[];
  canEdit?: boolean;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  onView?: (member: Member) => void;
}

const statusClass = (status: string) => {
  if (['Active', 'Core'].includes(status)) return styles.badgeGreen;
  if (['Trainee', 'Onboarding', 'Late'].includes(status)) return styles.badgeAmber;
  return styles.badgeSlate;
};

const MembersTable = ({ members, canEdit, onEdit, onDelete, onView }: MembersTableProps) => (
  <div className={styles.tableWrapper}>
    <table>
      <thead>
        <tr>
          <th>VIN ID</th>
          <th>Name</th>
          <th>Department</th>
          <th>Status</th>
          <th>Attendance</th>
          <th>Performance</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id}>
            <td>{member.vin}</td>
            <td>
              {member.firstName} {member.lastName}
            </td>
            <td>{member.department}</td>
            <td>
              <span className={`${styles.badge} ${statusClass(member.status)}`}>{member.status}</span>
            </td>
            <td>
              {member.attendanceSummary
                ? `${member.attendanceSummary.PRESENT ?? 0} present`
                : '—'}
            </td>
            <td>
              {member.performanceSummary?.averageScore
                ? `${member.performanceSummary.averageScore}/100`
                : '—'}
            </td>
            <td style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onView?.(member)}
                style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer' }}
              >
                View
              </button>
              {canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit?.(member)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0ea5e9',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(member)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MembersTable;
