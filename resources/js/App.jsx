import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminClubsPage from './pages/AdminClubsPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminPanel from './pages/AdminPanel';
import PublicHome from './pages/PublicHome';
import { adminPath } from './lib/adminRoutes';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicHome />} />
                <Route path={adminPath('clubs')} element={<AdminClubsPage />} />
                <Route path={adminPath('events')} element={<AdminEventsPage />} />
                <Route path={adminPath()} element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    );
}
