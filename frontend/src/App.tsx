import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/Login';
import DashboardPage from './pages/Dashboard/Dashboard';
import MembersPage from './pages/Members/Members';
import AttendancePage from './pages/Attendance/Attendance';
import PerformancePage from './pages/Performance/Performance';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route element={<ProtectedRoute allowed={['ADMIN', 'INSTRUCTOR']} />}>
          <Route path="members" element={<MembersPage />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
        <Route path="performance" element={<PerformancePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
