import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, MessageCircle } from 'lucide-react';

export default function Contacts() {
  const userId = localStorage.getItem('currentUserId');
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}/contacts`).then(res => setContacts(res.data));
    }
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 page-enter">
      <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-4 flex items-center gap-2">
        <Users size={22} className="text-teal-600" />
        Мои контакты
      </h2>
      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white/40 rounded-2xl">
          <MessageCircle size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">У вас пока нет подтверждённых контактов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="font-bold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">{c.role}</p>
              </div>
              <a
                href={`https://t.me/${c.contact?.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                {c.contact}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}