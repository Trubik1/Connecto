import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface LikedUser {
  id: number;
  firstName?: string;
  name?: string;
  profession?: string;
  role?: string;
  hobbies?: string[];
  tags?: string[];
  age?: number;
}

export default function Lenta() {
  const { eventId } = useParams<{ eventId: string }>();
  const userId = localStorage.getItem('currentUserId');
  const [users, setUsers] = useState<any[]>([]);
  const [filterTag, setFilterTag] = useState('');
  const [view, setView] = useState<'all' | 'recommendations' | 'contacts'>('all');
  const [contacts, setContacts] = useState<any[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [likedMe, setLikedMe] = useState<LikedUser[]>([]);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [currentLike, setCurrentLike] = useState<LikedUser | null>(null);

  const fetchUsers = async () => {
    if (!eventId || !userId) return;
    let endpoint;
    if (view === 'recommendations') {
      endpoint = `/users/event/${eventId}/recommendations?userId=${userId}`;
    } else {
      endpoint = `/users/event/${eventId}/registered?userId=${userId}`;
    }
    const res = await api.get(endpoint);
    setUsers(res.data);
  };

  const checkLikedMe = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}/liked-me`);
      if (res.data.length > 0 && likedMe.length !== res.data.length) {
        const newLikes = res.data.filter((u: LikedUser) => !likedMe.some(l => l.id === u.id));
        if (newLikes.length > 0) {
          setLikedMe(res.data);
          setCurrentLike(newLikes[0]);
          setShowLikeModal(true);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchUsers();
    checkLikedMe();
    const interval = setInterval(checkLikedMe, 10000);
    return () => clearInterval(interval);
  }, [view, eventId, userId]);

  const filtered = filterTag
    ? users.filter((u) => u.tags?.includes(filterTag))
    : users;

  const sendInterest = async (toUserId: number) => {
    try {
      const res = await api.post('/users/interest', { fromUserId: Number(userId), toUserId });
      setSentIds(prev => new Set(prev).add(toUserId));
      // If match happened, add to matchedIds
      if (res.data?.matched) {
        setMatchedIds(prev => new Set(prev).add(toUserId));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  // Load matched contacts
  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}/contacts`).then(res => {
        const matched = new Set<number>();
        res.data.forEach((c: any) => matched.add(c.id));
        setMatchedIds(matched);
      }).catch(() => {});
    }
  }, [userId]);

  // Fixed loadContacts function
  const loadContacts = async () => {
    const res = await api.get(`/users/${userId}/contacts`);
    setContacts(res.data);
    setShowContacts(true);
    setView('contacts');
  };

  const handleLikeBack = async (likedUserId: number) => {
    await sendInterest(likedUserId);
    setShowLikeModal(false);
    setLikedMe(prev => prev.filter(u => u.id !== likedUserId));
  };

  const handleSkipLike = () => {
    setShowLikeModal(false);
    setLikedMe(prev => {
      const newArr = [...prev];
      newArr.shift();
      return newArr;
    });
    if (likedMe.length > 1) {
      setCurrentLike(likedMe[1]);
      setShowLikeModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-white pb-20">
      {/* Модальное окно лайка */}
      {showLikeModal && currentLike && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                {(currentLike.firstName || currentLike.name || '?').charAt(0)}
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {currentLike.firstName || currentLike.name}
              </h3>
              <p className="text-sm text-gray-500">{currentLike.profession || currentLike.role}</p>
              <p className="text-xs text-gray-400 mt-2">{currentLike.hobbies?.join(', ') || 'Интересы не указаны'}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleSkipLike} 
                className="flex-1 py-3 rounded-xl border border-teal-200 text-teal-600 font-medium hover:bg-teal-50 transition-colors"
              >
                Пропустить
              </button>
              <button 
                onClick={() => handleLikeBack(currentLike.id)} 
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                Лайкнуть обратно
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Премиальные кнопки-табы */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl shadow-md" style={{ boxShadow: '0 6px 20px rgba(0,188,212,0.12)' }}>
          {['all', 'recommendations', 'contacts'].map(key => (
            <button
              key={key}
              type="button"
              onClick={() => { 
                setView(key as any); 
                if (key === 'contacts') {
                  loadContacts();
                } else {
                  setShowContacts(false);
                }
              }}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                view === key && !showContacts 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                  : 'text-teal-600 hover:bg-teal-50'
              }`}
            >
              {key === 'all' ? '👥 Участники' : key === 'recommendations' ? '✨ Рекомендации' : '🤝 Мои контакты'}
            </button>
          ))}
        </div>

        {!showContacts && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Поиск по тегу..."
              className="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            />
          </div>
        )}

{!showContacts ? (
           filtered.length === 0 ? (
             <div className="text-center py-12">
               <div className="text-5xl mb-3">👥</div>
               <p className="text-gray-500 font-medium">Участники не найдены</p>
             </div>
           ) : (
             <div className="space-y-4">
               {filtered.map((u, index) => (
                 <div 
                   key={u.id} 
                   className="user-card"
                   style={{ animationDelay: `${index * 50}ms` }}
                 >
                   <div className="flex-1">
                     <h3 className="font-bold text-lg text-gray-800">
                       {u.name}
                       {u.age && <span className="text-teal-600 font-normal">, {u.age} лет</span>}
                       {u.role && <span className="text-gray-500 text-sm font-normal"> • {u.role}</span>}
                     </h3>
                     <p className="text-sm text-gray-600 mt-1">{u.tags?.join(', ') || 'интересы не указаны'}</p>
                     {u.commonTags > 0 && (
                       <div className="mt-2 inline-block px-3 py-1 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full text-xs font-medium text-teal-700">
                         {u.commonTags} общих интересов
                       </div>
                     )}
                   </div>
                    {/* После взаимного матча показываем телеграмм */}
                    {matchedIds.has(u.id) ? (
                      <div className="mt-3 pt-3" style={{borderTop: '1px solid rgba(128,222,234,0.3)'}}>
                       <p className="text-teal-600 font-medium text-sm">Контакт: {u.contact}</p>
                     </div>
                   ) : sentIds.has(u.id) ? (
                     <button disabled className="mt-3 w-full py-2 rounded-xl bg-gray-100 text-gray-400 font-medium">
                       Запрос отправлен ✓
                     </button>
                   ) : (
                     <button 
                       type="button" 
                       onClick={() => sendInterest(u.id)} 
                       className="btn-primary w-full mt-3 py-2"
                     >
                       Хочу познакомиться
                     </button>
                   )}
                 </div>
               ))}
             </div>
           )
         ) : (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>🤝</span> Мои контакты
            </h3>
            {contacts.length === 0 ? (
              <div className="text-center py-12 bg-white/60 rounded-2xl" style={{boxShadow:'0 2px 8px rgba(0,150,136,0.06)'}}>
                <p className="text-gray-500">Пока нет взаимных контактов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="user-card">
                    <p className="font-medium text-gray-800">{c.name} <span className="text-gray-500 font-normal">({c.role})</span></p>
                    <p className="text-teal-600 mt-1 font-medium">{c.contact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}