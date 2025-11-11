import { NavLink, Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';
import styles from './DashboardLayout.module.css';

interface NavItem {
  label: string;
  to: string;
  icon: string;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: '📊' },
  { label: 'Members', to: '/members', icon: '🤖', roles: ['ADMIN', 'INSTRUCTOR'] },
  { label: 'Attendance', to: '/attendance', icon: '🗓️', roles: ['ADMIN', 'INSTRUCTOR'] },
  { label: 'Performance', to: '/performance', icon: '⭐' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const items = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => !item.roles || item.roles.includes(user.role));
  }, [user]);

  const initials = user?.member
    ? `${user.member.firstName.at(0) ?? ''}${user.member.lastName.at(0) ?? ''}`.toUpperCase()
    : user?.email.at(0)?.toUpperCase() ?? 'V';

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Vinyasa Club
          <br />
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
            Attendance & Performance
          </span>
        </div>
        <nav>
          <ul className={styles.navList}>
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.logout}>
          <button type="button" className={styles.logoutButton} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Welcome back, {user?.member?.firstName ?? user?.email.split('@')[0]}</h1>
          <div className={styles.headerSubtitle}>Track attendance, performance, and growth</div>
        </div>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{user?.member?.firstName ?? user?.email}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user?.role}</div>
          </div>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
