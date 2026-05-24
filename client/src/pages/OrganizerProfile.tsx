import { useState, useEffect } from 'react';
import api from '../services/api';
import { Edit3, Save, X, Plus, Trash2 } from 'lucide-react';

interface User {
  id: number;
  firstName?: string;
  name?: string;
  contact?: string;
  age?: number;
  hobbies?: string[];
  tags?: string[];
}

const INTERESTS = ['frontend', 'backend', 'дизайн', 'AI', 'fintech', 'карьера', 'стартапы', 'аналитика'];

export default function OrganizerProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', age: '', hobbies: [] as string[] });
  const [customInterest, setCustomInterest] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      api.get(`/users/${userId}`).then(res => {
        const u = res.data;
        setUser(u);
        setForm({
          name: u.firstName || u.name || '',
          contact: u.contact || '',
          age: u.age || '',
          hobbies: u.hobbies || u.tags || [],
        });
      }).catch(() => { });
    }
  }, []);

  const toggleTag = (tag: string) => {
    setForm(prev => {
      const hobbies = prev.hobbies.includes(tag)
        ? prev.hobbies.filter(t => t !== tag)
        : [...prev.hobbies, tag];
      return { ...prev, hobbies: hobbies.slice(0, 5) };
    });
  };

  const addCustomTag = () => {
    if (customInterest.trim() && !form.hobbies.includes(customInterest.trim()) && form.hobbies.length < 5) {
      setForm(prev => ({ ...prev, hobbies: [...prev.hobbies, customInterest.trim()] }));
      setCustomInterest('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, hobbies: prev.hobbies.filter(t => t !== tag) }));
  };

  const handleSave = async () => {
    try {
      const res = await api.put(`/users/profile/${user!.id}`, {
        firstName: form.name.trim(),
        contact: form.contact,
        age: form.age ? parseInt(form.age, 10) : null,
        hobbies: form.hobbies,
      });
      setUser(res.data);
      setEditMode(false);
      setForm({
        name: res.data.firstName || '',
        contact: res.data.contact || '',
        age: res.data.age || '',
        hobbies: res.data.hobbies || [],
      });
    } catch (err: any) {
      console.error('Save error:', err);
      alert(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter">
        <div className="spinner w-12 h-12 border-3 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 page-enter" style={{ background: 'linear-gradient(165deg, #e0f8f5 0%, #b8f0e9 25%, #a0eae3 50%, #88e3dd 75%, #6dd9d6 100%)' }}>
      <div className="max-w-md mx-auto space-y-4 sm:space-y-5">

        {/* Карточка профиля */}
        <div className="profile-card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {(user.firstName || user.name || '?').charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-teal-800">{user.firstName || user.name}</h2>
              <p className="text-sm text-teal-600">{form.hobbies.length} интересов</p>
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
              <input type="text" placeholder=" " value={form.contact} onChange={e => {
                let val = e.target.value;
                if (val.length > 0 && !val.startsWith('@')) val = '@' + val;
                const username = val.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
                setForm({ ...form, contact: '@' + username });
              }}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-transparent' : ''}`}
              />
              <label>Telegram</label>
            </div>
            <div className="input-group">
              <input type="number" placeholder=" " value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-transparent' : ''}`}
                min="1"
              />
              <label>Возраст</label>
            </div>
          </div>

          {/* Интересы */}
          <div className="mt-5">
            <label className="text-sm font-semibold text-teal-700 mb-2 block">
              Интересы ({form.hobbies.length}/5)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(tag => (
                <button type="button" key={tag} onClick={() => editMode && toggleTag(tag)}
                  disabled={!editMode || (!form.hobbies.includes(tag) && form.hobbies.length >= 5)}
                  className={`btn-tag ${form.hobbies.includes(tag) ? 'btn-tag-active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {form.hobbies.filter(t => !INTERESTS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.hobbies.filter(t => !INTERESTS.includes(t)).map(t => (
                  <span key={t} className="tag-selected">
                    {t}
                    {editMode && (
                      <span onClick={() => removeTag(t)} className="ml-1 cursor-pointer text-teal-800">×</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {form.hobbies.length < 5 && editMode && (
              <div className="flex gap-2 mt-2">
                <input type="text" placeholder="Добавить кастомный интерес" value={customInterest}
                  onChange={e => setCustomInterest(e.target.value)}
                  className="input-field flex-1"
                />
                <button type="button" onClick={addCustomTag} className="btn-add w-10 h-10">
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>

          {editMode && (
            <button onClick={handleSave} className="btn-primary w-full mt-5 py-2.5">
              <Save size={16} /> Сохранить профиль
            </button>
          )}
        </div>
      </div>
    </div>
  );
}