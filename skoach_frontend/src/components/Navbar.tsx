import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postLogout } from '../apis/auth';
import { LOCAL_STORAGE_KEY } from '../constants/key';
import { Menu, LogOut, User, AlertCircle } from 'lucide-react'; 

interface NavbarProps {
  onMenuClick?: () => void; 
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { isLoggedIn, logout, userName } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const queryClient = useQueryClient();
  
  // 모달의 열림/닫힘 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: logoutMutation } = useMutation({
    mutationFn: (token: string | null) => postLogout(token), 
    onSuccess: async () => {
      await logout(); 
      queryClient.clear();
      window.localStorage.removeItem("userName");
      window.localStorage.removeItem("userId");
      setIsModalOpen(false);
      navigate("/", { replace: true });
    },
    onError: (error) => {
      console.error("로그아웃 실패: ", error);
      logout();
      queryClient.clear();
      window.localStorage.removeItem("userName");
      window.localStorage.removeItem("userId");
      localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
      localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
      setIsModalOpen(false);
      window.location.href = "/";
    },
  });

  const handleLogoutConfirm = () => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
    logoutMutation(token);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm py-3 text-[#2D2D2D]' 
            : 'bg-transparent py-5 text-[#2D2D2D]' 
        }`}
      >
        <div className="w-full px-6 sm:px-10 flex justify-between items-center">
          
          <div className="flex items-center gap-12">
            <Link 
              to="/" 
              className="text-2xl font-black tracking-tighter bg-[#2D2D2D] text-white px-4 py-1.5 rounded-xl cursor-pointer hover:bg-black transition-colors"
            >
              SKOACH
            </Link>
          
            <div className="hidden md:flex items-center gap-8">
              {!isLoggedIn ? (
                <>
                  <Link to="/service-introduction" className="relative inline-block text-lg text-[#606060] font-bold pb-1 transition-all duration-300 ease-in-out hover:scale-105 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300">
                    서비스 소개
                  </Link>
                  <Link to="/pricing-introduction" className="relative inline-block text-lg text-[#606060] font-bold pb-1 transition-all duration-300 ease-in-out hover:scale-105 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300">
                    요금 안내
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/script-method-select" className="relative inline-block text-lg text-[#606060] font-bold pb-1 transition-all duration-300 ease-in-out hover:scale-105 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300">
                    대본 생성
                  </Link>
                  <Link to="/coaching-setup" className="relative inline-block text-lg text-[#606060] font-bold pb-1 transition-all duration-300 ease-in-out hover:scale-105 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300">
                    발표 코칭
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => navigate('/log-in')} 
                  className="text-lg font-bold px-5 py-2.5 text-gray-600 hover:bg-gray-100/60 rounded-xl transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="text-lg font-bold bg-[#2D2D2D] text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/5 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                  <User size={16} className="text-blue-600" />
                  {/* 💡 레이아웃 흔들림 방지를 위해 transition-transform 및 배율 미세 조정 */}
                  <button 
                    onClick={() => navigate('/my-page')} 
                    className="text-lg font-bold text-blue-700 hover:underline hover:scale-[1.03] transform transition-transform duration-200 cursor-pointer inline-block origin-left"
                  >
                    {userName}
                  </button>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50/50 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  <span className="text-lg font-bold">Logout</span>
                </button>
              </div>
            )}

            <button
              onClick={onMenuClick}
              className="md:hidden p-2 text-[#2D2D2D] hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>

        </div>
      </nav>

      {/* 커스텀 로그아웃 안내 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              로그아웃 하시겠습니까?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              로그아웃하시면 서비스 이용을 위해 <br />다시 로그인해야 합니다.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-95 cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;