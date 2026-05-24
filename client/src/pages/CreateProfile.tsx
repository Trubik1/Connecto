import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { saveUserId, saveProfile as storeProfile } from '../services/userStorage';
import { UserPlus, Plus } from 'lucide-react';

const INTERESTS = ['frontend', 'backend', 'дизайн', 'AI', 'fintech', 'карьера', 'стартапы', 'аналитика'];

export default function CreateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    role: '',
    tags: [] as string[],
    contact: '',
    age: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [touched, setTouched] = useState({
    name: false,
    contact: false,
    tags: false,
  });
  const [customTag, setCustomTag] = useState('');

  // Check if user already has profile
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      api.get(`/users/${userId}`).then(res => {
        const u = res.data;
        if (u.name || u.firstName) {
          setForm({
            name: u.firstName || u.name || '',
            role: u.profession || u.role || '',
            tags: u.hobbies || u.tags || [],
            contact: u.contact || '',
            age: u.age ? String(u.age) : '',
          });
          storeProfile({
            name: u.firstName || u.name || '',
            role: u.profession || u.role || '',
            contact: u.contact || '',
            tags: u.hobbies || u.tags || [],
          });
        }
      }).catch(() => { }).finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, []);

  const toggleTag = (tag: string) => {
    setForm(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags.slice(0, 5) };
    });
  };

  const addCustomTag = () => {
    if (customTag.trim() && !form.tags.includes(customTag.trim()) && form.tags.length < 5) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const validateTelegram = (username: string) => {
    const tgRegex = /^@[a-zA-Z0-9_]{3,}$/;
    return tgRegex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTouched = {
      name: !form.name.trim(),
      contact: !form.contact.trim(),
      tags: form.tags.length === 0,
    };
    setTouched(newTouched);
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error('Имя и Telegram обязательны');
      return;
    }
    if (form.tags.length === 0) {
      toast.error('Выберите хотя бы один тег интересов');
      return;
    }
    if (!form.contact.startsWith('@')) {
      toast.error('Telegram должен начинаться с @');
      return;
    }
    const username = form.contact.slice(1);
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Telegram может содержать только английские буквы, цифры и подчеркивание');
      return;
    }
    if (username.length < 3) {
      toast.error('Telegram username должен быть не менее 3 символов');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        tags: form.tags,
        contact: form.contact,
        age: form.age ? parseInt(form.age) : undefined,
      };

      const userId = localStorage.getItem('currentUserId');
      let res;
      if (userId) {
        res = await api.put(`/users/profile/${userId}`, payload);
      } else {
        res = await api.post('/users/profile', payload);
        if (res.data && res.data.id) {
          localStorage.setItem('currentUserId', res.data.id);
        }
      }

      if (res.data && (res.data.id || userId)) {
        if (res.data.id) saveUserId(String(res.data.id));
        storeProfile({
          name: form.name.trim(),
          role: form.role.trim(),
          contact: form.contact,
          tags: form.tags,
        });
        toast.success('Профиль сохранён!');
        navigate('/profile');
      } else {
        console.error('Profile save response error:', res);
        toast.error('Не удалось сохранить профиль');
      }
    } catch (err: any) {
      console.error('Profile save error:', err);
      const message = err.response?.data?.error || err.message || 'Ошибка сохранения профиля';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter">
        <div className="spinner w-10 h-10 border-2 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 page-enter" style={{ background: 'linear-gradient(165deg, #e0f8f5 0%, #b8f0e9 25%, #a0eae3 50%, #88e3dd 75%, #6dd9d6 100%)' }}>
      <div className="card-modern w-full max-w-md card-enter" style={{
        borderRadius: '1.75rem',
        padding: '1.5rem',
        boxShadow: '0 20px 60px rgba(0, 105, 92, 0.20), inset 0 2px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(0,77,64,0.08)',
        border: 'none',
      }}>
        <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-4 text-center">Создать профиль</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Имя *</label>
            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                className={`input-field ${touched.name && !form.name.trim() ? 'input-error' : ''}`}
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setTouched({ ...touched, name: true }); }}
                required
              />
              <label>Ваше имя</label>
            </div>
            {touched.name && !form.name.trim() && <p className="text-red-500 text-sm mt-1">Введите имя</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Возраст</label>
            <div className="input-group">
              <input
                type="number"
                placeholder=" "
                className="input-field"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                min="1"
              />
              <label>Лет</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Роль или должность</label>
            <input
              type="text"
              placeholder="Product Manager, Frontend Developer..."
              className="input-field"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>
              Теги интересов ({form.tags.length}/5) - кастомные не участвуют в матчинге
            </label>
            {touched.tags && form.tags.length === 0 && <p className="text-red-500 text-sm mb-1">Выберите хотя бы один тег</p>}
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  className={`btn-tag ${form.tags.includes(tag) ? 'btn-tag-active' : ''}`}
                  onClick={() => toggleTag(tag)}
                  disabled={!form.tags.includes(tag) && form.tags.length >= 5}
                >
                  {tag}
                </button>
              ))}
            </div>
            {form.tags.filter(t => !INTERESTS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.filter(t => !INTERESTS.includes(t)).map(t => (
                  <span key={t} className="tag-selected">
                    {t}
                    <span onClick={() => removeTag(t)} className="ml-1 cursor-pointer">×</span>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Добавить кастомный интерес"
                className="input-field flex-1"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                disabled={form.tags.length >= 5}
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={form.tags.length >= 5 || !customTag.trim()}
                className="btn-add w-10 h-10"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Telegram *</label>
            <div className="input-group">
              <input
                type="text"
                placeholder=" "
                className={`input-field ${touched.contact && !form.contact.trim() ? 'input-error' : ''}`}
                value={form.contact}
                onChange={e => {
                  let val = e.target.value;
                  if (val.length > 0 && !val.startsWith('@')) {
                    val = '@' + val;
                  }
                  if (val.startsWith('@')) {
                    const username = val.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
                    val = '@' + username;
                  }
                  setForm({ ...form, contact: val });
                  setTouched({ ...touched, contact: true });
                }}
                required
              />
              <label>@username</label>
            </div>
            {touched.contact && !form.contact.trim() && <p className="text-red-500 text-sm mt-1">Введите Telegram</p>}
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center gap-2 py-3">
            {isLoading ? <div className="spinner w-5 h-5 border-2"></div> : <UserPlus size={20} />}
            Сохранить профиль
          </button>
        </form>
      </div>
    </div>
  );
}