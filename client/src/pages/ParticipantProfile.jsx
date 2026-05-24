import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Activity, Bell, User, Edit3, Save, X } from 'lucide-react';

// ── Mock ──────────────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  id: 1,
  name: 'Марина Соколова',
  firstName: 'Марина',
  middleName: 'Александровна',
  role: 'UX/UI Designer',
  contact: '@marina_design',
  age: 27,
  hobbies: ['Дизайн', 'Фотография', 'Путешествия'],
  events: [
    { id: 1, title: 'IT-Конференция 2026', date: '2026-06-15', status: 'active' },
    { id: 2, title: 'Дизайн-хакатон', date: '2026-03-20', status: 'finished' },
  ],
  activity: [
    { date: '2026-05-12', action: 'Присоединилась к IT-Конференция 2026' },
    { date: '2026-05-10', action: 'Обновила профиль' },
    { date: '2026-04-28', action: 'Присоединилась к Дизайн-хакатон' },
  ],
};

// ── Страница ─────────────────────────────────────────────────────────────────
export default function ParticipantProfile() {
  const { eventId } = useParams?.() || {};
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'activity' | 'settings'
  const [form, setForm] = useState({ name: '', role: '', contact: '', tags: '' });

  useEffect(() => {
    // Демо-режим: используем мок
    if (!eventId) {
      setProfile(MOCK_PROFILE);
      setForm({ name: MOCK_PROFILE.name, role: MOCK_PROFILE.role, contact: MOCK_PROFILE.contact, tags: MOCK_PROFILE.hobbies.join(', ') });
      return;
    }
    api.get(`/users/${eventId}`).then(r => {
      const data = r.data;
      setProfile(data);
      setForm({ name: data.name || '', role: data.role || '', contact: data.contact || '', tags: (data.hobbies || []).join(', ') });
    }).catch(() => {
      setProfile(MOCK_PROFILE);
      setForm({ name: MOCK_PROFILE.name, role: MOCK_PROFILE.role, contact: MOCK_PROFILE.contact, tags: MOCK_PROFILE.hobbies.join(', ') });
    });
  }, [eventId]);

  const handleSave = () => {
    setProfile({ ...profile, ...form });
    setEditMode(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter">
        <div className="spinner w-10 h-10 border-3 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 page-enter" style={{ background: 'linear-gradient(165deg, #e0f8f5 0%, #b8f0e9 25%, #a0eae3 50%, #88e3dd 75%, #6dd9d6 100%)' }}>
      <div className="max-w-md mx-auto space-y-4 sm:space-y-5">

        {/* Кнопка назад */}
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-11 h-11 bg-white/70 backdrop-blur-md rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition-all shadow-md">
          <ArrowLeft size={18} />
        </button>

        {/* Карточка профиля */}
        <div className="profile-card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-teal-800">{profile.name}</h2>
              <p className="text-sm text-teal-600">{profile.role || 'Профессия не указана'}</p>
              {profile.contact && <p className="text-sm text-teal-700 font-medium mt-1">{profile.contact}</p>}
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center justify-center w-11 h-11 bg-teal-50 rounded-xl text-teal-600 hover:bg-teal-100 transition-all">
                <Edit3 size={16} />
              </button>
            ) : (
              <button onClick={() => setEditMode(false)} className="flex items-center justify-center w-11 h-11 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition-all">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Поля формы */}
          <div className="space-y-3">
            <div className="input-group">
              <input type="text" placeholder=" " value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-transparent' : ''}`}
              />
              <label>Имя</label>
            </div>
            <div className="input-group">
              <input type="text" placeholder=" " value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-transparent' : ''}`}
              />
              <label>Роль / Профессия</label>
            </div>
            <div className="input-group">
              <input type="text" placeholder=" " value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-transparent' : ''}`}
              />
              <label>Контакт</label>
            </div>
          </div>

          {editMode && (
            <button onClick={handleSave} className="btn-primary w-full mt-4 py-2.5">
              <Save size={16} /> Сохранить
            </button>
          )}
        </div>

        {/* Вкладки */}
        <div className="flex gap-1.5 p-1.5 bg-white/60 backdrop-blur-md rounded-xl border border-teal-200 shadow-md">
          {['events', 'activity', 'settings'].map(key => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              {key === 'events' ? 'Мероприятия' : key === 'activity' ? 'Активность' : 'Настройки'}
            </button>
          ))}
        </div>

        {/* Вкладка: Мероприятия */}
        {activeTab === 'events' && (
          <div className="space-y-3 pb-8">
            {(profile.events || MOCK_PROFILE.events).map(ev => (
              <div key={ev.id} onClick={() => navigate(`/event/${ev.id}`)} className="user-card cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 font-semibold text-teal-800">
                  <Calendar size={14} className="text-teal-600" /> {ev.title}
                </div>
                <div className="text-xs text-teal-600 mt-1">{ev.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Вкладка: Активность */}
        {activeTab === 'activity' && (
          <div className="space-y-2 pb-8">
            {(profile.activity || MOCK_PROFILE.activity).map((item, i) => (
              <div key={i} className="user-card !shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-teal-800">{item.action}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Вкладка: Настройки */}
        {activeTab === 'settings' && (
          <div className="card-modern">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-teal-800">
                  <Bell size={15} className="text-teal-600" /> Уведомления
                </div>
                <button className="w-11 h-6 bg-teal-600 rounded-full relative transition-colors">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-teal-800">
                  <Tag size={15} className="text-teal-600" /> Интересы
                </div>
                <button onClick={() => navigate('/profile/create')} className="text-xs font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-lg hover:bg-teal-200 transition-colors">
                  Редактировать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ParticipantProfile.propTypes = {
  eventId: PropTypes.string,
  profile: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    firstName: PropTypes.string,
    middleName: PropTypes.string,
    role: PropTypes.string,
    contact: PropTypes.string,
    hobbies: PropTypes.arrayOf(PropTypes.string),
    events: PropTypes.arrayOf(PropTypes.object),
    activity: PropTypes.arrayOf(PropTypes.object),
  }),
};
