import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Requests() {
  const userId = localStorage.getItem('currentUserId');
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}/incoming-requests`).then(res => setRequests(res.data));
    }
  }, [userId]);

  const respond = async (interestId: number, action: 'accept' | 'reject') => {
    await api.put('/users/interest', { interestId, action });
    setRequests(prev => prev.filter(r => r.id !== interestId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 page-enter">
      <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-4">Входящие запросы</h2>
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white/40 rounded-2xl">
          <p className="text-gray-500">Нет новых запросов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{req.fromUser.name}</p>
                <p className="text-sm text-gray-500">{req.fromUser.role}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="button" onClick={() => respond(req.id, 'accept')} className="btn-primary flex-1 sm:flex-none text-sm px-4 py-2">Принять</button>
                <button type="button" onClick={() => respond(req.id, 'reject')} className="btn-secondary flex-1 sm:flex-none text-sm px-4 py-2">Пропустить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}