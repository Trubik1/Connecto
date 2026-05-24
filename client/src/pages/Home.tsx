import { useNavigate } from 'react-router-dom';
import { KeyRound, CalendarPlus, UserPlus, User, CalendarDays } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center min-w-0 relative px-4" style={{ background: 'linear-gradient(165deg, #00897B 0%, #26C6DA 30%, #4DD0E1 60%, #E0F7FA 100%)' }}>
      {/* Градиентная подложка */}
      <div className="fixed top-0 right-0 -z-10 h-[60vh] w-[70vw] bg-[radial-gradient(ellipse_at_top_right,_#B2EBF2_0%,_transparent_70%)] pointer-events-none" />

      {/* Кнопки в правом верхнем углу - адаптивные */}
      <div className="absolute top-3 right-3 left-3 flex gap-1.5 justify-end flex-wrap sm:top-4 sm:right-4 sm:left-auto">
        <button
          onClick={() => navigate('/create')}
          className="btn-secondary px-2.5 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-sm flex items-center gap-1 sm:gap-1.5"
          title="Создать мероприятие"
        >
          <CalendarDays size={14} />
          <span>Создать</span>
        </button>
        <button
          onClick={() => navigate('/profile/create')}
          className="btn-secondary px-2.5 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-sm flex items-center gap-1 sm:gap-1.5"
          title="Создать профиль"
        >
          <CalendarPlus size={14} />
          <span>Профиль</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="btn-secondary px-2.5 py-1.5 text-[10px] sm:px-3 sm:py-2 sm:text-sm flex items-center gap-1 sm:gap-1.5"
          title="Профиль"
        >
          <User size={14} />
          <span>Войти</span>
        </button>
      </div>

      <div className="card-modern w-full max-w-md text-center mx-4 sm:mx-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text mb-2">Connecto</h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Нетворкинг на мероприятиях</p>

        <button
          onClick={() => navigate('/join')}
          className="btn-primary w-full flex items-center justify-center gap-3 text-base sm:text-lg py-3.5 sm:py-4 mb-4"
        >
          <KeyRound size={20} />
          Войти по коду
        </button>
      </div>
    </div>
  );
}
