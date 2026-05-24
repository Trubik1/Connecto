import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [touched, setTouched] = useState({ title: false });

  useEffect(() => {
    if (eventId) {
      api.get(`/events/${eventId}`).then((res) => {
        const event = res.data;
        setForm({
          title: event.title,
          description: event.description || '',
          tags: event.tags?.join(', ') || '',
          date: new Date(event.date),
          duration_days: event.duration_days || 1,
        });
      }).catch(() => navigate('/'));
    }
  }, [eventId]);

  if (!form) return <div className="min-h-screen flex items-center justify-center page-enter"><div className="spinner w-10 h-10"></div></div>;

  const handleSave = async () => {
    if (!form.title.trim()) {
      setTouched({ title: true });
      return;
    }
    const tagsArray = form.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    await api.put(`/events/${eventId}`, {
      title: form.title,
      description: form.description,
      tags: tagsArray,
      date: form.date.toISOString().split('T')[0],
      duration_days: form.duration_days,
    });
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 page-enter" style={{ background: 'linear-gradient(165deg, #e0f8f5 0%, #b8f0e9 25%, #a0eae3 50%, #88e3dd 75%, #6dd9d6 100%)' }}>
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl bg-white/70 backdrop-blur-md flex items-center justify-center mb-4 shadow-md">
          <ArrowLeft size={18} className="text-teal-700" />
        </button>
        <div className="card-modern">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-4">Редактировать мероприятие</h2>
          <div className="space-y-4">
            <div>
              <input type="text" placeholder="Название" className={`input-field ${touched.title && !form.title.trim() ? 'input-error' : ''}`} value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); setTouched({ title: true }); }} />
              {touched.title && !form.title.trim() && <p className="text-red-500 text-sm mt-1">Введите название мероприятия</p>}
            </div>
            <textarea placeholder="Описание" className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <DatePicker selected={form.date} onChange={(date: Date | null) => date && setForm({ ...form, date })} minDate={new Date()} dateFormat="dd.MM.yyyy" className="input-field" />
            </div>
            <input type="number" min="1" placeholder="Длительность (дней)" className="input-field" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: parseInt(e.target.value) || 1 })} />
            <input type="text" placeholder="Теги через запятую" className="input-field" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
            <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}