import { useLocation, useNavigate } from 'react-router-dom';
import { UserInfo } from '../common/UserInfo';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMainPage = location.pathname === '/';

  return (
    <header className="flex justify-between items-center p-6 h-20 border-b border-gray-100 bg-white sticky top-0 z-50">
      {/* 왼쪽 로고/내비게이션 영역 */}
      <div className="flex items-center gap-4">
        {/* 1. 뒤로가기 버튼: 메인 페이지가 아닐 때만 렌더링 */}
        {!isMainPage && (
          <button 
            onClick={() => navigate(-1)}
            className="text-2xl text-gray-400 hover:text-black transition-colors cursor-pointer focus:outline-none"
            aria-label="Go back"
          >
            ◀
          </button>
        )}

        {/* 2. 로고 텍스트: 클릭 시 무조건 메인('/')으로 이동 */}
        <span 
          onClick={() => navigate('/')}
          className="text-xl font-extrabold tracking-tighter font-noto cursor-pointer select-none hover:opacity-70 transition-opacity"
        >
          SKOACH
        </span>
      </div>

      {/* 우측 영역 */}
      <div>
        {isMainPage ? (
          <div className="flex gap-4">
            <button className="px-5 py-1.5 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
              Log In
            </button>
            <button className="px-5 py-1.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
              Sign Up
            </button>
          </div>
        ) : (
          <UserInfo name="UserName" />
        )}
      </div>
    </header>
  );
};