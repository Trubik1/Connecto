import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { saveEventId } from '../services/userStorage';
import { KeyRound, QrCode } from 'lucide-react';

export default function JoinByCode() {
  const navigate = useNavigate();
  const { qr } = useParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState<any>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      toast.error('Сначала создайте профиль');
      navigate('/profile/create');
      return;
    }
    if (qr) {
      joinEvent(qr);
    }
  }, [navigate, qr, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!code.trim()) return;
    joinEvent(code.trim());
  };

  const joinEvent = async (qrOrCode: string) => {
    setLoading(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qrOrCode);
      const endpoint = isUUID ? `/events/qr/${qrOrCode}` : `/events/code/${qrOrCode}`;
      const res = await api.get<{ id: number; title: string }>(endpoint);
      const event = res.data;
      if (!event?.id) {
        toast.error('Мероприятие не найдено');
        return;
      }
      const userId = localStorage.getItem('currentUserId');
      if (!userId) {
        toast.error('Профиль не найден, создайте профиль');
        navigate('/profile/create');
        return;
      }
      try {
        await api.post('/users/register-to-event', { userId, eventId: event.id });
      } catch (regErr: any) {
        if (regErr.response?.status !== 409) throw regErr;
      }
      saveEventId(String(event.id));
      localStorage.setItem('currentEventId', String(event.id));
      toast.success(`Добро пожаловать на ${event.title}`);
      navigate(`/lenta/${event.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Неверный код мероприятия');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const newScanner = new Html5Qrcode('qr-reader');
      setScanner(newScanner);
      setShowScanner(true);
      newScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          newScanner.stop();
          setShowScanner(false);
          joinEvent(decodedText);
        },
        (errorMessage: string) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      toast.error('Не удалось запустить сканер');
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop().then(() => setShowScanner(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 page-enter" style={{ background: 'linear-gradient(160deg, #e0f7f4 0%, #f0fff8 50%, #ffffff 100%)' }}>
      <div className="card w-full max-w-md card-enter">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-center mb-4">Вход на мероприятие</h1>

        <button
          type="button"
          onClick={startScanner}
          className="btn-primary w-full flex justify-center gap-2 mb-4"
        >
          <QrCode size={20} />
          Сканировать QR
        </button>

        <div className="relative my-4">
          <hr className="border-gray-300" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">или</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder=" "
            className={`input-field text-center text-xl sm:text-2xl tracking-widest ${touched && !code.trim() ? 'input-error' : ''}`}
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setTouched(true); }}
            maxLength={6}
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
            {loading ? <div className="spinner w-5 h-5 border-2"></div> : <KeyRound size={20} />}
            Войти
          </button>
        </form>

        <div className="mt-3">
          <button type="button" onClick={() => navigate('/profile/create')} className="btn-secondary w-full">
            Регистрация
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-center">Сканируйте QR-код</h3>
            <div id="qr-reader" className="w-full mb-4"></div>
            <button type="button" onClick={stopScanner} className="btn-secondary w-full">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}