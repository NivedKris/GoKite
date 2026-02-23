import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import B2BDashboardPage from './components/B2BDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default: redirect root → /b2c */}
        <Route path="/" element={<Navigate to="/b2c" replace />} />
        <Route path="/b2c" element={<DashboardPage />} />
        <Route path="/b2b" element={<B2BDashboardPage />} />
        {/* Catch-all → B2C */}
        <Route path="*" element={<Navigate to="/b2c" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
