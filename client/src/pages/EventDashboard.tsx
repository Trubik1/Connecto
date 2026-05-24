import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function EventDashboard() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/stats`)
      ])
        .then(([eventRes, statsRes]) => {
          setEvent(eventRes.data);
          setStats(statsRes.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Ошибка загрузки данных');
          setLoading(false);
        });
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter">
        <div className="spinner w-10 h-10 border-2 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  if (!event || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter">
        <p className="text-gray-500">Мероприятие не найдено</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:p-6 page-enter" style={{ background: 'linear-gradient(165deg, #e0f8f5 0%, #b8f0e9 25%, #a0eae3 50%, #88e3dd 75%, #6dd9d6 100%)' }}>
      <div className="card-modern max-w-lg mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-2">{event.title}</h1>

        {/* Дата */}
        <p className="text-gray-600 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Calendar size={16} className="text-teal-600 flex-shrink-0" />
          <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
        </p>

        {event.description && (
          <p className="text-gray-700 mb-4 pl-3 py-1 bg-teal-50/30 rounded-r-lg text-sm sm:text-base">
            {event.description}
          </p>
        )}

        {/* Код для участников */}
        <div className="card-modern mb-4 bg-gradient-to-br from-teal-50 to-cyan-50 !p-4">
          <p className="text-sm text-teal-700 font-medium mb-2">Код для участников:</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text tracking-widest break-all">
              {event.accessCode}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(event.accessCode);
                toast.success('Код скопирован');
              }}
              className="btn-secondary px-3 py-1.5 text-sm"
            >
              Копировать
            </button>
          </div>
        </div>

        {/* QR код */}
        <button onClick={() => setShowQr(true)} className="btn-primary w-full mb-5 py-3">
          📱 Показать QR-код
        </button>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="stats-card">
            <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.usersCount}</p>
            <p className="text-xs sm:text-sm text-gray-600">Участников</p>
          </div>
          <div className="stats-card">
            <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.contactsMade}</p>
            <p className="text-xs sm:text-sm text-gray-600">Знакомств</p>
          </div>
          <div className="stats-card">
            <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.requestsSent}</p>
            <p className="text-xs sm:text-sm text-gray-600">Запросов отправлено</p>
          </div>
          <div className="stats-card">
            <p className="text-xl sm:text-2xl font-bold text-teal-700">{stats.requestsAccepted}</p>
            <p className="text-xs sm:text-sm text-gray-600">Запросов принято</p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="space-y-2">
          <Link to={`/lenta/${eventId}`} className="btn-primary w-full text-center block text-sm sm:text-base py-3">
            Перейти к ленте
          </Link>
          <Link to={`/event/${eventId}/edit`} className="btn-secondary w-full text-center block text-sm sm:text-base py-3">
            Редактировать мероприятие
          </Link>
        </div>
      </div>

      {showQr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern max-w-sm w-full text-center">
            <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">QR-код мероприятия</h3>
            <QRCodeDisplay value={`${window.location.origin}/join/${event.qrCode}`} />
            <p className="text-xs sm:text-sm text-teal-600 mt-3 break-all font-mono">
              /join/{event.qrCode}
            </p>
            <button onClick={() => setShowQr(false)} className="btn-primary mt-4 w-full">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}