import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CalendarPlus, User, LayoutGrid, MessageCircle, Home } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  // Определяем, какие иконки подсвечены
  const isActive = (p: string) => path.startsWith(p);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mint-50 to-white">
      {/* Верхний хедер */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">
            Connecto
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/create"
              className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-full transition-colors ${isActive('/create') ? 'bg-teal-500 text-white' : 'text-teal-700 hover:bg-teal-50'
                }`}
            >
              Создать
            </Link>
            <Link
              to="/organizer/profile"
              className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-full transition-colors ${isActive('/organizer') ? 'bg-teal-500 text-white' : 'text-teal-700 hover:bg-teal-50'
                }`}
            >
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 pb-20 sm:pb-4">{children}</main>

      {/* Нижняя навигация для мобильных */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/90 backdrop-blur-lg border-t border-teal-100 shadow-lg">
        <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${path === '/' ? 'text-teal-600' : 'text-gray-400'
              }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Главная</span>
          </Link>
          <Link
            to="/create"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive('/create') ? 'text-teal-600' : 'text-gray-400'
              }`}
          >
            <CalendarPlus size={20} />
            <span className="text-[10px] font-medium">Создать</span>
          </Link>
          <Link
            to="/join"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive('/join') ? 'text-teal-600' : 'text-gray-400'
              }`}
          >
            <LayoutGrid size={20} />
            <span className="text-[10px] font-medium">Войти</span>
          </Link>
          <Link
            to="/requests"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive('/requests') ? 'text-teal-600' : 'text-gray-400'
              }`}
          >
            <MessageCircle size={20} />
            <span className="text-[10px] font-medium">Запросы</span>
          </Link>
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${isActive('/profile') ? 'text-teal-600' : 'text-gray-400'
              }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
