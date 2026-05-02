import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import PublicHome from './pages/PublicHome';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicHome />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
            </Routes>
        </BrowserRouter>
    );
}
