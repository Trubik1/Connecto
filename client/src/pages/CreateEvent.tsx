import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Sparkles, Plus } from 'lucide-react';

const TAG_OPTIONS = ['IT', 'Наука', 'Спорт', 'Творчество', 'Образование', 'Бизнес', 'Здоровье', 'Общество', 'Культура', 'Технологии'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const manualInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    selectedTags: string[];
    start_date: Date;
    end_date: Date;
  }>({
    title: '',
    description: '',
    selectedTags: [],
    start_date: new Date(),
    end_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    })(),
  });

  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');
  const [createdEvent, setCreatedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ title: false, tags: false });

  const toggleTag = useCallback((tag: string) => {
    setForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }));
    setTouched(prev => ({ ...prev, tags: false }));
  }, []);

  const addCustomTag = () => {
    const val = customTag.trim();
    if (!val) return;
    if (form.selectedTags.includes(val)) {
      toast.error('Такой тег уже выбран');
      return;
    }
    setForm(prev => ({ ...prev, selectedTags: [...prev.selectedTags, val] }));
    setCustomTag('');
    manualInputRef.current?.focus();
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTouched = {
      title: !form.title.trim(),
      tags: form.selectedTags.length === 0,
    };
    setTouched(newTouched);
    if (!form.title.trim()) { setError('Название обязательно'); return; }
    if (form.selectedTags.length === 0) { setError('Выберите хотя бы один тег'); return; }
    if (form.end_date < form.start_date) { setError('Дата окончания не может быть раньше даты начала'); return; }
    setIsLoading(true);
    try {
      const res = await api.post('/events', {
        title: form.title,
        description: form.description,
        tags: form.selectedTags,
        start_date: form.start_date.toISOString().split('T')[0],
        end_date: form.end_date.toISOString().split('T')[0],
        organizerId: localStorage.getItem('organizerId') || 'org-001',
      });
      setCreatedEvent(res.data);
      toast.success('Мероприятие создано!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании');
    } finally { setIsLoading(false); }
  };

  const closeModal = () => { navigate(`/event/${createdEvent.id}`); };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6" style={{ background: 'linear-gradient(160deg, #4DD0E1 0%, #E0F7FA 55%, #ffffff 100%)' }}>
      <div className="card-modern w-full max-w-sm sm:max-w-md shadow-xl p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <div className="input-group">
              <input type="text" placeholder=" " className={`input-field ${touched.title && !form.title.trim() ? 'input-error' : ''}`} value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); setTouched({ ...touched, title: true }); }} required />
              <label>Введите название мероприятия</label>
            </div>
            {touched.title && !form.title.trim() && <p className="text-red-500 text-sm mt-1">Введите название мероприятия</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea className="input-field" rows={3} placeholder="Расскажите о мероприятии..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <DatePicker selected={form.start_date} onChange={date => date && setForm({ ...form, start_date: date })} dateFormat="dd.MM.yyyy" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <DatePicker selected={form.end_date} onChange={date => date && setForm({ ...form, end_date: date })} dateFormat="dd.MM.yyyy" className="input-field" minDate={form.start_date} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Теги</label>
            {touched.tags && form.selectedTags.length === 0 && <p className="text-red-500 text-sm mb-1">Выберите хотя бы один тег</p>}
            <div className="flex flex-wrap gap-x-2 gap-y-1.5">
              {TAG_OPTIONS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-pill text-center leading-snug ${form.selectedTags.includes(tag) ? 'tag-pill-active' : ''}`}
                  style={{ width: 'calc(50% - 8px)', flexShrink: 0 }}
                >{tag}</button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input ref={manualInputRef} type="text" value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={handleCustomKeyDown} placeholder="Добавить свой тег и нажмите Enter" className="input-field text-sm" />
              <button type="button" onClick={addCustomTag} className="btn-add" aria-label="Добавить тег"><Plus size={16} /></button>
            </div>

            {form.selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="tag-selected flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleTag(tag)}
                    title="Удалить тег"
                  >
                    {tag}
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/40 text-current leading-none text-[10px] font-bold">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50/60 text-red-700 p-3 rounded-xl text-sm">{error}</div>
          )}

          <button type="submit" disabled={isLoading || form.selectedTags.length === 0} className="btn-primary w-full py-3 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <div className="spinner w-5 h-5 border-2 border-white border-t-transparent"></div> : <Sparkles size={20} />}
            {isLoading ? 'Создание...' : 'Создать мероприятие'}
          </button>
        </form>
      </div>

      {createdEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-green-accent mb-2">Мероприятие создано!</h2>
            <p className="text-gray-600 mb-4">Поделитесь кодом или QR-кодом с участниками</p>
            <QRCodeDisplay value={`${window.location.origin}/join/${createdEvent.qrCode}`} />
            <div className="mt-4 p-4 bg-mint-50 rounded-xl">
              <p className="text-sm text-gray-600">Код для входа</p>
              <p className="text-4xl font-mono font-bold text-green-accent tracking-widest my-2">{createdEvent.accessCode}</p>
              <button onClick={() => { navigator.clipboard.writeText(createdEvent.accessCode); toast.success('Код скопирован'); }} className="btn-secondary text-sm px-4 py-1">Копировать</button>
            </div>
            <button onClick={closeModal} className="btn-primary w-full mt-4">Перейти к дашборду</button>
          </div>
        </div>
      )}
    </div>
  );
}
