import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Users, Calendar, MapPin, Tag, Sparkles } from 'lucide-react';

interface User {
  id: number;
  firstName?: string;
  name?: string;
  profession?: string;
  role?: string;
  hobbies?: string[];
  tags?: string[];
  age?: number;
  contact?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  tags?: string[];
}

export default function Match() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (eventId) {
      api.get(`/events/${eventId}`).then(r => setEvent(r.data)).catch(() => { });
      loadUsers();
      loadMatched();
    }
  }, [eventId]);

  const loadUsers = async () => {
    const userId = localStorage.getItem('currentUserId');
    if (!eventId) return;
    const res = await api.get(`/users/event/${eventId}/registered?userId=${userId}`);
    setUsers(res.data);
  };

  const loadMatched = async () => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return;
    const res = await api.get(`/users/${userId}/contacts`);
    const ids = res.data.map((c: User) => c.id);
    setMatchedIds(new Set(ids));
  };

  const handleJoin = () => {
    navigate('/profile/create');
  };

  const filtered = users.filter((u) =>
    (u.firstName || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.profession || u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 sm:pb-4" style={{ background: 'linear-gradient(160deg, #e0f7f4 0%, #f0fff8 40%, #ffffff 100%)', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <div className="px-4 sm:px-6 pt-6 max-w-2xl mx-auto">
        {/* Кнопка назад */}
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center mb-4 shadow-md hover:shadow-lg transition-shadow">
          <ArrowLeft size={18} className="text-teal-700" />
        </button>

        {/* Карточка мероприятия */}
        {event && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-teal-200/50 shadow-lg mb-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles size={22} className="text-teal-600 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent m-0">
                {event.title}
              </h1>
            </div>
            <p className="text-sm text-teal-700/70 mb-3 leading-relaxed">{event.description}</p>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-teal-700">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> {event.start_date} — {event.end_date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {event.location || 'Онлайн'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} /> {users.length} участников
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(event.tags || []).map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  <Tag size={10} className="inline mr-1 align-middle" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Кнопка присоединиться */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto mb-4">
        <button onClick={handleJoin} className="w-full py-4 rounded-full border-none bg-gradient-to-r from-teal-700 to-cyan-600 text-white font-bold text-base shadow-lg cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
          ✦ Присоединиться к мероприятию
        </button>
      </div>

      {/* Поиск */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Поиск по имени или профессии..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-teal-200 text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-teal-300 transition-shadow"
        />
      </div>

      {/* Список участников */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-teal-500">
            <p className="font-semibold text-base">Участники не найдены</p>
          </div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="flex items-start gap-3.5 p-4 rounded-2xl border border-teal-100 bg-white/70 backdrop-blur-md mb-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-md">
                {(u.firstName || u.name || '?').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base text-teal-900">
                  {u.firstName || u.name}
                  {u.age && <span className="text-xs sm:text-sm text-teal-500 font-normal ml-1.5">, {u.age} лет</span>}
                </div>
                <div className="text-xs sm:text-sm text-teal-600 mt-0.5">{u.profession || u.role}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(u.hobbies || u.tags || []).map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                      {tag}
                    </span>
                  ))}
                </div>
                {matchedIds.has(u.id) ? (
                  <div className="mt-2 text-xs sm:text-sm text-teal-700 font-semibold">
                    Telegram: {u.contact}
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] sm:text-xs text-gray-400">
                    Telegram будет доступен после взаимного лайка
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}