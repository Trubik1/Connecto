import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateProfile from './pages/CreateProfile';
import JoinByCode from './pages/JoinByCode';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDashboard from './pages/EventDashboard';
import Lenta from './pages/Lenta';
import Requests from './pages/Requests';
import Contacts from './pages/Contacts';
import Match from './pages/Match';
import OrganizerProfile from './pages/OrganizerProfile';
import ParticipantProfile from './pages/ParticipantProfile.jsx';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/create" element={<CreateProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/join" element={<JoinByCode />} />
        <Route path="/join/:qr" element={<JoinByCode />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/event/:eventId" element={<Layout><EventDashboard /></Layout>} />
        <Route path="/event/:eventId/edit" element={<Layout><EditEvent /></Layout>} />
        <Route path="/lenta/:eventId" element={<Layout><Lenta /></Layout>} />
        <Route path="/requests" element={<Layout><Requests /></Layout>} />
        <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
        <Route path="/match/:eventId" element={<Layout><Match /></Layout>} />
        <Route path="/match" element={<Match />} />
        <Route path="/organizer/profile" element={<Layout><OrganizerProfile /></Layout>} />
        <Route path="/participant/profile" element={<Layout><ParticipantProfile /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}